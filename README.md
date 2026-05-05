<div align="center">

<!-- ANIMATED BANNER — replace URL with your actual GIF -->
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzN1eHUxdm5xYTZweWNoN3VsaTM1NWd3MmI5YTF3dmphenFsdHJ5ZiZlcD12MV9pbnRlcm5hbGdfZ2lmX2J5X2lkJmN0PWc/3oKIPEqDGUULpEU0aQ/giphy.gif" width="100%" height="220" style="object-fit:cover;border-radius:12px;" alt="Hectate Protocol Banner"/>

<br/><br/>

# ⬡ HECTATE

### *Protocol — Encrypted Command Center for Women*

<br/>

![Stack](https://img.shields.io/badge/stack-Python%20%2B%20React%2FVite-00BFFF?style=for-the-badge&labelColor=030810)
![Access](https://img.shields.io/badge/access-WOMEN%20ONLY-FF006E?style=for-the-badge&labelColor=030810)

<br/>

> **Hectate** is a gender-gated, AI-enforced digital safe space for women — secured by a triple-layer biometric verification engine, powered by real-time sentiment moderation, and anchored to a verified legal empowerment hub. If you are not verified female, the door does not open.

<br/>

```
[ LIVENESS CHECK ] → [ BIOMETRIC MATCH ] → [ UPLOAD AADHAAR ] → [ OCR EXTRACTION ] → [ ✓ ACCESS GRANTED ]
```

</div>

---

## ⚡ Why Hectate?

Online spaces for women are routinely weaponised against them. Hectate is built on one principle: **the entry gate itself is the safety mechanism.** Not community rules. Not moderation queues. The architecture.

- 🔐 No man can register — the AI won't let them.  
- 🛡 No fake persona survives the biometric check.  
- ⚖️ Every user knows their legal rights, on demand.  
- 🤝 Every advocate on the platform is verified.

---

## 🛠 The Hectate Engine — Technology Stack

<table>
<thead>
<tr>
<th>Layer</th>
<th>Library</th>
<th>Role</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="4"><strong>🧠 AI Identity Verification</strong><br/><sub>Python Backend</sub></td>
<td><code>pytesseract</code></td>
<td>OCR engine — extracts Aadhaar numbers, names & gender from uploaded documents in milliseconds</td>
</tr>
<tr>
<td><code>MediaPipe</code></td>
<td>3D face mesh tracking for liveness detection — defeats static photos and deepfakes</td>
</tr>
<tr>
<td><code>DeepFace + RetinaFace</code></td>
<td>Dual biometric match — RetinaFace handles low-light detection; ArcFace/VGG-Face confirms identity with academic-grade accuracy</td>
</tr>
<tr>
<td><code>OpenCV + Pillow</code></td>
<td>Real-time frame manipulation, image processing & environmental lighting analysis</td>
</tr>
<tr>
<td rowspan="2"><strong>🛡 Security & Moderation</strong></td>
<td><code>vaderSentiment</code></td>
<td>NLP sentiment analysis — flags toxic and harassing content before it reaches the community feed</td>
</tr>
<tr>
<td><code>PyMuPDF (fitz)</code></td>
<td>High-performance rendering and data extraction from Aadhaar PDF uploads</td>
</tr>
<tr>
<td rowspan="3"><strong>✨ Frontend Experience</strong><br/><sub>React / Vite</sub></td>
<td><code>face-api.js</code></td>
<td>Client-side real-time face detection — zero server latency, instant "AI is watching" feedback</td>
</tr>
<tr>
<td><code>Spline (@splinetool)</code></td>
<td>Interactive 3D landing portal — premium security aesthetic, not a simple sign-up form</td>
</tr>
<tr>
<td><code>GSAP (GreenSock)</code></td>
<td>Cinematic dashboard entrance animations and high-performance scroll-driven transitions</td>
</tr>
</tbody>
</table>

---

## 🔐 Verification Protocol — How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    HECTATE ENTRY PROTOCOL 2.1                   │
└─────────────────────────────────────────────────────────────────┘

  STEP 1 ──▶   Liveness Detection (MediaPipe)
              68-point 3D face landmark tracking via front camera
              Blink, turn, nod prompts defeat static photos & deepfakes
              Live session token generated on pass

  STEP 2 ──▶   Biometric Match (RetinaFace + ArcFace)
              Selfie compared against document photo
              Cosine similarity threshold: ≥ 0.68
              Low-light fallback: RetinaFace re-processes under enhanced exposure

  STEP 3 ──▶  Document Upload User uploads Aadhaar card (image or PDF) PyMuPDF extracts raw content from PDF uploads

  STEP 4 ──▶ OCR Extraction (pytesseract)
              Reads: Full Name · Aadhaar Number · Gender Field
              Gender field MUST read "Female" — any other value = REJECTED

  RESULT ──▶  All 4 stages pass → JWT issued → Dashboard unlocked
              Any stage fails → Session terminated · No data retained
```

---

## 🌟 Feature Pillars

### ⚖️ Know Your Rights — Digital Law Library

A curated repository of Indian laws protecting women — built for **readability**, not legal jargon.

- **In-App PDF Viewer** — read official government documents without leaving the secure Hectate environment  
- **Raw Preview Snippets** — quick-read summaries before diving into full legislation
- **Laws Covered:**
  - Protection of Women from Domestic Violence Act, 2005
  - Sexual Harassment of Women at Workplace (POSH) Act, 2013
  - Indian Penal Code sections on violence & harassment
  - Dowry Prohibition Act, Maternity Benefit Act, and more

### 🏛 Verified Legal Hub — Nationwide Advocate Directory

| Feature | Detail |
|---|---|
| Scope | Female advocates across all Indian states |
| Verification | Manual + document-backed credential check |
| Contact | Encrypted in-app messaging only |
| Search | Filter by state, specialisation, language |

### 💬 AI-Moderated Community Feed

Posts pass through `vaderSentiment` before publication. Toxicity is intercepted at the architecture level — not flagged after the damage is done. Compound scores below threshold trigger automatic hold for review.

---

## 🚀 Quickstart

### Prerequisites

```bash
Python >= 3.9
Node.js >= 18
Tesseract OCR (system install)
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/hectate.git
cd hectate

# 2. Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env       # Fill in your secrets

# 3. Frontend setup
cd ../frontend
npm install

# 4. Launch (two terminals)
# Terminal A:
cd backend && python app.py

# Terminal B:
cd frontend && npm run dev
```

### Environment Variables

```env
HECTATE_SECRET_KEY=your_jwt_secret_here
OCR_ENGINE=tesseract
FACE_MODEL=ArcFace
LIVENESS_THRESHOLD=0.75
BIOMETRIC_SIMILARITY_THRESHOLD=0.68
SENTIMENT_TOXICITY_THRESHOLD=-0.5
```

---

## 🏗 System Architecture

```
                          ┌──────────────────────┐
                          │    React / Vite UI   │
                          │  Spline · GSAP · PWA │
                          └──────────┬───────────┘
                                     │ REST / WebSocket
                          ┌──────────▼───────────┐
                          │   Python Flask API   │
                          └──┬──────────────┬────┘
                             │              │
               ┌─────────────▼──┐    ┌──────▼──────────────┐
               │  AI Auth Layer │    │  Moderation Layer   │
               │                │    │                     │
               │  pytesseract   │    │  vaderSentiment     │
               │  MediaPipe     │    │  Content Queue      │
               │  DeepFace      │    │  Auto-flag + Hold   │
               │  RetinaFace    │    └─────────────────────┘
               │  OpenCV/Pillow │
               └────────────────┘
```

---

## 📊 Security Design Principles

| Principle | Implementation |
|---|---|
| **Zero Trust Entry** | Every session re-verified. No cookies bypass auth. |
| **Data Minimisation** | Biometric data processed in-memory, never persisted |
| **Fail Closed** | Any verification error = access denied, no fallback |
| **Encrypted Transit** | All API calls over HTTPS with JWT signing |
| **AI Moderation First** | Content never reaches feed without sentiment clearance |

---

<div align="center">

*"Safety is not a feature. It's the foundation."*

![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-FF9933?style=flat-square&labelColor=1A1A2E)
![Women First](https://img.shields.io/badge/Women-First%20🛡-FF006E?style=flat-square&labelColor=1A1A2E)
![AI Powered](https://img.shields.io/badge/AI-Powered%20⬡-00FF9D?style=flat-square&labelColor=1A1A2E)

</div>
