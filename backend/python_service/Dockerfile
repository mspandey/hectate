FROM python:3.10-slim

# Install system dependencies needed for OpenCV, Tesseract OCR, and DeepFace
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set up a non-root user (required by Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy requirements and install dependencies
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Pre-download DeepFace models (optional but speeds up first request)
# RUN python -c "from deepface import DeepFace; DeepFace.build_model('VGG-Face')"

# Copy application files
COPY --chown=user:user . .

# Expose port (Hugging Face Spaces uses 7860 by default)
EXPOSE 7860

# Run the app with gunicorn binding to port 7860
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "120", "app:app"]
