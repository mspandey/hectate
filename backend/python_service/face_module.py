# -*- coding: utf-8 -*-
"""
face_module.py — Hectate Robust Face Verification Pipeline
===========================================================
Handles liveness + face matching in real-world conditions.
Gender enforcement is done via Aadhaar OCR — NOT here.

Pipeline:
  1. Frame selection  — pick sharpest/best-lit frame from pool
  2. Face detection   - RetinaFace -> MTCNN -> OpenCV cascade
  3. Liveness check   — MediaPipe EAR blink detection
  4. Face embedding   — ArcFace cosine similarity (selfie vs document)
  5. Confidence score — liveness 40% + face match 60%

Usage:
    from face_module import run_face_verification
    result = run_face_verification(liveness_frames, selfie_frame, document_photo)
"""

import base64
import cv2
import numpy as np


# ── Lazy imports to avoid startup crash if optional libs are missing ──────────
_deepface = None
_retinaface = None


def _load_deepface():
    global _deepface
    if _deepface is None:
        try:
            from deepface import DeepFace
            _deepface = DeepFace
            print("[FACE] DeepFace loaded successfully.")
        except ImportError:
            print("[FACE][WARN] DeepFace not installed. Face features will be degraded.")
    return _deepface


# ═══════════════════════════════════════════════════════════════════════════════
# UTILITY: Base64 -> OpenCV image
# ═══════════════════════════════════════════════════════════════════════════════
def b64_to_cv2(b64_string: str) -> np.ndarray | None:
    """
    Converts a base64-encoded image string (with or without data-URI prefix)
    to an OpenCV BGR numpy array.
    Returns None on failure instead of raising — callers must handle None.
    """
    if not b64_string:
        return None
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]
    try:
        raw = base64.b64decode(b64_string)
        arr = np.frombuffer(raw, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img  # may still be None if cv2.imdecode failed
    except Exception as e:
        print(f"[FACE] b64_to_cv2 failed: {e}")
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — FRAME SELECTION: Pick the best frame from a pool of candidates
# ═══════════════════════════════════════════════════════════════════════════════
def score_frame_quality(img: np.ndarray) -> float:
    """
    Scores a frame on two dimensions and returns a combined quality score (0-100):

    Sharpness (Laplacian variance):
        A blurry frame has low gradient magnitudes. We compute the variance of
        the Laplacian (edge-strength map). Higher = sharper.
        Threshold: <100 is considered blurry for face recognition.

    Brightness:
        Too dark (<50) or too bright (>220) frames hurt embedding quality.
        We score the mean luminance on a bell curve centered at 128.

    The frame with the highest score is chosen as the "best selfie".
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Sharpness: variance of Laplacian (Brenner measure)
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    sharpness_score = min(100.0, lap_var / 10)  # cap at 100

    # Brightness: penalty for too dark or too bright
    mean_brightness = np.mean(gray)
    # Bell curve: peaks at 128, drops off at extremes
    brightness_score = 100 * np.exp(-((mean_brightness - 128) ** 2) / (2 * 60 ** 2))

    combined = 0.65 * sharpness_score + 0.35 * brightness_score
    return float(combined)


def select_best_frame(frames_b64: list[str]) -> tuple[np.ndarray | None, float]:
    """
    Given a list of base64 frames, returns (best_frame_cv2, quality_score).
    The best frame is the one with the highest quality score.
    Returns (None, 0.0) if no valid frame can be decoded.
    """
    best_img = None
    best_score = -1.0

    for i, b64 in enumerate(frames_b64):
        img = b64_to_cv2(b64)
        if img is None:
            continue
        score = score_frame_quality(img)
        print(f"[FACE] Frame {i}: quality={score:.1f}")
        if score > best_score:
            best_score = score
            best_img = img

    return best_img, best_score


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2 — FACE DETECTION: RetinaFace via DeepFace detector backend
# ═══════════════════════════════════════════════════════════════════════════════
def detect_and_align_face(img: np.ndarray) -> np.ndarray | None:
    """
    Uses RetinaFace — a landmark-based multi-stage face detector that:
    - Handles faces at angles up to ~70° (profile views)
    - Detects small faces in low-resolution frames
    - Returns 5-point landmark coordinates (used for alignment)

    We use DeepFace's built-in extract_faces() which wraps RetinaFace and
    automatically aligns the face based on eye landmarks before returning
    the cropped face patch. Alignment is critical for embedding accuracy.

    Falls back to MTCNN (slower but accurate) if RetinaFace misses the face,
    then to OpenCV Haar (fastest but weakest) as a last resort.
    """
    df = _load_deepface()
    if df is None:
        return None

    detectors_to_try = ['retinaface', 'mtcnn', 'opencv']

    for backend in detectors_to_try:
        try:
            faces = df.extract_faces(
                img_path=img,
                detector_backend=backend,
                enforce_detection=True,
                align=True,                # Align by eye landmarks — key for accuracy
                expand_percentage=5,       # Slight expansion to include full face contour
            )
            if faces and faces[0].get('confidence', 0) > 0.85:
                print(f"[FACE] Detected face with backend={backend}, confidence={faces[0]['confidence']:.2f}")
                # DeepFace returns normalized 0-1 float array; convert to uint8 BGR
                face_arr = faces[0]['face']
                if face_arr.max() <= 1.0:
                    face_arr = (face_arr * 255).astype(np.uint8)
                return face_arr
        except Exception as e:
            print(f"[FACE] Backend {backend} failed: {e}")
            continue

    print("[FACE] All detectors failed to find a face.")
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3 — LIVENESS DETECTION: EAR blink detection across frames
# ═══════════════════════════════════════════════════════════════════════════════
def _eye_aspect_ratio(eye_points: list) -> float:
    """
    Computes the Eye Aspect Ratio (EAR) from 6 eye landmark coordinates.
    EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
    A closed eye has EAR < ~0.2; an open eye has EAR > 0.25.
    """
    def dist(a, b):
        return np.linalg.norm(np.array(a) - np.array(b))

    # Vertical distances
    A = dist(eye_points[1], eye_points[5])
    B = dist(eye_points[2], eye_points[4])
    # Horizontal distance
    C = dist(eye_points[0], eye_points[3])
    return (A + B) / (2.0 * C) if C > 0 else 0


def detect_liveness(frames_b64: list[str]) -> dict:
    """
    Liveness detection strategy:
    ────────────────────────────
    We look for a natural blink pattern across 10-30 frames:
      - At least 3 frames must show open eyes (EAR > 0.25)
      - At least 1 frame must show a closed eye (EAR < 0.20) — the blink

    This approach defeats static photo spoofing (no blink possible).
    We use dlib 68-landmark or MediaPipe Face Mesh for eye points.

    If landmarks are unavailable (no dlib/mediapipe), we fall back to a
    simpler eye-cascade approach with reduced confidence.

    Returns:
        {
            "is_live": bool,
            "open_frames": int,
            "closed_frames": int,
            "confidence": float  # 0.0 - 1.0
        }
    """
    # Try MediaPipe Face Mesh for EAR landmarks
    try:
        return _liveness_mediapipe(frames_b64)
    except Exception as e:
        print(f"[FACE][LIVENESS] MediaPipe EAR failed ({e}), falling back to cascade.")

    # Fallback: OpenCV eye cascade
    return _liveness_cascade_fallback(frames_b64)


def _liveness_mediapipe(frames_b64: list[str]) -> dict:
    """
    Uses MediaPipe Face Mesh to get 468 landmarks per frame.
    Eye landmarks (indices 33,160,158,133,153,144 for left eye; 362,385,387,263,373,380 for right)
    are used to compute EAR and detect blinks.
    """
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh

    # MediaPipe landmark indices for left/right eye EAR calculation
    LEFT_EYE  = [33, 160, 158, 133, 153, 144]
    RIGHT_EYE = [362, 385, 387, 263, 373, 380]
    EAR_OPEN_THRESH   = 0.25
    EAR_CLOSED_THRESH = 0.20

    open_frames   = 0
    closed_frames = 0
    total_valid   = 0

    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:
        for b64 in frames_b64:
            img = b64_to_cv2(b64)
            if img is None:
                continue
            h, w = img.shape[:2]
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            result = face_mesh.process(rgb)

            if not result.multi_face_landmarks:
                continue

            lm = result.multi_face_landmarks[0].landmark
            total_valid += 1

            def get_pt(idx):
                return [lm[idx].x * w, lm[idx].y * h]

            left_ear  = _eye_aspect_ratio([get_pt(i) for i in LEFT_EYE])
            right_ear = _eye_aspect_ratio([get_pt(i) for i in RIGHT_EYE])
            ear = (left_ear + right_ear) / 2.0

            if ear >= EAR_OPEN_THRESH:
                open_frames += 1
            elif ear <= EAR_CLOSED_THRESH:
                closed_frames += 1

    is_live = open_frames >= 3 and closed_frames >= 1
    confidence = min(1.0, (open_frames * 0.08) + (closed_frames * 0.2))
    print(f"[FACE][LIVENESS] MediaPipe: open={open_frames}, closed={closed_frames}, live={is_live}")
    return {"is_live": is_live, "open_frames": open_frames, "closed_frames": closed_frames, "confidence": round(confidence, 2)}


def _liveness_cascade_fallback(frames_b64: list[str]) -> dict:
    """
    Simple fallback: Haar cascade eye detection.
    Less precise but doesn't require dlib/MediaPipe mesh.
    """
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade  = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

    open_frames   = 0
    closed_frames = 0

    for b64 in frames_b64:
        img = b64_to_cv2(b64)
        if img is None:
            continue
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
        if len(faces) == 0:
            continue
        x, y, w, h = faces[0]
        roi = gray[y:y + h, x:x + w]
        eyes = eye_cascade.detectMultiScale(roi, 1.05, 10)
        if len(eyes) >= 2:
            open_frames += 1
        elif len(eyes) == 0:
            closed_frames += 1

    is_live = open_frames >= 3 and closed_frames >= 1
    confidence = min(1.0, (open_frames * 0.06) + (closed_frames * 0.15))
    print(f"[FACE][LIVENESS] Cascade: open={open_frames}, closed={closed_frames}, live={is_live}")
    return {"is_live": is_live, "open_frames": open_frames, "closed_frames": closed_frames, "confidence": round(confidence, 2)}


# NOTE: Gender analysis removed. Gender is enforced via Aadhaar OCR, not face detection.


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — FACE MATCH: ArcFace cosine similarity with calibrated threshold
# ═══════════════════════════════════════════════════════════════════════════════
def match_faces(selfie_img: np.ndarray, document_img: np.ndarray) -> dict:
    """
    Compares selfie face vs document face using ArcFace embeddings.

    Why ArcFace?
    - Uses additive angular margin during training, forcing the model to learn
      highly discriminative features (especially for cross-condition scenarios).
    - Outperforms VGG-Face and Facenet on LFW, CFP-FP, and AgeDB benchmarks.
    - Particularly robust to lighting and pose variation.

    Distance metric: cosine similarity (better than Euclidean for high-dim embeddings).

    Threshold calibration (ArcFace cosine):
    - < 0.40: Definite match (same person, different conditions)
    - 0.40 – 0.55: Probable match (use with other signals)
    - > 0.55: Likely different people

    We use 0.50 as the verification threshold (generous to reduce false negatives)
    because real-world ID photos can be years old with significant appearance changes.

    Confidence = 1 - (distance / threshold), clamped to 0-100.
    """
    df = _load_deepface()
    if df is None:
        return {"is_match": False, "match_score": 0.0, "distance": 1.0, "error": "DeepFace unavailable"}

    ARCFACE_THRESHOLD = 0.50  # Cosine distance threshold

    try:
        result = df.verify(
            img1_path=selfie_img,
            img2_path=document_img,
            model_name='ArcFace',           # Best model for real-world face match
            detector_backend='retinaface',  # Best detector for ID card photos
            distance_metric='cosine',       # Cosine is best for ArcFace embeddings
            enforce_detection=False,        # Don't crash if document photo is low quality
            align=True,
        )

        distance = result.get('distance', 1.0)
        is_match = distance <= ARCFACE_THRESHOLD

        # Map distance to a confidence score:
        # distance=0 -> score=100, distance=threshold -> score=0
        confidence = max(0.0, (1.0 - distance / ARCFACE_THRESHOLD) * 100)

        print(f"[FACE][MATCH] ArcFace distance={distance:.4f}, threshold={ARCFACE_THRESHOLD}, match={is_match}, confidence={confidence:.1f}%")
        return {
            "is_match": is_match,
            "match_score": round(confidence, 1),
            "distance": round(distance, 4),
        }

    except Exception as e:
        print(f"[FACE][MATCH] ArcFace verification failed: {e}")

        # Retry with Facenet512 as fallback (second-best for robustness)
        try:
            print("[FACE][MATCH] Retrying with Facenet512...")
            result = df.verify(
                img1_path=selfie_img,
                img2_path=document_img,
                model_name='Facenet512',
                detector_backend='mtcnn',
                distance_metric='cosine',
                enforce_detection=False,
                align=True,
            )
            distance = result.get('distance', 1.0)
            FACENET_THRESHOLD = 0.30  # Facenet512 cosine threshold
            is_match = distance <= FACENET_THRESHOLD
            confidence = max(0.0, (1.0 - distance / FACENET_THRESHOLD) * 100)
            print(f"[FACE][MATCH] Facenet512 fallback: distance={distance:.4f}, match={is_match}")
            return {
                "is_match": is_match,
                "match_score": round(confidence, 1),
                "distance": round(distance, 4),
                "fallback_model": "Facenet512",
            }
        except Exception as e2:
            print(f"[FACE][MATCH] Facenet512 also failed: {e2}")
            return {"is_match": False, "match_score": 0.0, "distance": 1.0, "error": str(e2)}


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════
def run_face_verification(
    liveness_frames: list[str],
    selfie_frame: str | None = None,
    document_photo: str | None = None,
) -> dict:
    """
    Face verification pipeline: liveness + optional face match.
    Gender is NOT checked here — it comes from Aadhaar OCR.

    Args:
        liveness_frames: Base64 webcam frames for blink/liveness check.
        selfie_frame:    Best selfie frame (optional; falls back to best liveness frame).
        document_photo:  Base64 ID card photo for face match (optional).

    Returns:
        {
            "success": bool,
            "liveness": bool,
            "liveness_confidence": float,
            "is_match": bool,
            "match_score": float,        # 0-100
            "overall_confidence": float, # liveness 40% + match 60%
            "decision": str,
            "mock": bool,
        }
    """
    # ── Resolve selfie image ──────────────────────────────────────────────────
    selfie_img = b64_to_cv2(selfie_frame) if selfie_frame else None

    # If no selfie provided or decode failed, use best liveness frame
    if liveness_frames:
        best_frame, quality = select_best_frame(liveness_frames)
        if best_frame is not None:
            if selfie_img is None or quality > score_frame_quality(selfie_img):
                print(f"[FACE] Using best liveness frame (quality={quality:.1f}) as selfie.")
                selfie_img = best_frame

    if selfie_img is None:
        return _face_fail("No usable image found — provide selfie or liveness frames.")

    # ── Liveness detection ────────────────────────────────────────────────────
    liveness_result = detect_liveness(liveness_frames) if liveness_frames else {
        "is_live": True, "confidence": 0.5, "open_frames": 0, "closed_frames": 0
    }
    is_live      = liveness_result["is_live"]
    liveness_conf = liveness_result["confidence"]

    # ── Face alignment ────────────────────────────────────────────────────────
    aligned_face    = detect_and_align_face(selfie_img)
    face_for_match  = aligned_face if aligned_face is not None else selfie_img

    # ── Face match (selfie vs document — optional) ────────────────────────────
    has_document = bool(document_photo)
    match_result = {"is_match": True, "match_score": 100.0, "distance": 0.0}
    if has_document:
        doc_img = b64_to_cv2(document_photo)
        if doc_img is not None:
            match_result = match_faces(face_for_match, doc_img)
    is_match   = match_result["is_match"]
    match_score = match_result.get("match_score", 0.0)

    # ── Overall confidence score ──────────────────────────────────────────────
    # liveness 40% + face match 60% (if document provided)
    # liveness 100% (if no document — liveness-only check)
    if has_document:
        overall = 0.40 * (liveness_conf * 100) + 0.60 * match_score
        success = is_live and is_match
    else:
        overall = liveness_conf * 100
        success = is_live

    decision = _build_decision_string(is_live, is_match, match_score, has_document)

    print(f"[FACE] Final: success={success}, liveness={is_live}, "
          f"match={is_match}({match_score:.1f}%), overall={overall:.1f}%")

    return {
        "success": success,
        "liveness": is_live,
        "liveness_confidence": round(liveness_conf, 2),
        "is_match": is_match,
        "match_score": round(match_score, 1),
        "distance": match_result.get("distance", None),
        "overall_confidence": round(overall, 1),
        "decision": decision,
        "mock": False,
    }


def _build_decision_string(is_live: bool, is_match: bool, match_score: float, has_document: bool) -> str:
    parts = []
    if not is_live:
        parts.append("Liveness check failed — blink not detected. Ensure good lighting and blink naturally.")
    if has_document and not is_match:
        parts.append(f"Selfie does not match ID document (score={match_score:.0f}%).")
    if not parts:
        return "All checks passed successfully."
    return " ".join(parts)


def _face_fail(reason: str) -> dict:
    return {
        "success": False,
        "liveness": False,
        "liveness_confidence": 0.0,
        "is_match": False,
        "match_score": 0.0,
        "distance": None,
        "overall_confidence": 0.0,
        "decision": reason,
        "mock": False,
    }


# ── Standalone test ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python face_module.py <selfie_image> [document_image]")
        sys.exit(1)

    def img_to_b64(path: str) -> str:
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode()

    selfie_b64   = img_to_b64(sys.argv[1])
    document_b64 = img_to_b64(sys.argv[2]) if len(sys.argv) > 2 else None

    result = run_face_verification([], selfie_b64, document_b64)
    print("\n===== FACE VERIFICATION RESULT =====")
    for k, v in result.items():
        print(f"  {k}: {v}")
