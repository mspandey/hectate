# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import cv2
import pytesseract
import re
import os
import numpy as np

# path to tesseract exe (Windows)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(img):
    """Upscale small images, convert to grayscale, denoise."""
    h, w = img.shape[:2]
    # Upscale if image is small
    if w < 600:
        scale = 600 / w
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Denoise + threshold for cleaner OCR
    gray = cv2.fastNlMeansDenoising(gray, h=10)
    _, gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return gray

def extract_text_from_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return None
    processed = preprocess_image(img)
    # Try with page segmentation mode 6 (uniform block of text)
    config = '--psm 6 --oem 3'
    text = pytesseract.image_to_string(processed, lang='eng', config=config)
    return text

def extract_text_from_pdf(pdf_path):
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        full_text = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            mat = fitz.Matrix(3, 3)  # 3x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            img_array = np.frombuffer(img_data, dtype=np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            processed = preprocess_image(img)
            text = pytesseract.image_to_string(processed, lang='eng', config='--psm 6 --oem 3')
            full_text += f"\n[Page {page_num+1}]\n" + text
        return full_text
    except ImportError:
        return "[ERROR] PyMuPDF not installed. Run: pip install pymupdf"

def check_aadhaar(text):
    # Match 12-digit number with optional spaces (xxxx xxxx xxxx)
    matches = re.findall(r'\b(\d{4})\s?(\d{4})\s?(\d{4})\b', text)
    return [' '.join(m) for m in matches]

def check_gender(text):
    text_lower = text.lower()
    if "female" in text_lower:
        return "Female"
    elif "male" in text_lower:
        return "Male"
    else:
        return "Unknown"

def process_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    print(f"\n{'='*60}")
    print(f"[FILE] {os.path.basename(file_path)}")
    print(f"{'='*60}")

    if ext == '.pdf':
        text = extract_text_from_pdf(file_path)
    elif ext in ['.jpg', '.jpeg', '.png', '.bmp']:
        text = extract_text_from_image(file_path)
    else:
        print(f"[SKIP] Unsupported format: {ext}")
        return

    if text is None:
        print("[ERROR] Could not read file.")
        return

    print("\n--- Extracted Text ---")
    print(text.strip())
    print("----------------------")

    aadhaar = check_aadhaar(text)
    gender = check_gender(text)

    print()
    if aadhaar:
        print(f"  Aadhaar Number : {aadhaar}")
        print(f"  Gender Detected: {gender}")
        if gender == "Female":
            print("  Result         : Access Granted [OK]")
        else:
            print(f"  Result         : Access Denied [BLOCKED] — Gender: {gender}")
    else:
        print(f"  Gender Detected: {gender}")
        print("  Result         : No valid Aadhaar number detected [BLOCKED]")

# --- Run on all files in the folder ---
folder = r"C:\Users\Amisha\OneDrive\Desktop\ocr testing"
supported = ['.jpg', '.jpeg', '.png', '.bmp', '.pdf']

files = [
    f for f in os.listdir(folder)
    if os.path.splitext(f)[1].lower() in supported
    and f != "aadhaar_sample.jpg"  # skip mock test image
]

if not files:
    print("[INFO] No image or PDF files found in folder.")
else:
    print(f"[INFO] Found {len(files)} file(s) to process...\n")
    for fname in sorted(files):
        process_file(os.path.join(folder, fname))

print(f"\n{'='*60}")
print("[DONE] All files processed.")