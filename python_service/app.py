from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import os
import re
import pytesseract
from PIL import Image
import io
import logging

import mediapipe as mp

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5)

# Configure Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Try to import DeepFace
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger.info("DeepFace library loaded successfully")
except ImportError:
    DEEPFACE_AVAILABLE = False
    logger.warning("DeepFace library not found. Using fallback matching logic.")

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    # Check dependencies
    tesseract_ok = os.path.exists(pytesseract.pytesseract.tesseract_cmd)
    
    return jsonify({
        "status": "ok", 
        "service": "hectate_vision_service",
        "deepface": DEEPFACE_AVAILABLE,
        "tesseract": tesseract_ok,
        "mediapipe": True # If we got here, it's ok
    })

def decode_base64_img(b64_str):
    try:
        # Handle possible header
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
            
        img_data = base64.b64decode(b64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        logger.error(f"Error decoding base64 image: {e}")
        return None

def extract_face(img):
    """Extract face from image using MediaPipe."""
    if img is None: return None
    
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = face_detection.process(img_rgb)
    
    if not results.detections:
        return None
    
    # Get the best face detected
    detection = results.detections[0]
    bbox = detection.location_data.relative_bounding_box
    h, w, _ = img.shape
    
    x = int(bbox.xmin * w)
    y = int(bbox.ymin * h)
    width = int(bbox.width * w)
    height = int(bbox.height * h)
    
    # Add padding (30%)
    padding_x = int(width * 0.3)
    padding_y = int(height * 0.3)
    
    x1 = max(0, x - padding_x)
    y1 = max(0, y - padding_y)
    x2 = min(w, x + width + padding_x)
    y2 = min(h, y + height + padding_y)
    
    face_img = img[y1:y2, x1:x2]
    _, buffer = cv2.imencode('.jpg', face_img)
    return base64.b64encode(buffer).decode('utf-8')

@app.route('/verify/selfie', methods=['POST'])
def verify_selfie():
    """Step 1: Liveness check & Best Frame Capture."""
    data = request.json
    frames = data.get('livenessFrames', [])
    
    if not frames or len(frames) < 3:
        return jsonify({"success": False, "error": "Insufficient frames for liveness check"}), 400
    
    logger.info(f"Processing selfie verification with {len(frames)} frames")
    
    face_count = 0
    decoded_images = []
    
    # Process frames and check for face presence
    for i, b64_frame in enumerate(frames):
        img = decode_base64_img(b64_frame)
        if img is not None:
            decoded_images.append(img)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = face_detection.process(img_rgb)
            if results.detections:
                face_count += 1
    
    if not decoded_images:
        return jsonify({"success": False, "error": "Could not process any video frames"}), 400

    # Liveness success if face detected in at least 60% of frames
    face_presence_ratio = face_count / len(frames)
    logger.info(f"Liveness Check - Face detected in {face_count}/{len(frames)} frames ({face_presence_ratio:.2%})")
    
    if face_presence_ratio < 0.6:
        return jsonify({
            "success": False, 
            "error": "Liveness check failed: Face not consistently detected. Please ensure you are in a well-lit area and looking directly at the camera."
        }), 400

    # Basic variability check to ensure it's not a static high-res photo held up
    # (Just checking for some pixel-level variance across frames)
    if len(decoded_images) >= 2:
        diff = cv2.absdiff(decoded_images[0], decoded_images[-1])
        pixel_variance = np.mean(diff)
        logger.info(f"Frame variance: {pixel_variance:.4f}")
        
        if pixel_variance < 0.05: # Very low threshold, just enough to detect sensor noise/micro-movements
             return jsonify({
                "success": False, 
                "error": "Liveness check failed: Static image detected. Please move slightly."
            }), 400

    # Return the middle frame as the best selfie
    best_frame_idx = len(frames) // 2
    best_frame = frames[best_frame_idx]
    
    return jsonify({
        "success": True, 
        "liveness": True, 
        "selfie_b64": best_frame,
        "face_presence_ratio": face_presence_ratio
    })

@app.route('/verify/aadhaar', methods=['POST'])
def verify_aadhaar():
    """Step 2: Aadhaar OCR & Face Extraction."""
    if 'aadhaar' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
    
    file = request.files['aadhaar']
    img_bytes = file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return jsonify({"success": False, "error": "Invalid image format"}), 400

    # 1. OCR Logic
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Apply preprocessing
    gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    ocr_text = pytesseract.image_to_string(gray, lang='eng+hin')
    ocr_lower = ocr_text.lower()
    
    logger.info(f"OCR Result (Snippet): {ocr_text[:50]}...")
    
    # Gender check: female, mahila, etc.
    gender_patterns = [r"female", r"mahila", r"महिला", r"स्त्री", r"\bf\b"]
    is_female = any(re.search(p, ocr_lower) for p in gender_patterns)
    
    # Aadhaar number check (12 digits)
    aadhaar_match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', ocr_text) or re.search(r'\b\d{12}\b', ocr_text)
    aadhaar_number = aadhaar_match.group(0) if aadhaar_match else None
    
    # 2. Face Extraction from Aadhaar
    aadhaar_face_b64 = extract_face(img)
    
    if not is_female:
        logger.warning("Gender mismatch detected or OCR failed to find gender")
        return jsonify({
            "success": False, 
            "error": "Gender verification failed. Hectate is for women only. Please ensure your Aadhaar gender is visible."
        })
    
    if not aadhaar_number:
        logger.warning("Aadhaar number not found in OCR")
        return jsonify({
            "success": False, 
            "error": "Aadhaar number not detected. Please upload a clear, front-facing image of your Aadhaar card."
        })

    if not aadhaar_face_b64:
        logger.warning("Face not found in Aadhaar image")
        return jsonify({
            "success": False, 
            "error": "Face not detected on Aadhaar card. Please use a high-quality photo."
        })

    return jsonify({
        "success": True,
        "ocr_data": {
            "gender": "female",
            "aadhaar_number": aadhaar_number,
        },
        "aadhaar_face_b64": aadhaar_face_b64
    })

@app.route('/verify/match', methods=['POST'])
def verify_match():
    """Step 3: Face Matching (Selfie vs Aadhaar Face)."""
    data = request.json
    selfie_b64 = data.get('selfie_b64')
    aadhaar_face_b64 = data.get('aadhaar_face_b64')
    
    if not selfie_b64 or not aadhaar_face_b64:
        return jsonify({"success": False, "error": "Missing image data"}), 400
    
    img1 = decode_base64_img(selfie_b64)
    img2 = decode_base64_img(aadhaar_face_b64)
    
    if img1 is None or img2 is None:
        return jsonify({"success": False, "error": "Error processing images"}), 400
        
    try:
        if DEEPFACE_AVAILABLE:
            selfie_path = "temp_selfie.jpg"
            aadhaar_path = "temp_aadhaar.jpg"
            cv2.imwrite(selfie_path, img1)
            cv2.imwrite(aadhaar_path, img2)
            
            try:
                result = DeepFace.verify(
                    img1_path=selfie_path, 
                    img2_path=aadhaar_path,
                    model_name="Facenet512",
                    detector_backend="opencv",
                    enforce_detection=False
                )
                
                os.remove(selfie_path)
                os.remove(aadhaar_path)
                
                return jsonify({
                    "success": True,
                    "match": result["verified"],
                    "confidence": 1 - result["distance"],
                    "distance": result["distance"],
                    "threshold": result["threshold"]
                })
            except Exception as df_e:
                logger.error(f"DeepFace error: {df_e}")
                if os.path.exists(selfie_path): os.remove(selfie_path)
                if os.path.exists(aadhaar_path): os.remove(aadhaar_path)
                pass

        # Robust Fallback Logic
        img1_res = cv2.resize(img1, (128, 128))
        img2_res = cv2.resize(img2, (128, 128))
        hsv1 = cv2.cvtColor(img1_res, cv2.COLOR_BGR2HSV)
        hsv2 = cv2.cvtColor(img2_res, cv2.COLOR_BGR2HSV)
        hist1 = cv2.calcHist([hsv1], [0, 1], None, [180, 256], [0, 180, 0, 256])
        hist2 = cv2.calcHist([hsv2], [0, 1], None, [180, 256], [0, 180, 0, 256])
        cv2.normalize(hist1, hist1, 0, 1, cv2.NORM_MINMAX)
        cv2.normalize(hist2, hist2, 0, 1, cv2.NORM_MINMAX)
        corr = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
        
        gray1 = cv2.cvtColor(img1_res, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(img2_res, cv2.COLOR_BGR2GRAY)
        diff = cv2.absdiff(gray1, gray2)
        sim_score = 1.0 - (np.mean(diff) / 255.0)
        
        final_score = (corr * 0.6) + (sim_score * 0.4)
        logger.info(f"Fallback Matching - Corr: {corr:.2f}, Sim: {sim_score:.2f}, Final: {final_score:.2f}")
        
        is_match = final_score > 0.35 
        
        return jsonify({
            "success": True,
            "match": is_match,
            "confidence": final_score,
            "method": "enhanced_fallback"
        })
            
    except Exception as e:
        logger.error(f"Matching loop error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Hectate Vision Service on port 5001")
    app.run(port=5001, debug=False, host='0.0.0.0')
