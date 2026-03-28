from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .rag_engine import search_programs, DATA_PATH
import json

router = APIRouter(prefix="/api", tags=["programs"])


class FilterQuery(BaseModel):
    cities: Optional[List[str]] = None
    fields: Optional[List[str]] = None
    sort_by: str = "qs"


@router.get("/options")
def get_options():
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    cities = sorted(list({p.get("city") for p in data if p.get("city")}))
    fields = sorted(list({f for p in data for f in p.get("fields", [])}))
    return {"cities": cities, "fields": fields, "sort_by": ["qs", "cn"]}


@router.post("/programs/filter")
def filter_programs(q: FilterQuery):
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    res = []
    for p in data:
        if q.cities and "ALL" not in q.cities:
            if p.get("city") not in q.cities:
                continue
        if q.fields and "ALL" not in q.fields:
            if not set(p.get("fields", [])).intersection(set(q.fields)):
                continue
        res.append(p)
    key = "qs_rank" if q.sort_by == "qs" else "cn_rank"
    res.sort(key=lambda x: x.get(key) or 1e9)
    return {"programs": res}


@router.get("/programs/{program_id}")
def program_detail(program_id: str):
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    for p in data:
        if p.get("id") == program_id:
            return p
    raise HTTPException(status_code=404, detail="not found")


class Profile(BaseModel):
    gpa: Optional[float] = None
    toefl: Optional[int] = None
    ielts: Optional[float] = None
    gre: Optional[int] = None
    majors: Optional[List[str]] = []
    cities: Optional[List[str]] = []
    skills: Optional[List[str]] = []


@router.post("/programs/{program_id}/compare")
def compare_requirements(program_id: str, profile: Profile):
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    prog = None
    for p in data:
        if p.get("id") == program_id:
            prog = p
            break
    if not prog:
        raise HTTPException(status_code=404, detail="not found")
    unmet = []
    req = prog.get("requirements", {})
    gpa_min = req.get("gpa_min")
    if gpa_min is not None and (profile.gpa is None or profile.gpa < gpa_min):
        unmet.append(f"gpa >= {gpa_min}")
    toefl_min = req.get("toefl_min")
    if toefl_min is not None and (profile.toefl is None or profile.toefl < toefl_min):
        unmet.append(f"toefl >= {toefl_min}")
    ielts_min = req.get("ielts_min")
    if ielts_min is not None and (profile.ielts is None or profile.ielts < ielts_min):
        unmet.append(f"ielts >= {ielts_min}")
    if req.get("gre_required") and (profile.gre is None or profile.gre <= 0):
        unmet.append("gre required")
    return {"unmet": unmet}
