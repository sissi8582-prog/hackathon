# SinoScholar — AI Admissions Advisor for Indonesian Students

## A · Problem Statement

Indonesian high‑school and undergrad applicants struggle to discover, understand, and meet Chinese universities’ admission requirements. Information is fragmented across PDFs, spreadsheets, and web pages in mixed languages; matching one’s CV (GPA, HSK, IELTS/TOEFL) to program policies is manual and error‑prone. This causes low confidence, missed deadlines, and suboptimal program choices.

## B · Solution

SinoScholar is a web app that:
- Extracts key facts from a student’s CV (GPA, HSK level/score, IELTS/TOEFL) using AI with OCR fallback.
- Matches the profile against curated program policies and a built‑in knowledge base (documents list, major catalog), producing structured “matched vs. to‑confirm” checklists and AI‑generated recommendations in English or Bahasa Indonesia.
- Lets admins upload/refresh knowledge files securely; users can favorite programs and compare them in a table.

User flow:
1) Upload CV (PDF/DOCX/TXT) or paste text → AI parses scores and interests.  
2) Choose language (EN/ID) → Search Programs → see ranked results with matched/missing items.  
3) Open “AI Recommendations” for rationale, next steps, scholarships, and deadlines.  
4) Favorite programs → Compare page shows side‑by‑side table.  
5) Admins manage knowledge base via protected endpoints/UI.

## C · Target Users

Primary user: Indonesian high‑school seniors and undergrads applying to Chinese universities; secondarily, school counselors.  
Usage scenario: A grade‑12 student uploads a CV, gets extracted GPA 3.6 / HSK‑4 / IELTS 6.5, filters for Beijing + CS, and receives programs ranked by fit with explicit missing items and deadlines.

## D · Core Value Proposition

For Indonesian applicants and counselors, SinoScholar analyzes CVs and university policies to deliver bilingual, actionable recommendations with matched/missing items, so they can select suitable programs and avoid missed requirements—unlike manual browsing of PDFs and disparate sites.

Brief explanation: SinoScholar centralizes policy data, extracts CV facts (with OCR for scanned PDFs), and uses LLM reasoning with a knowledge base to explain eligibility, scholarships, and deadlines. It reduces research time and improves submission quality.

## E · AI & Technical Approach

AI / model types:
- LLM (MiniMax chat completions) for CV information extraction (when configured) and recommendation reasoning.
- Embeddings (MiniMax embeddings) for knowledge chunk retrieval (documents list, major catalog).

Role of AI:
- Parse noisy CV text, generate structured recommendations, and summarize matched vs. to‑confirm elements in EN/ID.

Why AI: Program policies vary in format and language; purely rule‑based parsing is brittle. LLMs handle heterogeneity and summarization; embeddings improve context retrieval relevance.

## F · Key Assumptions

1) Applicants can provide CVs with at least basic textual data; otherwise OCR can recover enough content for extraction.  
2) Program policies are kept reasonably current in the knowledge base; admins can upload new files when policies change.  
3) MiniMax API access is available for production; if not, the product falls back to regex extraction and rule‑only ranking.

## G · Differentiation (Optional)

- Bilingual output (EN/ID) with one‑click switching.  
- Secure, admin‑only knowledge management built into the app.  
- OCR fallback for scanned PDFs and robust JSON schema validation/repair for LLM outputs.

---

## Architecture & Tech Stack

- Backend: FastAPI (Python), SQLite (SQLAlchemy), JWT auth, CORS.  
- AI: MiniMax chat completions (recommendations, CV extraction), MiniMax embeddings (chunk retrieval).  
- Parsing: pypdf → pdfminer.six fallback; optional OCR via pdf2image + Tesseract.  
- Frontend: Vanilla HTML/CSS/JS (single page), i18n (EN/ID), Favorites & Compare page.  
- Data: universities table seeded from backend/data/programs.json; admin‑managed knowledge files under /knowledge.

## Directory Structure

```
hackathon/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app, OCR, recommend API, admin endpoints
│   │   ├── parser.py              # CV extraction (MiniMax → Anthropic → regex)
│   │   ├── recommend_prompt.py    # LLM prompt builder (EN/ID)
│   │   ├── schemas.py             # LLM JSON schema + coercion
│   │   ├── programs.py            # Filter/detail/compare via DB
│   │   ├── models.py              # SQLAlchemy models (universities, favorites)
│   │   ├── database.py            # DB session/engine
│   │   ├── db.py                  # Knowledge loading + embeddings retrieval
│   │   └── cv_generator.py
│   ├── data/
│   │   └── programs.json          # Seed data for universities
│   └── requirements.txt
├── frontend/
│   └── demo.html                  # Single-page UI (EN/ID i18n, Admin hidden by auth)
├── knowledge/                     # Uploaded knowledge files (admin only)
└── README.md
```

## Environment Variables

- MINIMAX_API_KEY (required for full AI features)  
- MINIMAX_BASE_URL (default https://api.minimax.chat/v1)  
- MINIMAX_MODEL (default abab6.5-chat)  
- MINIMAX_EMBED_MODEL (optional; default embedding-01)  
- ENABLE_OCR=true (optional; requires system Tesseract + Poppler)

## Run Instructions

Backend:
```
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r backend/requirements.txt
export MINIMAX_API_KEY="your_minimax_key"            # optional but recommended
export ENABLE_OCR=true                                # optional
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
Health check: http://localhost:8000/health

Frontend:
- Open http://localhost:8000/ (root route serves frontend/demo.html)

## Usage Highlights

- Apply: upload CV (PDF/DOCX/TXT) or paste; Extract → auto‑fill GPA/TOEFL/IELTS/HSK.  
- Results: Select language EN/ID → Search Programs → view ranked programs + matched/missing.  
- AI Recommendations: structured rationale, scholarships, deadlines.  
- Favorites & Compare: save programs and compare in a table.  
- Admin (login required, is_admin only): upload/refresh knowledge; view LLM status.

## Security Notes

- Never commit API keys. Use environment variables or a local .env (not tracked).  
- Admin endpoints require JWT auth and is_admin flag. CORS/wildcard is for dev; whitelist in production.
