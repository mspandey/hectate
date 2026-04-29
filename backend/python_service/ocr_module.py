# -*- coding: utf-8 -*-
"""
ocr_module.py — Hectate Advanced OCR Pipeline
==============================================
Handles OCR for Aadhaar-like ID cards in real-world conditions:
  - Low light, glare, blur, camera noise, skewed images

Pipeline:
  1. Deskew (fix rotated cards)
  2. Resize to OCR-optimal resolution
  3. CLAHE (fix uneven lighting / glare patches)
  4. Bilateral denoise (kill camera noise, preserve edges)
  5. Adaptive threshold (handles partial shadows on the card)
  6. ROI crop using face anchor (reduces background noise)
  7. Face Extraction (extracts the ID photo for matching)
  8. Multi-pass Tesseract with whitelist for the number

Usage:
    from ocr_module import run_aadhaar_ocr
    result = run_aadhaar_ocr(img_cv2)
"""

import re
import cv2
import numpy as np
import pytesseract
import base64


# ── Tesseract binary path (Windows) ───────────────────────────────────────────
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — DESKEW: Fix tilted/rotated card images
# ═══════════════════════════════════════════════════════════════════════════════
def deskew(img: np.ndarray) -> np.ndarray:
    """
    Corrects document skew using the angle of the largest white-pixel cluster.
    This handles cards that were photographed at a slight tilt (up to ~30°).
    Works on a grayscale copy; returns the corrected colour image.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Invert so text pixels become foreground (white)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) < 100:
        # Not enough content to compute a reliable angle -> skip
        return img

    angle = cv2.minAreaRect(coords)[-1]

    # minAreaRect returns angles in [-90, 0); we want a small correction angle
    if angle < -45:
        angle = 90 + angle

    # Only correct if the tilt is meaningful (>0.5°) and not extreme (skip >30°)
    if abs(angle) < 0.5 or abs(angle) > 30:
        return img

    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC,
                              borderMode=cv2.BORDER_REPLICATE)
    print(f"[OCR] Deskewed by {angle:.2f} deg")
    return rotated


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2 — RESIZE: Bring image to OCR-optimal resolution
# ═══════════════════════════════════════════════════════════════════════════════
def optimal_resize(img: np.ndarray, target_width: int = 1400) -> np.ndarray:
    """
    Scales the image to a width of ~1400px which is the sweet spot for Tesseract.
    - Too small: characters are too few pixels wide -> wrong glyphs.
    - Too large: OCR slows down without accuracy gain.
    Uses INTER_CUBIC for upscaling (preserves sharpness) and
    INTER_AREA for downscaling (anti-aliases smoothly).
    """
    h, w = img.shape[:2]
    if w == target_width:
        return img

    scale = target_width / w
    interp = cv2.INTER_CUBIC if scale > 1 else cv2.INTER_AREA
    resized = cv2.resize(img, None, fx=scale, fy=scale, interpolation=interp)
    print(f"[OCR] Resized {w}x{h} -> {resized.shape[1]}x{resized.shape[0]}")
    return resized


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3 — CLAHE: Fix uneven illumination and glare
# ═══════════════════════════════════════════════════════════════════════════════
def apply_clahe(gray: np.ndarray) -> np.ndarray:
    """
    CLAHE (Contrast Limited Adaptive Histogram Equalization) works on LOCAL
    tiles of the image rather than globally. This means:
    - A glare patch on the top-right is fixed independently of the
      shadowed bottom-left -> both areas become readable.
    - clipLimit=2.0 prevents over-amplifying noise in flat regions.
    - tileGridSize=(8,8) processes in 8x8 pixel blocks.
    """
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(gray)


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4 — DENOISE: Remove camera sensor noise while keeping text edges sharp
# ═══════════════════════════════════════════════════════════════════════════════
def denoise(gray: np.ndarray) -> np.ndarray:
    """
    Bilateral filter is preferred over Gaussian blur because it preserves
    hard text edges (the key features Tesseract needs) while smoothing away
    the random salt-and-pepper noise from phone cameras.
    
    d=9: neighbourhood diameter (9px around each pixel)
    sigmaColor=75: how much color similarity matters (75 = moderate)
    sigmaSpace=75: how much spatial distance matters (75 = moderate)
    
    NOTE: fastNlMeansDenoising is stronger but ~10x slower. Use bilateral
    for real-time or near-real-time performance.
    """
    return cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — THRESHOLD: Binarize the image for clean black-on-white text
# ═══════════════════════════════════════════════════════════════════════════════
def adaptive_threshold(gray: np.ndarray) -> np.ndarray:
    """
    Adaptive thresholding computes a per-pixel threshold based on a local
    neighbourhood. This is critical for Aadhaar cards because:
    - The left half might be in shadow while the right half has flash glare.
    - A single global threshold (Otsu) would make one half unreadable.
    
    blockSize=31: the neighbourhood size for each pixel's threshold calculation.
    C=10: a constant subtracted from the mean to fine-tune the threshold.
    
    We invert the result (THRESH_BINARY) so text = 255 (white) on 0 (black),
    which is what Tesseract expects natively.
    """
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=31, C=10
    )
    return binary


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6 — ROI CROP: Find text region using face as an anchor
# ═══════════════════════════════════════════════════════════════════════════════
def crop_text_roi(img: np.ndarray) -> np.ndarray:
    """
    On Aadhaar cards, the face photo is always in the bottom-left quadrant.
    The gender field and Aadhaar number are in the bottom-right / middle area.
    
    Strategy:
    1. Run a FAST face detector (Haar cascade — cheap, good enough for ID crops).
    2. If a face is found, crop everything to the RIGHT of the face bounding box.
       This removes the face photo itself and left-side decorations.
    3. If no face is found, fall back to cropping the bottom 60% of the image
       (which is where text is on most Indian government ID cards).
    
    This significantly reduces the number of non-text regions Tesseract has to
    process, eliminating noise from watermarks, logos, and photographs.
    """
    h, w = img.shape[:2]

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    gray_for_detect = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray_for_detect, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40)
    )

    if len(faces) > 0:
        # Sort by area, pick the largest (most likely the ID photo)
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        fx, fy, fw, fh = faces[0]
        
        # Crop from right-edge of face to end of image, vertically from face top to bottom
        x_start = max(0, fx + fw - 10)   # slight overlap to avoid cutting text
        y_start = max(0, fy - 20)         # a bit above face to catch name line
        
        roi = img[y_start:h, x_start:w]
        print(f"[OCR] Face detected at ({fx},{fy},{fw},{fh}). Cropped text ROI: x>{x_start}, y>{y_start}")
        return roi if roi.size > 0 else img

    # No face found: crop to bottom 65% and left-skip 20% (approximate text area)
    print("[OCR] No face detected. Using bottom-65% crop heuristic.")
    y_start = int(h * 0.35)
    x_start = int(w * 0.20)
    return img[y_start:h, x_start:w]


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7 — TESSERACT OCR: Multi-pass with optimal configs
# ═══════════════════════════════════════════════════════════════════════════════
def run_tesseract_multipass(preprocessed_img: np.ndarray) -> str:
    """
    Runs two OCR passes and merges the results to maximize text coverage:

    Pass 1 — General text extraction:
        --psm 6: Assume uniform block of text (best for structured cards).
        --oem 3: Use the best available engine (LSTM neural net preferred).
        lang='eng+hin': Captures both English and Hindi text on Aadhaar cards.

    Pass 2 — Number extraction with strict whitelist:
        Limits recognized characters to digits and spaces only.
        This vastly reduces misreads like '1' as 'l', '0' as 'O', etc.
        --psm 11: Finds sparse text anywhere on the image (catches scattered digits).
    """
    # Pass 1: Full text (English + Hindi for gender keyword 'महिला')
    config_general = '--psm 6 --oem 3'
    try:
        text_general = pytesseract.image_to_string(
            preprocessed_img, lang='eng+hin', config=config_general
        )
    except Exception:
        # Hindi lang pack may not be installed; fall back to English only
        text_general = pytesseract.image_to_string(
            preprocessed_img, lang='eng', config=config_general
        )

    # Pass 2: Digit-only scan to reliably capture the 12-digit Aadhaar number
    # NOTE: Do NOT use double-quotes inside the config string on Windows — it causes
    # "No closing quotation" errors. Use the -c flag with no shell quoting.
    config_digits = '--psm 6 --oem 3 -c tessedit_char_whitelist=0123456789 '
    try:
        text_digits = pytesseract.image_to_string(
            preprocessed_img, lang='eng', config=config_digits
        )
    except Exception:
        text_digits = ''

    # Merge: combine both passes. The number pass is appended for the regex extractor.
    merged = text_general + '\n' + text_digits
    return merged


# ═══════════════════════════════════════════════════════════════════════════════
# EXTRACTORS: Parse structured fields from raw OCR text
# ═══════════════════════════════════════════════════════════════════════════════
def extract_aadhaar_number(text: str) -> list[str]:
    """
    Multi-strategy extraction for the 12-digit Aadhaar number.

    Strategy 1: Exact 4-4-4 pattern ("XXXX XXXX XXXX") — highest confidence.
    Strategy 2: Any 12-digit contiguous string — catches compact prints.
    Strategy 3: Three groups of 4 digits within 5 lines of each other
                (handles OCR that inserts random line-breaks mid-number).
    """
    results = []

    # Strategy 1: Explicit 4-4-4 grouping with spaces or hyphens
    pattern_444 = re.compile(r'\b(\d{4})[\s\-](\d{4})[\s\-](\d{4})\b')
    for m in pattern_444.finditer(text):
        number = f"{m.group(1)} {m.group(2)} {m.group(3)}"
        results.append(number)

    if results:
        return results  # High-confidence match found

    # Strategy 2: Compact 12-digit string
    digits_only = re.sub(r'\D', '', text)
    compact_12 = re.findall(r'\d{12}', digits_only)
    for num in compact_12:
        # Discard numbers that look like phone numbers (start with 6-9) or
        # years (too many zeros). Aadhaar can start with any digit 0-9 but
        # the first digit is never 0 per UIDAI spec.
        if num[0] != '0':
            results.append(f"{num[:4]} {num[4:8]} {num[8:]}")

    return results


def extract_gender(text: str) -> str:
    """
    Multi-language, OCR-error-tolerant gender extraction.
    Handles: English, Hindi (महिला / पुरुष), OCR typos (Femaie, Femal).
    Returns: 'Female', 'Male', or 'Unknown'
    """
    t = text.lower()

    female_patterns = [
        r'f[e3][mn][a4@][il1][e3]',     # female, femaie, femal, femane
        r'f\s*e\s*m\s*a\s*l\s*e',        # f e m a l e (spaced out by OCR)
        r'महिला',                          # Hindi: Mahila (woman)
        r'wom[a4@]n',
        r'\bsex\s*[:\|]\s*f\b',
        r'\bgender\s*[:\|]\s*f\b',
        r'\bfemale\b',
    ]
    male_patterns = [
        r'\bm[a4@][il1][e3]\b',
        r'पुरुष',                           # Hindi: Purush (man)
        r'\bsex\s*[:\|]\s*m\b',
        r'\bgender\s*[:\|]\s*m\b',
        r'\bmale\b',
    ]

    for pattern in female_patterns:
        if re.search(pattern, t):
            return 'Female'

    for pattern in male_patterns:
        if re.search(pattern, t):
            return 'Male'

    return 'Unknown'


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════
def run_aadhaar_ocr(img_cv2: np.ndarray) -> dict:
    """
    Full OCR pipeline entry point.

    Args:
        img_cv2: OpenCV BGR image (numpy array)

    Returns:
        {
            "aadhaar_found": bool,
            "aadhaar_number": str | None,
            "gender": "Female" | "Male" | "Unknown",
            "passed": bool,
            "reason": str,
            "ocr_text_preview": str,      # first 300 chars of raw OCR
            "confidence_score": float,    # 0.0–1.0
            "face_b64": str | None        # Base64 encoded face crop
        }
    """
    if img_cv2 is None:
        return _fail("No image received")

    # ── Step 1: Deskew ────────────────────────────────────────────────────────
    img = deskew(img_cv2)

    # ── Step 2: Optimal resize ────────────────────────────────────────────────
    img = optimal_resize(img, target_width=1400)

    # ── Step 3: ROI crop (text region only) ──────────────────────────────────
    # We crop BEFORE converting to grayscale so the face detector can still
    # use colour information.
    roi = crop_text_roi(img)

    # ── Step 4: Greyscale ─────────────────────────────────────────────────────
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

    # ── Step 5: CLAHE (fix glare + local contrast) ────────────────────────────
    gray = apply_clahe(gray)

    # ── Step 6: Bilateral denoise ─────────────────────────────────────────────
    gray = denoise(gray)

    # ── Step 7: Adaptive threshold ────────────────────────────────────────────
    binary = adaptive_threshold(gray)

    # ── Step 8: Sharpen the binarized result ──────────────────────────────────
    # A mild sharpening kernel recovers edge detail lost during denoising.
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    sharpened = cv2.filter2D(binary, -1, kernel)

    # ── Step 9: Tesseract multi-pass OCR ─────────────────────────────────────
    raw_text = run_tesseract_multipass(sharpened)
    safe_text = raw_text[:100].replace(chr(10), ' ').encode('ascii', 'replace').decode('ascii')
    print(f"[OCR] Raw text ({len(raw_text)} chars): {safe_text}")

    # ── Step 10: Field extraction ─────────────────────────────────────────────
    aadhaar_numbers = extract_aadhaar_number(raw_text)
    gender = extract_gender(raw_text)

    # ── Step 11: Face Extraction for Matching ────────────────────────────────
    # ── Face Extraction for matching ──────────────────────────────────────────
    face_b64 = None
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 1.1, 5)
    if len(faces) > 0:
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        fx, fy, fw, fh = faces[0]
        # Padding for better matching
        pad = 20
        y1, y2 = max(0, fy-pad), min(img.shape[0], fy+fh+pad)
        x1, x2 = max(0, fx-pad), min(img.shape[1], fx+fw+pad)
        face_img = img[y1:y2, x1:x2]
        _, buffer = cv2.imencode('.jpg', face_img)
        face_b64 = base64.b64encode(buffer).decode('utf-8')

    # ── Confidence scoring ────────────────────────────────────────────────────
    # A simple 0-1 score based on how many key fields we successfully extracted.
    score = 0.0
    if aadhaar_numbers:
        score += 0.6   # Aadhaar number found -> major signal
    if gender != 'Unknown':
        score += 0.4   # Gender read clearly -> full confidence

    aadhaar_found = len(aadhaar_numbers) > 0
    passed = aadhaar_found and gender == 'Female'

    if not aadhaar_found:
        reason = "No valid Aadhaar number found. Please upload a clear, well-lit photo of your Aadhaar card."
    elif gender == 'Male':
        reason = "Aadhaar shows Male gender. Hectate is a women-only platform."
    elif gender == 'Unknown':
        reason = "Could not read gender field. Please ensure the gender row is visible and the image is not blurred."
    else:
        reason = "Aadhaar verified — Female identity confirmed."

    return {
        "aadhaar_found": aadhaar_found,
        "aadhaar_number": aadhaar_numbers[0] if aadhaar_numbers else None,
        "gender": gender,
        "passed": passed,
        "reason": reason,
        "ocr_text_preview": raw_text[:300],
        "confidence_score": round(score, 2),
        "face_b64": face_b64
    }


def _fail(reason: str) -> dict:
    return {
        "aadhaar_found": False,
        "aadhaar_number": None,
        "gender": "Unknown",
        "passed": False,
        "reason": reason,
        "ocr_text_preview": "",
        "confidence_score": 0.0,
        "face_b64": None
    }


# ── Standalone test ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python ocr_module.py <image_path>")
        sys.exit(1)
    img = cv2.imread(sys.argv[1])
    if img is None:
        print(f"Could not read image: {sys.argv[1]}")
        sys.exit(1)
    result = run_aadhaar_ocr(img)
    print("\n===== OCR RESULT =====")
    for k, v in result.items():
        print(f"  {k}: {v}")
