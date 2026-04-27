@echo off
echo [Hectate] Starting Python Verification Service on port 5001...

REM Use the local venv
set VENV="%~dp0venv\Scripts\activate.bat"
set APP=%~dp0app.py

if exist %VENV% (
  echo [Hectate] Using existing local venv
  call %VENV%
) else (
  echo [Hectate] No venv found — using system Python
)

echo [Hectate] Installing/checking dependencies...
pip install flask flask-cors opencv-python mediapipe pytesseract pymupdf numpy Pillow --quiet

echo [Hectate] Starting service...
python "%APP%"
pause
