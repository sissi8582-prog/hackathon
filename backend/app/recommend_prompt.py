from typing import List, Dict, Any


def build_recommendation_prompt(user_profile: Dict[str, Any], matched_universities: List[Dict[str, Any]], kb_chunks: List[Dict[str, Any]], locale: str = "en") -> str:
    up = user_profile or {}
    majors = up.get("majors") or up.get("preferred_fields") or []
    cities = up.get("cities") or up.get("preferred_cities") or []
    hsk_level = up.get("hsk_level") or up.get("hsk")
    hsk_score = up.get("hsk_score")
    math_phys = up.get("math_physics_avg")
    profile_block = (
        f"GPA: {up.get('gpa','N/A')} / 4.0\n"
        f"HSK Level: {hsk_level if hsk_level is not None else 'N/A'}\n"
        f"HSK Score: {hsk_score if hsk_score is not None else 'N/A'}\n"
        f"IELTS: {up.get('ielts','N/A')}\n"
        f"TOEFL: {up.get('toefl','N/A')}\n"
        f"Preferred Fields: {', '.join(majors) if majors else 'None'}\n"
        f"Preferred Cities: {', '.join(cities) if cities else 'None'}\n"
        f"Math/Physics Average: {math_phys if math_phys is not None else 'N/A'}%\n"
    )
    uni_block = _format_universities(matched_universities)
    kb_block = _format_kb(kb_chunks)
    lang_instruction = "Use English in all texts." if (locale or "en").lower().startswith("en") else "Use Indonesian (Bahasa Indonesia) in all texts."
    tpl = (
        "You are a professional admissions advisor helping Indonesian students choose suitable Chinese universities.\n\n"
        "## Candidate Profile\n"
        f"{profile_block}\n"
        "## Candidate Programs\n"
        f"{uni_block}\n"
        "## Knowledge Base\n"
        f"{kb_block}\n"
        "## Task\n"
        f"{lang_instruction}\n"
        "Return JSON only, with the structure:\n"
        "{\n"
        '  "recommendations": [\n'
        "    {\n"
        '      "university_id": "",\n'
        '      "university_name": "",\n'
        '      "match_score": 0,\n'
        '      "match_analysis": "",\n'
        '      "strengths": [],\n'
        '      "weaknesses": [],\n'
        '      "improvement_suggestions": [],\n'
        '      "recommended_majors": [],\n'
        '      "recommended_competitions": [],\n'
        '      "suggested_internships": [],\n'
        '      "application_deadline": "",\n'
        '      "scholarship_opportunities": []\n'
        "    }\n"
        "  ],\n"
        '  "overall_advice": "",\n'
        '  "next_steps": []\n'
        "}\n"
        "Ensure:\n"
        "1) Only JSON, no extra text\n"
        "2) Each recommendation is justified by matching candidate profile to requirements\n"
        "3) Improvements are specific and actionable\n"
        "4) Recommend relevant competitions and internships aligned with the candidate’s intended majors and the knowledge base context\n"
    )
    return tpl


def _format_universities(universities: List[Dict[str, Any]]) -> str:
    lines: List[str] = []
    for u in universities:
        req = u.get("requirements") or {}
        fees = u.get("fees") or "未提供"
        deadline = u.get("deadline") or "未提供"
        scholarships = ", ".join(u.get("scholarships", [])) if u.get("scholarships") else "未提供"
        hsk_min_level = req.get("hsk_min_level", req.get("hsk_required"))
        hsk_min_score = req.get("hsk_min_score")
        fields = ", ".join(u.get("fields", [])) if u.get("fields") else ""
        lines.append(
            f"### {u.get('name','')} (ID: {u.get('id','')})\n"
            f"- 城市: {u.get('city','未提供')}\n"
            f"- QS排名: {u.get('qs_rank','未提供')}\n"
            f"- 中国国内排名: {u.get('cn_rank','未提供')}\n"
            f"- 学费: {fees} RMB/年\n"
            f"- 申请要求:\n"
            f"  - GPA: {req.get('gpa_min','未提供')}\n"
            f"  - HSK: {hsk_min_level if hsk_min_level is not None else '未提供'} (最低分: {hsk_min_score if hsk_min_score is not None else '未提供'})\n"
            f"  - 雅思: {req.get('ielts_min','未提供')}\n"
            f"  - 托福: {req.get('toefl_min','未提供')}\n"
            f"  - 特殊要求: {req.get('special_requirements','无')}\n"
            f"- 开设专业: {fields}\n"
            f"- 申请截止: {deadline}\n"
            f"- 奖学金: {scholarships}\n"
        )
    return "\n".join(lines) if lines else "无"


def _format_kb(chunks: List[Dict[str, Any]], max_chars: int = 4000) -> str:
    if not chunks:
        return "无"
    parts: List[str] = []
    total = 0
    for c in chunks:
        src = c.get("source", "")
        txt = c.get("text", "")
        block = f"[{src}] {txt}"
        L = len(block)
        if total + L > max_chars:
            remaining = max_chars - total
            if remaining > 100:
                parts.append(block[:remaining] + "...")
                total += remaining
            break
        parts.append(block)
        total += L
    return "\n".join(parts) if parts else "无"
