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
try:
    import mediapipe as mp
    _mp_ok = True
except ImportError:
    _mp_ok = False
    print("[WARN] Mediapipe not installed, gender classification from webcam will be mock only.")
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
analyzer = SentimentIntensityAnalyzer()

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

    if not _mp_ok:
        print("[WARN] Mediapipe not available, cannot load face detector")
        return False

    missing = [p for p in [GENDER_PROTO, GENDER_MODEL, MP_MODEL] if not os.path.exists(p)]
    if missing:
        print(f"[WARN] Missing models, running in MOCK mode: {missing}")
        return False

    try:
        import cv2
        import mediapipe as mp
        from mediapipe.tasks import python as mp_python
        from mediapipe.tasks.python import vision as mp_vision

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

# ── Verhoeff Algorithm for Aadhaar Validation ──────────────────────────────────
VERHOEFF_TABLE_D = (
    (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
    (1, 2, 3, 4, 0, 6, 7, 8, 9, 5),
    (2, 3, 4, 0, 1, 7, 8, 9, 5, 6),
    (3, 4, 0, 1, 2, 8, 9, 5, 6, 7),
    (4, 0, 1, 2, 3, 9, 5, 6, 7, 8),
    (5, 9, 8, 7, 6, 0, 4, 3, 2, 1),
    (6, 5, 9, 8, 7, 1, 0, 4, 3, 2),
    (7, 6, 5, 9, 8, 2, 1, 0, 4, 3),
    (8, 7, 6, 5, 9, 3, 2, 1, 0, 4),
    (9, 8, 7, 6, 5, 4, 3, 2, 1, 0)
)
VERHOEFF_TABLE_P = (
    (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
    (1, 5, 7, 6, 2, 8, 3, 0, 9, 4),
    (5, 8, 0, 3, 7, 9, 6, 1, 4, 2),
    (8, 9, 1, 6, 0, 4, 3, 5, 2, 7),
    (9, 4, 5, 3, 1, 2, 6, 8, 7, 0),
    (4, 2, 8, 6, 5, 7, 3, 9, 0, 1),
    (2, 7, 9, 3, 8, 0, 6, 4, 1, 5),
    (7, 0, 4, 6, 9, 1, 3, 2, 5, 8)
)

def validate_verhoeff(number):
    """Validate a 12-digit Aadhaar number using the Verhoeff algorithm."""
    if not number or not re.match(r'^\d{12}$', str(number)):
        return False
    c = 0
    for i, item in enumerate(reversed(str(number))):
        c = VERHOEFF_TABLE_D[c][VERHOEFF_TABLE_P[i % 8][int(item)]]
    return c == 0


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
        # MOCK MODE — simulate female detection for dev
        votes.append("Female")
        female_ratio = votes.count("Female") / max(len(votes), 1)
        return jsonify({
            "face_found": True,
            "gender": "Female",
            "confidence": 92,
            "smoothed": "Female",
            "female_ratio": female_ratio,
            "votes": votes[-8:],
            "mock": True
        })

    frame_b64 = data.get('frame', '')
    if not frame_b64:
        return jsonify({"face_found": False, "error": "No frame provided"})

    # Decode base64 → numpy image
    try:
        img_bytes = base64.b64decode(frame_b64)
        nparr     = np.frombuffer(img_bytes, np.uint8)
        frame     = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image")
    except Exception as e:
        return jsonify({"face_found": False, "error": f"Image decode failed: {e}"})

    h, w = frame.shape[:2]
    rgb  = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    det_result = _mp_detector.detect(mp_img)

    if not det_result.detections:
        return jsonify({"face_found": False, "gender": None, "confidence": 0,
                        "smoothed": None, "female_ratio": 0, "votes": votes})

    # Use first (largest) detected face
    det = det_result.detections[0]
    bb  = det.bounding_box
    x1  = max(0, bb.origin_x)
    y1  = max(0, bb.origin_y)
    x2  = min(w, x1 + bb.width)
    y2  = min(h, y1 + bb.height)

    face_roi = frame[y1:y2, x1:x2]
    if face_roi.size == 0:
        return jsonify({"face_found": False, "error": "Empty face ROI"})

    blob = cv2.dnn.blobFromImage(face_roi, 1.0, (227, 227), GENDER_MEAN, swapRB=False)
    _gender_net.setInput(blob)
    preds      = _gender_net.forward()
    gender     = GENDER_LIST[preds[0].argmax()]
    confidence = int(preds[0].max() * 100)

    # Rolling vote smoothing (max last 8 frames)
    votes.append(gender)
    if len(votes) > 8:
        votes = votes[-8:]

    female_votes = votes.count("Female")
    smoothed     = "Female" if female_votes > len(votes) / 2 else "Male"
    female_ratio = female_votes / len(votes)

    return jsonify({
        "face_found": True,
        "gender": gender,
        "confidence": confidence,
        "smoothed": smoothed,
        "female_ratio": female_ratio,
        "votes": votes
    })


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINT 2: Aadhaar card OCR check
# ═══════════════════════════════════════════════════════════════════════════════
def preprocess_for_ocr(img):
    """Upscale, grayscale, denoise, threshold — from aadhaar_verification.py"""
    h, w = img.shape[:2]
    if w < 600:
        scale = 600 / w
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.fastNlMeansDenoising(gray, h=10)
    _, gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return gray


def ocr_image(img_cv2):
    """Try multiple preprocessing variants to get best OCR result"""
    ocr_results = []
    config = '--psm 6 --oem 3'
    
    # Variant 1: Main preprocessing (Grayscale + Denoise + Otsu)
    processed1 = preprocess_for_ocr(img_cv2)
    ocr_results.append(pytesseract.image_to_string(processed1, lang='eng', config=config))
    
    # Variant 2: Simple Grayscale (sometimes better for low contrast)
    gray = cv2.cvtColor(img_cv2, cv2.COLOR_BGR2GRAY)
    ocr_results.append(pytesseract.image_to_string(gray, lang='eng', config=config))
    
    # Variant 3: Adaptive Thresholding
    adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    ocr_results.append(pytesseract.image_to_string(adaptive, lang='eng', config=config))
    
    # Join all results to scan for gender/numbers across all variants
    return "\n---\n".join(ocr_results)


def check_aadhaar_number(text):
    # Find all 12-digit sequences with optional spaces
    # We look for 3 blocks of 4 digits
    raw_matches = re.findall(r'\b(\d{4})\s?(\d{4})\s?(\d{4})\b', text)
    valid_numbers = []
    
    for m in raw_matches:
        full_num = "".join(m)
        if validate_verhoeff(full_num):
            valid_numbers.append(f"{m[0]} {m[1]} {m[2]}")
            
    # Fallback: if no 12-digit blocks found, try to find any 12 digits buried in text
    if not valid_numbers:
        all_digits = "".join(re.findall(r'\d', text))
        # Sliding window of 12 digits
        for i in range(len(all_digits) - 11):
            window = all_digits[i:i+12]
            if validate_verhoeff(window):
                valid_numbers.append(f"{window[:4]} {window[4:8]} {window[8:]}")
                break # Usually only one Aadhaar per card
                
    return valid_numbers


def check_gender_in_text(text):
    t = text.lower()
    
    # Standard patterns for Female/Mahila (including common OCR misreads)
    gender_patterns = [
        r'femal[e|i|c|l|1]', r'femaie', r'fenale', r'fermale', r'fenaie', 
        r'femle', r'femal', r'f\s*e\s*m\s*a\s*l\s*e',
        r'/\s*f\b', r'\bsex\s*:\s*f\b', r'\bgender\s*:\s*f\b',
        r'\bgender\s*/\s*linga\s*:\s*f\b',
        r'\blinga\s*:\s*f\b',
        r'\bf\s*/\s*m\b',
        r"\bf\b", r"mahila", r"woman",
        r"स्त्री", r"महिला", r"మహిళ" # Added Telugu support
    ]
    
    # Priority 1: Direct Regex Search
    for p in gender_patterns:
        if re.search(p, t):
            return 'Female'
            
    # Priority 2: Cleaning all non-alpha and checking for substrings
    clean_t = "".join(re.findall(r'[a-z]', t))
    if "female" in clean_t or "mahila" in clean_t:
        return 'Female'

    # Priority 3: Fuzzy Matching on sliding window of cleaned text
    # This catches things like "F E M A L E" or "F.E.M.A.L.E" or "FE-MALE"
    import difflib
    target = "female"
    if len(clean_t) >= len(target):
        for i in range(len(clean_t) - len(target) + 1):
            window = clean_t[i:i+len(target)]
            if difflib.SequenceMatcher(None, window, target).ratio() > 0.8:
                return 'Female'
    
    # Priority 4: Check for Hindi/Telugu keywords in the original text
    if any(keyword in t for keyword in ["महिला", "మహిళ", "स्त्री"]):
        return 'Female'

    # Support 'Male', 'पुरुष', 'पुरूష'
    if re.search(r'\bmale\b', t) or 'पुरुष' in t or 'पुरूష' in t:
        # Final safety check: if 'female' wasn't found but 'male' was
        # We check if 'male' might actually be part of 'female' misread
        # But if we are here, 'female' wasn't found by previous steps
        return 'Male'
            
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
            "aadhaar_found": True,
            "aadhaar_number": "1234 5678 9012",
            "gender": "Female",
            "passed": True,
            "reason": "Mock verification passed (Tesseract not installed)",
            "mock": True
        })

    img_cv2 = None

    # Multipart file upload
    if 'aadhaar' in request.files:
        f         = request.files['aadhaar']
        file_bytes = f.read()
        ext       = os.path.splitext(f.filename)[1].lower()

        if ext == '.pdf':
            # PDF → render first page
            try:
                import fitz
                doc  = fitz.open(stream=file_bytes, filetype="pdf")
                page = doc[0]
                mat  = fitz.Matrix(3, 3)
                pix  = page.get_pixmap(matrix=mat)
                img_data  = pix.tobytes("png")
                nparr     = np.frombuffer(img_data, np.uint8)
                img_cv2   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except Exception as e:
                return jsonify({"passed": False, "reason": f"PDF render failed: {e}"})
        else:
            nparr   = np.frombuffer(file_bytes, np.uint8)
            img_cv2 = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Base64 fallback
    elif request.is_json and request.json.get('image'):
        try:
            img_bytes = base64.b64decode(request.json['image'])
            nparr     = np.frombuffer(img_bytes, np.uint8)
            img_cv2   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            return jsonify({"passed": False, "reason": f"Base64 decode failed: {e}"})

    if img_cv2 is None:
        return jsonify({"passed": False, "reason": "No image received"})

    # ── Run OCR ───────────────────────────────────────────────────────────────
    try:
        text = ocr_image(img_cv2)
        # Log text for debugging (strip long whitespace)
        log_text = re.sub(r'\s+', ' ', text)
        print(f"\n--- OCR RESULT ---\n{log_text[:1000]}\n------------------\n", flush=True)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Exception exactly: {e}", flush=True)
        return jsonify({"passed": False, "reason": f"OCR failed: {e}"})

    aadhaar_numbers = check_aadhaar_number(text)
    gender          = check_gender_in_text(text)
    
    print(f"Detected Numbers: {aadhaar_numbers}", flush=True)
    print(f"Detected Gender: {gender}", flush=True)

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


# ── Health check ──────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "models_ready": _models_ready, "tesseract": _tesseract_ok})


@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        analyzer = SentimentIntensityAnalyzer()
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"success": False, "message": "Text is required"}), 400
        
        text = data['text']
        scores = analyzer.polarity_scores(text)
        compound = scores['compound']
        
        # Classification
        if compound >= 0.05:
            label = "Positive"
        elif compound <= -0.05:
            label = "Negative"
        else:
            label = "Neutral"

        # Distress/Urgency Detection
        distress_keywords = [
            "help", "sos", "emergency", "save me", "please help", "danger", "scared", "fear", "threat", 
            "unsafe", "urgent", "immediate", "please call", "police", "bachao", "madad",
            "darr", "khatra", "emergency", "pareshan", "picha", "himmat"
        ]
        
        # Harmful / Abusive Detection
        harmful_keywords = [
            "hate", "kill", "die", "stupid", "idiot", "dumb", "ugly", "bitch", "whore", "slut", 
            "rape", "murder", "attack", "violence", "abusive", "harassment", "bullying",
            "kamine", "kutte", "badtameez", "haramzada", "gadha", "nude", "sex", "porn"
        ]
        
        lower_text = text.lower()
        is_distress = any(word in lower_text for word in distress_keywords)
        is_harmful = any(word in lower_text for word in harmful_keywords)
        
        # If score is very negative, or harmful keywords found, flag it
        is_flagged = is_harmful or (compound < -0.5)
        
        # If score is very negative, also flag as distress (often overlaps)
        if compound < -0.6:
            is_distress = True
            
        return jsonify({
            "success": True,
            "label": label,
            "score": compound,
            "isDistress": is_distress,
            "isFlagged": is_flagged
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == '__main__':
    load_models()
    print("\n[Hectate Python Service] Starting on http://localhost:5002\n")
    app.run(host='0.0.0.0', port=5002, debug=False)
