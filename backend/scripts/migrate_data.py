import json
import os
from pathlib import Path

try:
    import pandas as pd
except Exception:
    pd = None

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "backend" / "data"
EXCEL_PATH = BASE_DIR / "Hackathon_Data sheet (1).xlsx"
DOCX_MAJOR_PATH = BASE_DIR / "the Major Catalog for Undergraduate International Students.docx"
OUTPUT_JSON = DATA_DIR / "programs.json"


def migrate_from_excel():
    if pd is None:
        return []
    if not EXCEL_PATH.exists():
        return []
    try:
        df = pd.read_excel(str(EXCEL_PATH))
    except Exception:
        return []
    cols = [c.lower() for c in df.columns]
    df.columns = cols
    records = []
    for _, row in df.iterrows():
        try:
            name = str(row.get("university") or row.get("name") or "").strip()
            if not name:
                continue
            city = (row.get("city") or "").strip() or None
            qs_rank = _to_int(row.get("qs_rank"))
            cn_rank = _to_int(row.get("cn_rank"))
            fees = _to_int(row.get("fees"))
            deadline = (row.get("deadline") or None)
            fields = _split_list(row.get("fields"))
            scholarships = _split_list(row.get("scholarships"))
            official_link = (row.get("official_link") or None)
            gpa_min = _to_float(row.get("gpa_min"))
            ielts_min = _to_float(row.get("ielts_min"))
            toefl_min = _to_int(row.get("toefl_min"))
            hsk_min_level = _to_int(row.get("hsk_min_level"))
            hsk_min_score = _to_int(row.get("hsk_min_score"))
            special_req = (row.get("special_requirements") or None)
            rec = {
                "id": f"{_slug(name)}_{city or 'cn'}",
                "name": name,
                "university": name,
                "city": city,
                "fields": fields or [],
                "qs_rank": qs_rank,
                "cn_rank": cn_rank,
                "fees": fees,
                "deadline": deadline,
                "scholarships": scholarships or [],
                "official_link": official_link,
                "requirements": {
                    "gpa_min": gpa_min,
                    "toefl_min": toefl_min,
                    "ielts_min": ielts_min,
                    "hsk_required": bool(hsk_min_level or hsk_min_score),
                    "hsk_min_level": hsk_min_level,
                    "hsk_min_score": hsk_min_score,
                    "special_requirements": special_req
                }
            }
            records.append(rec)
        except Exception:
            continue
    return records


def _to_int(v):
    try:
        if v is None or v == "":
            return None
        return int(float(v))
    except Exception:
        return None


def _to_float(v):
    try:
        if v is None or v == "":
            return None
        return float(v)
    except Exception:
        return None


def _split_list(v):
    if v is None:
        return []
    if isinstance(v, list):
        return v
    s = str(v)
    if not s.strip():
        return []
    parts = [p.strip() for p in s.replace("；", ";").replace(",", ";").split(";")]
    return [p for p in parts if p]


def _slug(s: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "_" for ch in s).strip("_")


def write_programs_json(records):
    if not records:
        return False
    try:
        with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        return True
    except Exception:
        return False


def main():
    recs = migrate_from_excel()
    if recs:
        ok = write_programs_json(recs)
        print("written:", ok, "count:", len(recs))
    else:
        print("no data extracted")


if __name__ == "__main__":
    main()
