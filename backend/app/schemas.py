from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError


class RecommendationItem(BaseModel):
    university_id: Optional[str] = None
    university_name: str
    match_score: int = Field(ge=0, le=100)
    match_analysis: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    improvement_suggestions: List[str] = []
    recommended_majors: List[str] = []
    application_deadline: Optional[str] = None
    scholarship_opportunities: List[str] = []


class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    overall_advice: str
    next_steps: List[str] = []


def validate_llm_json(data: dict):
    try:
        validated = RecommendationResponse(**data)
        return validated.model_dump()
    except ValidationError:
        return None

def coerce_llm_json(data: dict):
    if not isinstance(data, dict):
        return None
    recs = data.get("recommendations")
    if not isinstance(recs, list):
        recs = []
    out_recs = []
    for r in recs:
        if not isinstance(r, dict):
            continue
        item = {
            "university_id": r.get("university_id") or r.get("id") or "",
            "university_name": r.get("university_name") or r.get("title") or "",
            "match_score": r.get("match_score") or 0,
            "match_analysis": r.get("match_analysis") or "",
            "strengths": r.get("strengths") or [],
            "weaknesses": r.get("weaknesses") or [],
            "improvement_suggestions": r.get("improvement_suggestions") or [],
            "recommended_majors": r.get("recommended_majors") or [],
            "application_deadline": r.get("application_deadline"),
            "scholarship_opportunities": r.get("scholarship_opportunities") or []
        }
        try:
            item["match_score"] = int(float(item["match_score"]))
        except Exception:
            item["match_score"] = 0
        for k in ["strengths", "weaknesses", "improvement_suggestions", "recommended_majors", "scholarship_opportunities"]:
            v = item.get(k)
            if isinstance(v, str):
                item[k] = [v]
            elif not isinstance(v, list):
                item[k] = []
        out_recs.append(item)
    out = {
        "recommendations": out_recs,
        "overall_advice": data.get("overall_advice") or data.get("summary") or "",
        "next_steps": data.get("next_steps") or []
    }
    if isinstance(out["next_steps"], str):
        out["next_steps"] = [out["next_steps"]]
    if not isinstance(out["next_steps"], list):
        out["next_steps"] = []
    try:
        validated = RecommendationResponse(**out)
        return validated.model_dump()
    except ValidationError:
        return None
