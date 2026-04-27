import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
import numpy as np
import os

# Mock model path
MP_MODEL = os.path.abspath("models/blaze_face_short_range.tflite")

print(f"Testing MediaPipe with numpy {np.__version__}...")
try:
    base_opts = mp_python.BaseOptions(model_asset_path=MP_MODEL)
    det_opts = mp_vision.FaceDetectorOptions(
        base_options=base_opts, min_detection_confidence=0.4
    )
    detector = mp_vision.FaceDetector.create_from_options(det_opts)
    
    # Create a dummy image (100x100 RGB)
    rgb_data = np.zeros((100, 100, 3), dtype=np.uint8)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_data)
    
    print("Running detection...")
    result = detector.detect(mp_img)
    print("Detection successful!")
except Exception as e:
    print(f"Caught exception: {e}")
except SystemError as e:
    print(f"Caught SystemError: {e}")
except:
    print("CRASHED!")
