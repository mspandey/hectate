# -*- coding: utf-8 -*-
"""
face_match.py — Hectate Step 2: Face Matching
=============================================
Compares the selfie (from Step 1) with the face on the Aadhaar card (Step 2).
"""

import cv2
import numpy as np
from face_capture import b64_to_cv2

_deepface = None

def _load_deepface():
    global _deepface
    if _deepface is None:
        try:
            from deepface import DeepFace
            _deepface = DeepFace
        except ImportError:
            print("[MATCH][WARN] DeepFace not installed.")
    return _deepface

def match_faces(selfie_img: np.ndarray, document_img: np.ndarray) -> dict:
    df = _load_deepface()
    if df is None: return {"is_match": False, "match_score": 0.0, "error": "DeepFace unavailable"}
    
    ARCFACE_THRESHOLD = 0.50
    try:
        result = df.verify(
            img1_path=selfie_img,
            img2_path=document_img,
            model_name='ArcFace',
            detector_backend='retinaface',
            distance_metric='cosine',
            enforce_detection=False,
            align=True
        )
        distance = result.get('distance', 1.0)
        is_match = distance <= ARCFACE_THRESHOLD
        confidence = max(0.0, (1.0 - distance / ARCFACE_THRESHOLD) * 100)
        return {"is_match": is_match, "match_score": round(confidence, 1), "distance": round(distance, 4)}
    except Exception as e:
        print(f"[MATCH] ArcFace failed, trying Facenet: {e}")
        try:
            result = df.verify(
                img1_path=selfie_img, img2_path=document_img,
                model_name='Facenet512', detector_backend='mtcnn',
                distance_metric='cosine', enforce_detection=False
            )
            dist = result.get('distance', 1.0)
            is_match = dist <= 0.30
            conf = max(0.0, (1.0 - dist / 0.30) * 100)
            return {"is_match": is_match, "match_score": round(conf, 1), "distance": round(dist, 4)}
        except Exception as e2:
            return {"is_match": False, "match_score": 0.0, "error": str(e2)}
