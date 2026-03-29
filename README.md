# SinoScholar — AI Admissions Advisor for Indonesian Students

## Problem Statement

Indonesian applicants face fragmented, multilingual admission data from Chinese universities. Manual CV-to-policy matching is error-prone, leading to missed deadlines and suboptimal program choices.

## Solution

SinoScholar is a bilingual (EN/ID) web application that:

- Extracts academic credentials (GPA, HSK, IELTS/TOEFL) from CVs via LLM-based parsing with OCR fallback
- Matches profiles against a vectorized knowledge base of program policies, producing structured matched/missing checklists
- Provides AI-generated rationales, scholarship insights, and deadlines
- Supports admin-only knowledge management, program favoriting, and side-by-side comparison

## Target Users

Primary: Indonesian high school seniors and undergraduates applying to Chinese universities  
Secondary: School counselors  
Core scenario: Student uploads CV → system extracts GPA 3.6 / HSK 4 / IELTS 6.5 → filters by field (e.g., Computer Science) → receives ranked programs with explicit eligibility gaps and deadlines

## Core Value Proposition

Replaces manual PDF browsing with centralized, bilingual, LLM-reasoned eligibility analysis. Reduces research time, improves submission accuracy.

## AI & Technical Approach

### Models
- **MiniMax Chat Completions** — CV extraction, recommendation reasoning, bilingual summarization
- **MiniMax Embeddings** — knowledge chunk retrieval from program policies and major catalog

### Why AI
Program policies are heterogeneous in format, language, and structure. LLMs handle parsing variability and generate contextual explanations; embeddings enable semantic retrieval over unstructured policy documents without rigid schemas.

### Fallback Strategy
When MiniMax API is unavailable, the system reverts to regex-based extraction and rule-only ranking, preserving core functionality.

## Architecture & Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI (Python), SQLAlchemy, SQLite, JWT, CORS |
| AI | MiniMax chat completions, MiniMax embeddings |
| Document Parsing | pypdf → pdfminer.six fallback; OCR via pdf2image + Tesseract (optional) |
| Frontend | Vanilla HTML/CSS/JS, i18n (EN/ID), SPA with Favorites & Compare views |
| Data | Seeded from `programs.json`; knowledge files stored in `/knowledge` |

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
 
| Variable | Purpose | Default |
|----------|---------|---------|
| MINIMAX_API_KEY | Required for AI features | — |
| MINIMAX_BASE_URL | MiniMax API endpoint | https://api.minimax.chat/v1 |
| MINIMAX_MODEL | Chat model | abab6.5-chat |
| MINIMAX_EMBED_MODEL | Embedding model | embedding-01 |
| ENABLE_OCR | Enable OCR fallback (requires Tesseract + Poppler) | false |

## Run Instructions

```bash
# Backend
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
export MINIMAX_API_KEY="your_key"
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: GET /health

Frontend:
- Open http://localhost:8000/ (root route serves frontend/demo.html)

## Key Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/cv/extract | CV parsing with OCR fallback | Public |
| POST | /api/cv/extract_text | Parse CV from pasted text | Public |
| POST | /api/recommend | Ranked programs with matched/missing items and AI rationale (structured JSON when available) | Public |
| GET | /api/competitions | List competitions (filter by fields) | Public |
| GET | /api/internships | List internships (filter by fields) | Public |
| GET | /api/policies | Policy links | Public |
| POST | /users/favorites | Add favorite | User (JWT) |
| GET  | /users/favorites | List favorites | User (JWT) |
| DELETE | /users/favorites/{program_id} | Remove favorite | User (JWT) |
| POST | /api/programs/{id}/compare | Server-side eligibility comparison | Public |
| POST | /api/db/upload | Upload knowledge files | Admin-only |
| POST | /api/universities/import_excel | Bulk university import from Excel | Admin-only |
| POST | /api/opportunities/import_excel | Bulk competition/internship import | Admin-only |

## Usage Highlights

- Apply: upload CV (PDF/DOCX/TXT) or paste; Extract → auto‑fill GPA/TOEFL/IELTS/HSK.  
- Results: Select language EN/ID → Search Programs → view ranked programs + matched/missing.  
- AI Recommendations: structured rationale, scholarships, deadlines.  
- Favorites & Compare: save programs and compare in a table.  
- Admin (login required, is_admin only): upload/refresh knowledge; view LLM status.

## Security Notes

 - Never commit API keys. Use environment variables or a local .env (not tracked).  
 - Admin endpoints require JWT auth and is_admin flag. CORS/wildcard is for dev; whitelist in production.
 
---
 
## Feature Alignment (Current Implementation)
- Resume parsing: PDF/DOCX/TXT; OCR fallback when ENABLE_OCR=true.
- Program recommendations: `POST /api/recommend` combines rules and LLM, returns structured items with matched/missing elements.
- Opportunities:
  - Driven by the Fields selected in “Find Programs” (no city required).
  - Clickable name button and whole-card click open in a new tab; URLs are sanitized and protocol-completed (http/https).
  - Policy links are listed and always available.
- Admin (visible to admins only): knowledge upload/refresh, Excel import for universities/opportunities, LLM status panel.
- Field name canonicalization: Medicine / Engineering / Computer Science / Business & Economics / Language & Culture.
- i18n: UI supports EN/ID; AI recommendations can follow the selected language.
 
## Data Import & Debugging
- Admin endpoints (recommended for non-technical admins):
  - `POST /api/opportunities/import_excel` imports competitions/internships based on Excel type=competition/internship.
  - `POST /api/universities/import_excel` imports university rows into DB.
- Scripts (for technical/bulk operations):
  - Inspect Excel structure:
    ```
    python scripts/debug_excel.py
    ```
  - Auto-parse and import (row/column auto-detection, supports `--clear`):
    ```
    python scripts/import_excel_data.py --excel "knowledge/Hackathon_Data sheet (1).xlsx" --clear --debug
    ```
  - Import from a fixed curated list (with URL sanitization; independent of Excel layout):
    ```
    python scripts/import_excel_fixed.py --clear
    ```
 
## Usage Notes
- Filters: upload or paste CV → extract → go to Results.
- Results: choose EN/ID → Search Programs → view program cards and AI Recommendations.
- Opportunities: enable Competitions/Internships → recommendations follow selected Fields; click name or card to open.
- Compare: add favorites → compare in a table.
- Admin: visible after login with is_admin; for knowledge and data maintenance.
 
## Documentation
- This README serves as the usage and technical entry point for the repository.
- A separate Product Brief (Markdown/Word/PDF) is recommended for product value, user stories, and evaluation.

## Data Import & Debugging
Admin UI (recommended):
- Upload knowledge files directly via admin panel
- Import universities and opportunities via Excel upload forms

Scripts (for bulk/automated operations):
```bash
# Inspect Excel structure
python scripts/debug_excel.py

# Auto-detect and import (supports --clear to truncate)
python scripts/import_excel_data.py --excel "knowledge/data.xlsx" --clear --debug

# Import from curated list with URL sanitization
python scripts/import_excel_fixed.py --clear
```

## Field Name Canonicalization
| User-facing | Internal mapping |
|-------------|------------------|
| Medicine | Medicine |
| Engineering | Engineering |
| Computer Science | Computer Science |
| Business & Economics | Business & Economics |
| Language & Culture | Language & Culture |

## Fallback & Robustness
- If MiniMax API is unavailable: regex-based CV extraction, rule-only ranking
- If OCR is disabled or fails: falls back to text extraction from PDF/DOCX
- LLM JSON responses validated and coerced via Pydantic schemas; malformed outputs are discarded

## Testing Notes
- All admin endpoints require JWT and is_admin=true
- OCR requires system dependencies: tesseract and poppler-utils (or poppler on macOS)
- For development without MiniMax, set MINIMAX_API_KEY="" to run in fallback mode

## Product Brief
This section serves as a placeholder for the separate Product Brief documentation. The complete Product Brief will be provided as a standalone document (Markdown/Word/PDF) covering:
- User personas & journeys
- Success metrics / KPIs
- Feature prioritization
- User flow diagrams
- Competitive analysis
- Monetization strategy

## Repository Documentation Artifacts
| Artifact | Location | Purpose |
|---------|----------|---------|
| Inline code comments | backend/app/*.py | API logic, error handling, and fallback mechanisms |
| Docstrings | All Python modules | Function-level documentation and type hints |
| HTML comments | frontend/demo.html | UI component structure and i18n notes |
| JSON schemas | backend/app/schemas.py | LLM response validation and coercion rules |
| Import scripts | scripts/*.py | Data migration and debugging utilities with CLI help |
