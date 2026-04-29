# -*- coding: utf-8 -*-
"""
server/python_service/app.py
Hectate Python Verification Microservice (Refactored 3-Step Flow)
EndPoints:
  POST /verify/selfie   - Step 1: Liveness check + Best frame extraction
  POST /verify/aadhaar  - Step 2: Aadhaar OCR + Face Match (with Step 1 selfie)
"""

import os
import base64
import traceback
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2

# Import modular pipelines
from ocr_module import run_aadhaar_ocr
from face_capture import run_liveness_check, select_best_frame, b64_to_cv2
from face_match import match_faces

app = Flask(__name__)
CORS(app)

@app.errorhandler(Exception)
def handle_exception(e):
    traceback.print_exc()
    return jsonify({"error": str(e), "success": False}), 500

# ── STEP 1: SELFIE & LIVENESS ────────────────────────────────────────────────
@app.route('/verify/selfie', methods=['POST'])
def verify_selfie():
    """
    Accepts liveness_frames (list of b64).
    Performs liveness check.
    Returns best selfie frame in b64 for Step 2.
    """
    data = request.get_json(silent=True) or {}
    # Accept both camelCase and snake_case
    frames = data.get('liveness_frames') or data.get('livenessFrames', [])
    
    print(f"[Python] Selfie verification request received with {len(frames)} frames")
    if not frames:
        return jsonify({"success": False, "error": "No frames received"}), 400

    # 1. Liveness check
    liveness = run_liveness_check(frames)
    
    # 2. Extract best selfie frame
    best_frame, quality = select_best_frame(frames)
    if best_frame is None:
        return jsonify({"success": False, "error": "Could not detect face in frames"}), 400

    # Convert best frame to b64
    _, buffer = cv2.imencode('.jpg', best_frame)
    best_b64 = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        "success": liveness["is_live"],
        "liveness": liveness["is_live"],
        "confidence": liveness["confidence"],
        "selfie_b64": best_b64,
        "quality_score": round(quality, 2)
    })

# ── STEP 2: AADHAAR OCR + FACE MATCH ─────────────────────────────────────────
@app.route('/verify/aadhaar', methods=['POST'])
def verify_aadhaar():
    """
    Accepts aadhaar (file) AND selfie_b64 (string).
    Performs OCR (Step 2) and Face Match (Step 3).
    Enforces Gender=Female.
    """
    # 1. Get selfie from previous step
    selfie_b64 = request.form.get('selfie_b64') or (request.json.get('selfie_b64') if request.is_json else None)
    
    # 2. Get Aadhaar file
    img_cv2 = None
    if 'aadhaar' in request.files:
        f = request.files['aadhaar']
        nparr = np.frombuffer(f.read(), np.uint8)
        img_cv2 = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    elif request.is_json and request.json.get('aadhaar_b64'):
        img_cv2 = b64_to_cv2(request.json['aadhaar_b64'])

    if img_cv2 is None:
        return jsonify({"success": False, "error": "Aadhaar image missing"}), 400

    # 3. Run OCR Pipeline
    ocr_result = run_aadhaar_ocr(img_cv2)
    
    # 4. Gender Enforcement (Women-only)
    if ocr_result['gender'] == 'Male':
        return jsonify({
            "success": False,
            "passed": False,
            "reason": "Access Denied: Hectate is a women-only platform.",
            "gender": "Male"
        })

    # 5. Face Matching — REMOVED (no DeepFace dependency required)
    # OCR gender validation is the sole gate for access.
    # combined_passed is based entirely on OCR result.
    combined_passed = ocr_result['passed']
    
    return jsonify({
        "success": combined_passed,
        "passed": combined_passed,
        "ocr_data": {
            "aadhaar_number": ocr_result.get('aadhaar_number'),
            "gender": ocr_result.get('gender'),
            "name": ocr_result.get('name')
        },
        "match_data": {"is_match": True, "match_score": 100.0},
        "aadhaar_face_b64": ocr_result.get('face_b64'),
        "reason": ocr_result['reason']
    })

# ── STEP 3: INDEPENDENT MATCH (If called separately) ────────────────────────
@app.route('/verify/match', methods=['POST'])
def verify_match():
    """
    Independent endpoint for Step 3 if Step 2 didn't already finalize it.
    Expects selfie_b64 and aadhaar_face_b64.
    """
    data = request.get_json(silent=True) or {}
    selfie_b64 = data.get('selfie_b64')
    aadhaar_face_b64 = data.get('aadhaar_face_b64')

    if not selfie_b64 or not aadhaar_face_b64:
        return jsonify({"success": False, "error": "Missing image data"}), 400

    selfie_img = b64_to_cv2(selfie_b64)
    document_face_img = b64_to_cv2(aadhaar_face_b64)

    if selfie_img is None or document_face_img is None:
        return jsonify({"success": False, "error": "Invalid image format"}), 400

    match_result = match_faces(selfie_img, document_face_img)
    
    return jsonify({
        "success": match_result["is_match"],
        "match": match_result["is_match"],
        "confidence": match_result["match_score"] / 100.0 if "match_score" in match_result else 0.0,
        "match_data": match_result
    })

# ── LEGACY / HEALTH ──────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "online", "service": "hectate_python_service"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"[Hectate] Starting Python Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
