import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import cv2
import numpy as np
import mediapipe as mp
import os

# ── Model paths ───────────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

face_proto_path   = os.path.join(MODEL_DIR, "deploy.prototxt")
face_model_path   = os.path.join(MODEL_DIR, "res10_300x300_ssd.caffemodel")
gender_proto_path = os.path.join(MODEL_DIR, "deploy_gender.prototxt")
gender_model_path = os.path.join(MODEL_DIR, "gender_net.caffemodel")
mp_model_path     = os.path.join(MODEL_DIR, "blaze_face_short_range.tflite")

# ── Validate models exist ─────────────────────────────────────────────────────
missing = [p for p in [mp_model_path, gender_proto_path, gender_model_path]
           if not os.path.exists(p)]
if missing:
    print("ERROR: Missing model files:")
    for m in missing:
        print(f"  {m}")
    print("\nRun the previous setup script first to download models.")
    sys.exit(1)

# ── Load models ───────────────────────────────────────────────────────────────
print("Loading models...")

# MediaPipe face detector
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

base_opts = mp_python.BaseOptions(model_asset_path=mp_model_path)
det_opts  = mp_vision.FaceDetectorOptions(
    base_options=base_opts,
    min_detection_confidence=0.4
)
mp_detector = mp_vision.FaceDetector.create_from_options(det_opts)
print("  [OK] MediaPipe face detector")

# OpenCV DNN gender classifier
gender_net = cv2.dnn.readNet(gender_model_path, gender_proto_path)
print("  [OK] Gender classifier")

GENDER_LIST = ["Male", "Female"]
# Mean BGR values for gender model preprocessing
GENDER_MEAN = (78.4263377603, 87.7689143744, 114.895847746)

# ── Open webcam ───────────────────────────────────────────────────────────────
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("ERROR: Cannot open webcam.")
    sys.exit(1)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

print("\n[READY] Camera open - press 'q' to quit\n")

# ── Gender vote smoothing (last N frames per face region) ─────────────────────
SMOOTH_FRAMES = 8
gender_votes = []   # list of "Male"/"Female" predictions

while True:
    ret, frame = cap.read()
    if not ret:
        break

    h, w = frame.shape[:2]
    display = frame.copy()

    # ── 1. Detect faces with MediaPipe ────────────────────────────────────────
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    det_result = mp_detector.detect(mp_img)

    if not det_result.detections:
        gender_votes.clear()
        cv2.putText(display, "NO FACE DETECTED", (20, 60),
                    cv2.FONT_HERSHEY_DUPLEX, 1.1, (0, 100, 255), 2)
    else:
        for det in det_result.detections:
            bb   = det.bounding_box
            x1   = max(0, bb.origin_x)
            y1   = max(0, bb.origin_y)
            x2   = min(w, x1 + bb.width)
            y2   = min(h, y1 + bb.height)

            face_roi = frame[y1:y2, x1:x2]
            if face_roi.size == 0:
                continue

            # ── 2. Predict gender from face crop ──────────────────────────
            blob = cv2.dnn.blobFromImage(
                face_roi, 1.0, (227, 227), GENDER_MEAN, swapRB=False
            )
            gender_net.setInput(blob)
            preds   = gender_net.forward()
            gender  = GENDER_LIST[preds[0].argmax()]
            g_conf  = int(preds[0].max() * 100)

            # ── 3. Smooth over recent frames ──────────────────────────────
            gender_votes.append(gender)
            if len(gender_votes) > SMOOTH_FRAMES:
                gender_votes.pop(0)
            female_votes = gender_votes.count("Female")
            male_votes   = gender_votes.count("Male")
            smoothed = "Female" if female_votes >= male_votes else "Male"

            # ── 4. Draw results ───────────────────────────────────────────
            if smoothed == "Female":
                box_color  = (0, 200, 80)      # green
                status     = "VERIFIED  |  Female"
                bg_color   = (0, 150, 60)
            else:
                box_color  = (30, 30, 220)     # red
                status     = "REJECTED  |  Male"
                bg_color   = (20, 20, 180)

            # Face bounding box
            cv2.rectangle(display, (x1, y1), (x2, y2), box_color, 2)

            # Gender label above the box
            label = f"{smoothed}  {g_conf}%"
            (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            cv2.rectangle(display,
                          (x1, max(0, y1 - lh - 12)),
                          (x1 + lw + 8, y1),
                          box_color, -1)
            cv2.putText(display, label,
                        (x1 + 4, max(lh, y1 - 6)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # ── 5. Status banner at top ───────────────────────────────────────
        banner_h = 55
        cv2.rectangle(display, (0, 0), (w, banner_h), bg_color, -1)
        cv2.putText(display, status, (20, 38),
                    cv2.FONT_HERSHEY_DUPLEX, 1.1, (255, 255, 255), 2)

        # Confidence bar
        bar_x, bar_y, bar_w, bar_h2 = w - 170, 15, 140, 18
        f_ratio = female_votes / max(len(gender_votes), 1)
        cv2.rectangle(display, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h2),
                      (60, 60, 60), -1)
        cv2.rectangle(display, (bar_x, bar_y),
                      (bar_x + int(bar_w * f_ratio), bar_y + bar_h2),
                      (0, 200, 80), -1)
        cv2.putText(display, "F", (bar_x - 18, bar_y + 14),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1)
        cv2.putText(display, "M", (bar_x + bar_w + 4, bar_y + 14),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1)

    cv2.imshow("HECATE  Gender Verification", display)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
mp_detector.close()
cv2.destroyAllWindows()