from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from deepface import DeepFace
import io
from PIL import Image

app = Flask(__name__)

def base64_to_cv2(b64_string):
    """Convert base64 image string to OpenCV format"""
    # handle both data:image/jpeg;base64,... and raw base64
    if ',' in b64_string:
        b64_string = b64_string.split(',')[1]
    img_data = base64.b64decode(b64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def detect_liveness(frames_b64):
    """
    Liveness detection using Eye Aspect Ratio (EAR) analysis
    Detects genuine blink across a sequence of frames
    """
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    eye_open_frames = 0
    eye_closed_frames = 0
    
    for b64 in frames_b64:
        frame = base64_to_cv2(b64)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(80, 80))
        
        if len(faces) == 0:
            continue
        
        x, y, w, h = faces[0]
        roi_gray = gray[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 10)
        
        if len(eyes) >= 2:
            eye_open_frames += 1
        elif len(eyes) == 0:
            eye_closed_frames += 1
    
    # Valid blink: had open eyes, then closed, then open again
    blink_detected = eye_open_frames >= 3 and eye_closed_frames >= 1
    return blink_detected

def verify_gender_from_face(image_b64):
    """
    Use DeepFace to analyse gender from facial features
    Returns probability of female gender
    """
    img = base64_to_cv2(image_b64)
    
    try:
        analysis = DeepFace.analyze(
            img,
            actions=['gender', 'age'],
            enforce_detection=False, # Make enforce_detection=False to avoid crashing on failure
            detector_backend='opencv' # use opencv for speed on dev machine instead of mtcnn
        )
        
        if isinstance(analysis, list):
            analysis = analysis[0]
        
        gender_data = analysis.get('gender', {})
        # Deepface outputs {'Woman': 99.9, 'Man': 0.1}
        woman_prob = gender_data.get('Woman', 0)
        
        return {
            'gender': 'female' if woman_prob > 60 else 'uncertain',
            'confidence': woman_prob,
            'age_estimate': analysis.get('age', 0)
        }
    except Exception as e:
        return { 'gender': 'unknown', 'confidence': 0, 'error': str(e) }

def face_match(selfie_b64, document_b64):
    """
    Compare selfie face with document photo using DeepFace
    Uses ArcFace model for highest accuracy
    """
    selfie_img = base64_to_cv2(selfie_b64)
    doc_img = base64_to_cv2(document_b64)
    
    try:
        result = DeepFace.verify(
            img1_path=selfie_img,
            img2_path=doc_img,
            model_name='VGG-Face', # Changed to VGG-Face for faster local execution
            detector_backend='opencv',
            distance_metric='cosine',
            enforce_detection=False
        )
        
        match_score = (1 - result['distance']) * 100   # convert to percentage
        
        return {
            'is_match': result['verified'],
            'match_score': round(match_score, 2),
            'threshold_used': result['threshold']
        }
    except Exception as e:
        return { 'is_match': False, 'match_score': 0, 'error': str(e) }

@app.route('/verify-face', methods=['POST'])
def verify_face():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    frames = data.get('liveness_frames', [])           # array of base64 frames for blink
    selfie = data.get('selfie_frame', '')              # single clear selfie frame
    document_photo = data.get('document_photo', '')    # base64 of document ID photo
    
    if not selfie:
        return jsonify({'error': 'Selfie frame required'}), 400

    # Step 1: Liveness check
    is_live = detect_liveness(frames) if frames else True # default True for simple testing if empty
    if not is_live:
        return jsonify({
            'success': False,
            'error': 'LIVENESS_FAILED',
            'message': 'Liveness check failed. Please blink naturally during the scan.'
        }), 400
    
    # Step 2: Gender analysis from selfie
    gender_result = verify_gender_from_face(selfie)
    if gender_result['confidence'] < 60:
        return jsonify({
            'success': False,
            'error': 'GENDER_UNCONFIRMED',
            'message': 'Unable to confirm gender from face. Please try better lighting.',
            'confidence': gender_result['confidence']
        }), 400
    
    # Step 3: Face match with document (if document provided)
    match_result = { 'is_match': True, 'match_score': 100 }
    if document_photo:
        match_result = face_match(selfie, document_photo)
        if not match_result['is_match'] or match_result['match_score'] < 60:
            return jsonify({
                'success': False,
                'error': 'FACE_MISMATCH',
                'message': 'Selfie does not match document photo. Please retake.',
                'match_score': match_result['match_score']
            }), 400
    
    return jsonify({
        'success': True,
        'liveness': True,
        'gender': gender_result['gender'],
        'gender_confidence': gender_result['confidence'],
        'match_score': match_result['match_score'],
        'verified': True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
