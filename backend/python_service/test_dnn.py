import cv2
import numpy as np
import os

MODEL_DIR = "models"
GENDER_PROTO = os.path.join(MODEL_DIR, "deploy_gender.prototxt")
GENDER_MODEL = os.path.join(MODEL_DIR, "gender_net.caffemodel")
GENDER_MEAN  = (78.4263377603, 87.7689143744, 114.895847746)

print("Loading gender net...")
net = cv2.dnn.readNet(GENDER_MODEL, GENDER_PROTO)

print("Creating dummy face ROI...")
face_roi = np.zeros((227, 227, 3), dtype=np.uint8)

print("Running forward pass...")
try:
    blob = cv2.dnn.blobFromImage(face_roi, 1.0, (227, 227), GENDER_MEAN, swapRB=False)
    net.setInput(blob)
    preds = net.forward()
    print(f"Success! Preds shape: {preds.shape}")
    print(f"Output: {preds}")
except Exception as e:
    print(f"Caught exception: {e}")
