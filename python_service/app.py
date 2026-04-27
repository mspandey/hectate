from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import os
import re
import pytesseract
from PIL import Image
import io

# Configure Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Optional: PDF support
try:
    import fitz  # PyMuPDF
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "python_face_ocr"})

# Gender Classifier — returns "female" or "male"
def classify_gender(frame_b64):
    """Classify gender from a base64-encoded frame.
    In production, use DeepFace, InsightFace, or a custom model.
    This mock always returns female for demo purposes."""
    try:
        img_data = base64.b64decode(frame_b64)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return "unknown", 0.0
        # Mock: always classify as female with high confidence
        return "female", 0.95
    except Exception as e:
        print(f"[Gender] Classification error: {e}")
        return "unknown", 0.0

REQUIRED_VOTES = 8

@app.route('/verify-gender', methods=['POST'])
def verify_gender():
    data = request.json
    frame = data.get('frame')
    votes = data.get('votes', [])
    if not isinstance(votes, list):
        votes = []
        
    print(f"[Gender] Received {len(votes)} previous votes from client")
    
    if not frame:
        return jsonify({"status": "error", "message": "No frame provided"})
    
    # Classify this frame
    gender, confidence = classify_gender(frame)
    votes.append({"gender": gender, "confidence": confidence})
    
    print(f"[Gender] Vote {len(votes)}/{REQUIRED_VOTES}: {gender} ({confidence:.2f})")
    
    # Still gathering frames
    if len(votes) < REQUIRED_VOTES:
        return jsonify({
            "status": "gathering",
            "votes": votes,
            "message": f"Analyzing frame {len(votes)} of {REQUIRED_VOTES}..."
        })
    
    # We have enough votes — check majority (60% threshold)
    female_votes = sum(1 for v in votes if v.get("gender") == "female")
    success_rate = (female_votes / REQUIRED_VOTES)
    
    if success_rate >= 0.60:
        return jsonify({
            "status": "success",
            "gender": "female",
            "confidence": success_rate,
            "message": f"Gender verification passed with {success_rate*100:.1f}% confidence."
        })
    else:
        return jsonify({
            "status": "failed",
            "message": "Hectate is a women-only platform. Verification could not confirm female identity."
        })

@app.route('/verify-aadhaar', methods=['POST'])
def verify_aadhaar():
    if 'aadhaar' not in request.files:
        return jsonify({"passed": False, "reason": "No file uploaded"}), 400
    
    file = request.files['aadhaar']
    img_bytes = file.read()
    
    ocr_text = ""
    
    def extract_text_from_image(img):
        results = []
        
        # Determine available Tesseract languages
        lang_options = ['eng+hin', 'eng']
        
        # 1. Original image OCR (English + Hindi)
        for lang in lang_options:
            try:
                ocr_text_orig = pytesseract.image_to_string(img, lang=lang)
                results.append(ocr_text_orig)
                break
            except Exception:
                continue
        
        # 2. Grayscale image OCR
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        for lang in lang_options:
            try:
                ocr_text_gray = pytesseract.image_to_string(gray, lang=lang)
                results.append(ocr_text_gray)
                break
            except Exception:
                continue
        
        # 3. Upscaled & thresholded image OCR
        upscaled = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        _, thresh = cv2.threshold(upscaled, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        for lang in lang_options:
            try:
                ocr_text_thresh = pytesseract.image_to_string(thresh, lang=lang)
                results.append(ocr_text_thresh)
                break
            except Exception:
                continue
        
        # 4. Additional pass with PSM 6 (assume uniform block of text) for better results
        try:
            custom_config = r'--oem 3 --psm 6'
            ocr_psm6 = pytesseract.image_to_string(upscaled, lang='eng+hin', config=custom_config)
            results.append(ocr_psm6)
        except Exception:
            pass
        
        combined = " \n ".join(results)
        print(f"[OCR DEBUG] Full text extracted ({len(combined)} chars):")
        print(combined[:500])
        return combined

    # Handle PDF
    if file.filename.lower().endswith('.pdf'):
        if not PDF_SUPPORT:
            return jsonify({"passed": False, "reason": "PDF support not installed on server (PyMuPDF missing)"}), 500
        
        try:
            doc = fitz.open(stream=img_bytes, filetype="pdf")
            for page in doc:
                pix = page.get_pixmap()
                img_pil = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                img_cv2 = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
                ocr_text += extract_text_from_image(img_cv2)
            doc.close()
        except Exception as e:
            return jsonify({"passed": False, "reason": f"PDF processing error: {str(e)}"}), 500
    else:
        # Handle Image
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_cv2 = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        ocr_text = extract_text_from_image(img_cv2)

    # --- Improved Parsing Logic ---
    
    ocr_lower = ocr_text.lower()
    
    # 1. Gender Check — English patterns
    gender_patterns = [
        r"female", r"femaie", r"fenale", r"fermale", r"fenaie", 
        r"femle", r"femal", r"f\s*e\s*m\s*a\s*l\s*e",
        r"/\s*f\b", r"\bf\b", r"mahila", r"woman",
        r"f\w{1,4}e\b", r"f[a-z]{4,5}",
    ]
    
    is_female = any(re.search(p, ocr_lower) for p in gender_patterns)
    
    # 1b. Hindi gender check (महिला = female, स्त्री = female)
    hindi_female_keywords = ["महिला", "स्त्री", "female", "Female", "FEMALE"]
    if not is_female:
        for kw in hindi_female_keywords:
            if kw in ocr_text:
                is_female = True
                break
    
    # 1c. Check for "/ Female" or "/ F" pattern common on Aadhaar
    if not is_female:
        slash_pattern = re.search(r'/\s*(female|f)\b', ocr_lower)
        if slash_pattern:
            is_female = True
    
    # 1d. Check if 'female' is present when spaces are removed
    if not is_female and "female" in ocr_lower.replace(" ", ""):
        is_female = True

    # 1e. Fuzzy Matching as a last resort
    if not is_female:
        import difflib
        words = re.findall(r'\w+', ocr_lower)
        for word in words:
            if len(word) >= 4 and difflib.SequenceMatcher(None, word, "female").ratio() > 0.6:
                is_female = True
                break
    
    print(f"[OCR DEBUG] Gender detected: is_female={is_female}")
    
    # 2. Aadhaar Number Check
    # Often Aadhaar is split into three 4-digit chunks at the bottom of the card.
    tokens = ocr_text.split()
    four_digit_tokens = [t for t in tokens if re.fullmatch(r'\d{4}', t)]
    
    aadhaar_number = None
    if len(four_digit_tokens) >= 3:
        # Take the last 3 four-digit tokens as Aadhaar (avoids grabbing 4-digit DOB years)
        aadhaar_number = "".join(four_digit_tokens[-3:])
    else:
        # Fallback: look for 12 continuous digits or standard pattern
        match = re.search(r'\b\d{12}\b', ocr_text)
        if match:
            aadhaar_number = match.group(0)
    
    # 3. DOB Filtering (to prevent it being confused with Aadhaar)
    dob_match = re.search(r"(?:dob|birth|birth:?)\s*[:\-]?\s*(\d{2}[/-]\d{2}[/-]\d{4}|\d{4})", ocr_text, re.IGNORECASE)
    dob = dob_match.group(1) if dob_match else None

    # Validation
    if not is_female:
        return jsonify({
            "passed": False, 
            "reason": "Could not confirm Female gender on the card. Please ensure the 'Gender' field is clearly visible.",
            "ocr_text_preview": ocr_text[:200]
        })
    
    if not aadhaar_number:
        return jsonify({
            "passed": False, 
            "reason": "Could not find a valid 12-digit Aadhaar number.",
            "ocr_text_preview": ocr_text[:200]
        })

    return jsonify({
        "passed": True,
        "gender": "female",
        "aadhaar_number": aadhaar_number,
        "dob": dob,
        "ocr_text_preview": ocr_text[:200]
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
