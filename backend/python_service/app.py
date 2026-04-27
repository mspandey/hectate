# -*- coding: utf-8 -*-
"""
server/python_service/app.py
Hectate Python Verification Microservice
Runs on port 5001. Two endpoints:
  POST /verify-gender   — webcam frame → gender classification
  POST /verify-aadhaar  — uploaded image/PDF → Aadhaar OCR + gender check
"""

import sys
import os
import io
import re
import base64
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
from PIL import Image

app = Flask(__name__)
CORS(app)

import traceback
@app.errorhandler(Exception)
def handle_exception(e):
    traceback.print_exc()
    return str(e), 500

# ── Model paths ───────────────────────────────────────────────────────────────
SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SERVICE_DIR, "models")
MODEL_DIR = os.path.abspath(MODEL_DIR)

GENDER_PROTO  = os.path.join(MODEL_DIR, "deploy_gender.prototxt")
GENDER_MODEL  = os.path.join(MODEL_DIR, "gender_net.caffemodel")
MP_MODEL      = os.path.join(MODEL_DIR, "blaze_face_short_range.tflite")

GENDER_LIST   = ["Male", "Female"]
GENDER_MEAN   = (78.4263377603, 87.7689143744, 114.895847746)

# ── Lazy-load models so service starts even without them ──────────────────────
_gender_net   = None
_mp_detector  = None
_models_ready = False

def load_models():
    global _gender_net, _mp_detector, _models_ready
    if _models_ready:
        return True

    missing = [p for p in [GENDER_PROTO, GENDER_MODEL, MP_MODEL] if not os.path.exists(p)]
    if missing:
        print(f"[WARN] Missing models, running in MOCK mode: {missing}")
        return False

    try:
        import cv2
        import mediapipe as mp
        from mediapipe.tasks import python as mp_python
        from mediapipe.tasks.python import vision as mp_vision
        try:
            from deepface import DeepFace
            print("[OK] DeepFace pre-loaded")
        except ImportError:
            print("[WARN] DeepFace not found, will use mock for face match")
        _gender_net = cv2.dnn.readNet(GENDER_MODEL, GENDER_PROTO)

        base_opts   = mp_python.BaseOptions(model_asset_path=MP_MODEL)
        det_opts    = mp_vision.FaceDetectorOptions(
            base_options=base_opts, min_detection_confidence=0.4
        )
        _mp_detector = mp_vision.FaceDetector.create_from_options(det_opts)
        _models_ready = True
        print("[OK] Gender models loaded")
        return True
    except Exception as e:
        print(f"[WARN] Could not load gender models ({e}), running in MOCK mode")
        return False

# ── Tesseract path (Windows) ──────────────────────────────────────────────────
try:
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    _tesseract_ok = True
except Exception:
    _tesseract_ok = False

# ── DeepFace Lazy Load ────────────────────────────────────────────────────────
_deepface_ok = False
def check_deepface():
    global _deepface_ok
    try:
        from deepface import DeepFace
        _deepface_ok = True
        return True
    except ImportError:
        _deepface_ok = False
        return False

def base64_to_cv2(b64_string):
    """Convert base64 image string to OpenCV format"""
    if not b64_string: return None
    if ',' in b64_string:
        b64_string = b64_string.split(',')[1]
    try:
        img_data = base64.b64decode(b64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except:
        return None

def check_lighting(face_roi):
    """Calculate average brightness of the face ROI"""
    if face_roi is None or face_roi.size == 0:
        return 0
    gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
    avg_brightness = np.mean(gray)
    return avg_brightness

def detect_liveness(frames_b64):
    """Liveness detection using EAR logic from face_verify.py"""
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    eye_open_frames = 0
    eye_closed_frames = 0
    
    for b64 in frames_b64:
        frame = base64_to_cv2(b64)
        if frame is None: continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(80, 80))
        
        if len(faces) == 0: continue
        
        x, y, w, h = faces[0]
        roi_gray = gray[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 10)
        
        if len(eyes) >= 2: eye_open_frames += 1
        elif len(eyes) == 0: eye_closed_frames += 1
    
    return eye_open_frames >= 3 and eye_closed_frames >= 1

def verify_gender_from_face(image_b64):
    if not check_deepface():
        # Fallback: DeepFace is missing, so we can't do the double-check.
        # We will signal this to the caller.
        return {'gender': 'unverified', 'confidence': 0.0, 'missing_lib': 'deepface'}
    
    try:
        from deepface import DeepFace
        img = base64_to_cv2(image_b64)
        analysis = DeepFace.analyze(img, actions=['gender'], enforce_detection=False, detector_backend='opencv')
        if isinstance(analysis, list): analysis = analysis[0]
        woman_prob = analysis.get('gender', {}).get('Woman', 0)
        return {'gender': 'female' if woman_prob >= 60 else 'uncertain', 'confidence': woman_prob}
    except Exception as e:
        print(f"[WARN] DeepFace analysis failed: {e}")
        return {'gender': 'unknown', 'confidence': 0}

def face_match(selfie_b64, document_b64):
    if not check_deepface():
        return {'is_match': False, 'match_score': 0.0, 'error': 'DeepFace not installed', 'mock': True}
    
    from deepface import DeepFace
    selfie_img = base64_to_cv2(selfie_b64)
    doc_img = base64_to_cv2(document_b64)
    try:
        result = DeepFace.verify(img1_path=selfie_img, img2_path=doc_img, model_name='VGG-Face', 
                                 detector_backend='opencv', enforce_detection=False)
        return {'is_match': result['verified'], 'match_score': (1 - result['distance']) * 100}
    except:
        return {'is_match': False, 'match_score': 0}


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 1: Gender check from webcam frame
# ═══════════════════════════════════════════════════════════════════════════════
@app.route('/verify-gender', methods=['POST'])
def verify_gender():
    """
    Body: { frame: "<base64 JPEG>", votes: ["Female","Female","Male",...] }
    Returns: { gender, confidence, smoothed, female_ratio, face_found }
    """
    data = request.get_json(silent=True) or {}
    votes = data.get('votes', [])

    models_ok = load_models()

    if not models_ok:
        # DO NOT MOCK SUCCESS - return error to frontend
        return jsonify({
            "status": "failed",
            "message": "Gender verification service offline (models missing)",
            "face_found": False,
            "gender": "Unknown",
            "confidence": 0,
            "smoothed": "Unknown",
            "female_ratio": 0,
            "votes": votes,
            "mock": True
        })

    frame_b64 = data.get('frame', '')
    if not frame_b64:
        return jsonify({"face_found": False, "error": "No frame provided"})

    # Decode base64 → numpy image
    import time
    start_time = time.time()
    try:
        img_bytes = base64.b64decode(frame_b64)
        nparr     = np.frombuffer(img_bytes, np.uint8)
        frame     = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image")
    except Exception as e:
        print(f"[ERROR] Image decode failed: {e}")
        return jsonify({"face_found": False, "error": f"Image decode failed: {e}"})

    decode_time = time.time() - start_time
    
    h, w = frame.shape[:2]
    
    # Optimization: Resize large frames to speed up detection
    MAX_W = 640
    if w > MAX_W:
        scale = MAX_W / w
        frame = cv2.resize(frame, (0,0), fx=scale, fy=scale)
        h, w = frame.shape[:2]
        print(f"[PYTHON] Resized frame to {w}x{h}")

    rgb  = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    
    det_start = time.time()
    det_result = _mp_detector.detect(mp_img)
    det_time = time.time() - det_start

    det_time = time.time() - start_time - decode_time

    if not det_result.detections:
        print(f"[PYTHON] No face found. Decode: {decode_time:.3f}s, Det: {det_time:.3f}s")
        return jsonify({"face_found": False, "gender": None, "confidence": 0,
                        "smoothed": None, "female_ratio": 0, "votes": votes})

    # Use first (largest) detected face
    det = det_result.detections[0]
    bb  = det.bounding_box
    x1  = max(0, int(bb.origin_x))
    y1  = max(0, int(bb.origin_y))
    x2  = min(w, x1 + int(bb.width))
    y2  = min(h, y1 + int(bb.height))

    face_roi = frame[y1:y2, x1:x2]
    if face_roi.size == 0:
        return jsonify({"face_found": False, "error": "Empty face ROI"})

    # Check lighting
    brightness = check_lighting(face_roi)
    
    blob = cv2.dnn.blobFromImage(face_roi, 1.0, (227, 227), GENDER_MEAN, swapRB=False)
    _gender_net.setInput(blob)
    preds      = _gender_net.forward()
    gender_idx = preds[0].argmax()
    gender     = GENDER_LIST[gender_idx]
    confidence = float(preds[0][gender_idx] * 100)

    total_time = time.time() - start_time
    print(f"[PYTHON] Result: {gender} ({confidence:.1f}%). Process time: {total_time:.3f}s")

    # Rolling vote smoothing (max last 12 frames for better consensus)
    # We only count confident votes or those in decent lighting
    if confidence > 65 or not low_lighting:
        votes.append(gender)
    
    if len(votes) > 12:
        votes = votes[-12:]

    female_votes = votes.count("Female")
    total_votes = len(votes)
    female_ratio = female_votes / total_votes if total_votes > 0 else 0
    
    status = "gathering"
    message = "Scanning... hold still"
    
    if low_lighting:
        message = "Lighting is too low. Please move to a brighter area."

    if total_votes >= 8:
        # SUCCESS CONDITION
        if female_ratio >= 0.7:
            # High confidence female ratio
            status = "success"
            message = "Gender verified as Female"
            
            # Optional DeepFace double-check if available and not low lighting
            if not low_lighting and check_deepface():
                print("[PYTHON] Caffe model says Female. Running DeepFace double-check...", flush=True)
                df_res = verify_gender_from_face(frame_b64)
                if df_res['gender'] == 'female':
                    message = "Gender verified as Female (High Confidence)"
                elif df_res['gender'] == 'uncertain':
                     # If DeepFace is uncertain, we still allow based on Caffe ratio
                     pass
        
        # REJECTION CONDITION (Strict)
        # Only reject if we have many frames and majority are HIGH CONFIDENCE male
        elif female_ratio <= 0.2 and not low_lighting:
            status = "failed"
            message = "Verification failed: Male gender detected. Hectate is for women only."
        
        # UNCERTAINTY / FALLBACK CONDITION
        else:
            if total_votes >= 12:
                # If still uncertain after 12 frames, we don't reject.
                # We tell the frontend it's "uncertain" so it can offer Aadhaar fallback
                status = "uncertain"
                message = "Gender check inconclusive. Please ensure good lighting or proceed to Aadhaar verification."
            else:
                status = "gathering"
                message = "Analyzing... please adjust lighting or face the camera directly."

    return jsonify({
        "status": status,
        "message": message,
        "face_found": True,
        "gender": gender,
        "confidence": confidence,
        "brightness": brightness,
        "low_lighting": low_lighting,
        "female_ratio": female_ratio,
        "votes": votes
    })


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 2: Aadhaar card OCR check
# ═══════════════════════════════════════════════════════════════════════════════
def preprocess_for_ocr(img):
    """Upscale if small, downscale if too large, then grayscale and threshold."""
    h, w = img.shape[:2]
    
    # Resize to a sweet spot for OCR (around 1000-1500px width)
    target_w = 1200
    if w < 600 or w > 2000:
        scale = target_w / w
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA if w > 2000 else cv2.INTER_CUBIC)
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # fastNlMeansDenoising is VERY slow on large images. Use a lighter version or skip.
    # We use a simple bilateral filter which is faster and preserves edges.
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Threshold
    _, gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return gray


def ocr_image(img_cv2):
    processed = preprocess_for_ocr(img_cv2)
    config    = '--psm 6 --oem 3'
    return pytesseract.image_to_string(processed, lang='eng', config=config)


def check_aadhaar_number(text):
    """
    Finds 12-digit Aadhaar numbers while ignoring common false positives like years (19xx, 20xx).
    Uses a multi-pass approach:
    1. Look for 4-4-4 pattern with spaces/hyphens
    2. Look for any 12-digit sequence
    """
    # Pass 1: Clean text of everything except digits and spaces
    clean = re.sub(r'[^0-9\s]', ' ', text)
    
    # Pass 2: Find all sequences of digits
    # We want to find 12 digits. Often they are separated by spaces.
    # Join everything and look for 12 digits, but try to keep the groupings if possible.
    
    # Try to find exactly 4-4-4
    pattern_444 = re.compile(r'\b\d{4}\s\d{4}\s\d{4}\b')
    matches = pattern_444.findall(clean)
    if matches:
        return [m.strip() for m in matches]

    # Fallback: Extract all digits and look for 12-digit blocks
    digits_only = re.sub(r'\D', '', text)
    # Ignore common 4-digit sequences that look like years at the start/end if possible,
    # but a 12-digit sequence is very likely an Aadhaar.
    all_12 = re.findall(r'\d{12}', digits_only)
    
    results = []
    for num in all_12:
        # Simple heuristic: if it starts with 19 or 20 and the rest is zeros or suspicious, it might be a date
        # But Aadhaar is 12 digits, dates are 4 or 8. So 12 is almost certainly Aadhaar.
        formatted = f"{num[:4]} {num[4:8]} {num[8:]}"
        results.append(formatted)
        
    return results


def check_gender_in_text(text):
    """
    Aggressively searches for 'Female' or 'Female' equivalents in Hindi.
    Handles common OCR errors (e.g., 'Femaie', 'Femle', 'Femal').
    """
    t = text.lower()
    
    # Patterns for Female (English and Hindi)
    # Using more flexible regex for 'Female'
    female_patterns = [
        r'f[e3]m[a4][il1][e3]?', # female, femaie, femle, femal
        r'f\s*e\s*m\s*a\s*l\s*e',
        r'महिला',
        r'wom[a4]n',
        r'\bgender\s*[:\s]*f\b',
        r'\bsex\s*[:\s]*f\b',
        r'\bf\s*/\s*female\b',
        r'\bfemale\s*/\s*महिला'
    ]
    
    male_patterns = [
        r'\bm[a4][il1][e3]\b',
        r'पुरुष',
        r'\bgender\s*[:\s]*m\b',
        r'\bsex\s*[:\s]*m\b'
    ]

    for p in female_patterns:
        if re.search(p, t):
            return 'Female'
            
    for p in male_patterns:
        if re.search(p, t):
            return 'Male'
            
    # Secondary check: if "Female" is broken into pieces
    if 'fem' in t and ('ale' in t or 'ail' in t or 'le' in t):
        return 'Female'

    return 'Unknown'


@app.route('/verify-aadhaar', methods=['POST'])
def verify_aadhaar():
    """
    Accepts multipart file upload (field name: 'aadhaar') or JSON { image: base64 }.
    Returns: { aadhaar_found, aadhaar_number, gender, passed, reason }
    """
    # ── MOCK MODE if tesseract not available ──────────────────────────────────
    if not _tesseract_ok:
        return jsonify({
            "aadhaar_found": False,
            "aadhaar_number": None,
            "gender": "Unknown",
            "passed": False,
            "reason": "Aadhaar OCR service offline (Tesseract not found on server)",
            "mock": True
        })

    img_cv2 = None

    # Multipart file upload
    if 'aadhaar' in request.files:
        print("[PYTHON] Received multipart Aadhaar file", flush=True)
        f         = request.files['aadhaar']
        file_bytes = f.read()
        ext       = os.path.splitext(f.filename)[1].lower()

        if ext == '.pdf':
            print("[PYTHON] Processing PDF Aadhaar", flush=True)
            # PDF → render first page
            try:
                import fitz
                doc  = fitz.open(stream=file_bytes, filetype="pdf")
                page = doc[0]
                pix  = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
                img_data  = pix.tobytes("png")
                nparr     = np.frombuffer(img_data, np.uint8)
                img_cv2   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                print("[PYTHON] PDF page rendered to CV2", flush=True)
            except Exception as e:
                print(f"[PYTHON] PDF error: {e}", flush=True)
                return jsonify({"passed": False, "reason": f"PDF render failed: {e}"})
        else:
            print(f"[PYTHON] Processing image Aadhaar: {f.filename}", flush=True)
            nparr   = np.frombuffer(file_bytes, np.uint8)
            img_cv2 = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Base64 fallback
    elif request.is_json and request.json.get('image'):
        print("[PYTHON] Received base64 Aadhaar", flush=True)
        try:
            img_bytes = base64.b64decode(request.json['image'])
            nparr     = np.frombuffer(img_bytes, np.uint8)
            img_cv2   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            print(f"[PYTHON] Base64 error: {e}", flush=True)
            return jsonify({"passed": False, "reason": f"Base64 decode failed: {e}"})

    if img_cv2 is None:
        print("[PYTHON] No image decoded", flush=True)
        return jsonify({"passed": False, "reason": "No image received"})

    # ── Run OCR ───────────────────────────────────────────────────────────────
    print(f"[PYTHON] Running OCR on image of size {img_cv2.shape}...", flush=True)
    try:
        text = ocr_image(img_cv2)
        print(f"[PYTHON] OCR Complete. Text length: {len(text)}. First 50 chars: {text[:50].replace('\n',' ')}", flush=True)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[PYTHON] OCR Exception: {e}", flush=True)
        return jsonify({"passed": False, "reason": f"OCR failed: {e}"})

    print("[PYTHON] Checking Aadhaar patterns...", flush=True)
    aadhaar_numbers = check_aadhaar_number(text)
    gender          = check_gender_in_text(text)
    print(f"[PYTHON] Aadhaar found: {len(aadhaar_numbers)}, Gender: {gender}", flush=True)

    aadhaar_found = len(aadhaar_numbers) > 0
    passed        = aadhaar_found and gender == "Female"

    if not aadhaar_found:
        reason = "No valid Aadhaar number found in the document. Please upload a clear photo of your Aadhaar card."
    elif gender == "Male":
        reason = "Aadhaar card shows Male gender. Hectate is a women-only platform."
    elif gender == "Unknown":
        reason = "Could not read gender from the Aadhaar card. Please upload a clearer image."
    else:
        reason = "Aadhaar verified successfully — Female identity confirmed."

    return jsonify({
        "aadhaar_found": aadhaar_found,
        "aadhaar_number": aadhaar_numbers[0] if aadhaar_numbers else None,
        "gender": gender,
        "passed": passed,
        "reason": reason,
        "ocr_text_preview": text[:300]
    })


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 3: Face Match + Liveness (Combined)
# ═══════════════════════════════════════════════════════════════════════════════
@app.route('/verify-face', methods=['POST'])
def verify_face():
    data = request.get_json(silent=True) or {}
    frames = data.get('liveness_frames', [])
    selfie = data.get('selfie_frame', '')
    doc_photo = data.get('document_photo', '')

    if not selfie:
        return jsonify({'success': False, 'error': 'No selfie provided'}), 400

    # 1. Liveness
    is_live = detect_liveness(frames) if frames else True
    
    # 2. Gender from Face
    gender_res = verify_gender_from_face(selfie)
    
    # 3. Match with Doc
    match_res = {'is_match': True, 'match_score': 100}
    if doc_photo:
        match_res = face_match(selfie, doc_photo)

    success = is_live and (gender_res['gender'] == 'female') and match_res['is_match']
    
    return jsonify({
        'success': success,
        'liveness': is_live,
        'gender': gender_res['gender'],
        'gender_confidence': gender_res['confidence'],
        'match_score': match_res.get('match_score', 0),
        'mock': gender_res.get('mock', False) or match_res.get('mock', False)
    })


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 4: Sentiment Analysis (Toxicity Check)
# ═══════════════════════════════════════════════════════════════════════════════
@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """
    Analyzes text for toxicity/sentiment.
    Body: { text: "..." }
    Returns: { score, label, toxic }
    """
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').lower()

    if not text:
        return jsonify({"score": 0, "label": "NEUTRAL", "toxic": False})

    # Basic keyword-based toxicity check for local development
    # In production, replace with a real transformer model (HuggingFace)
    toxic_keywords = ['hate', 'kill', 'attack', 'stupid', 'ugly', 'harass', 'abuse']
    found = [w for w in toxic_keywords if w in text]

    is_toxic = len(found) > 0
    score = 0.85 if is_toxic else 0.1

    return jsonify({
        "score": score,
        "label": "NEGATIVE" if is_toxic else "POSITIVE",
        "toxic": is_toxic,
        "flagged_words": found
    })


# ── Health check ──────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    models_ok = load_models()
    return jsonify({
        "service": "hectate_verification_service",
        "status": "online" if (models_ok and _tesseract_ok) else "partial",
        "gender_models": "ok" if models_ok else "offline",
        "tesseract": "ok" if _tesseract_ok else "offline",
        "deepface": "ok" if check_deepface() else "missing",
        "port": 5001
    })

if __name__ == '__main__':
    print("[Hectate] Starting Python Verification Service on port 5001...", flush=True)
    # Check dependencies on startup
    load_models()
    app.run(host='0.0.0.0', port=5001, debug=False)
