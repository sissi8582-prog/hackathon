import sys
import json
import re
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.app.models import Competition, Internship, PolicyLink
from backend.app.database import DATABASE_URL

COMPETITIONS_DATA = {
    "Medicine": [
        "Indonesian Medical Physiology Olympiad (IMPhO)",
        "National Medical & General Biology Competition (NMGBC)",
        "UK Medicine and Dentistry Olympiad (UKMDO)",
        "MEDSPIN is an international Medical Science and Application Competition",
        "Science in Medicine School Teams Prize 2025",
    ],
    "Engineering": [
        "FIRST Robotics Competition",
        "International Young Inventors Award (IYIA)",
        "The Indonesian Student Research Olympiad (OPSI)",
        "James Dyson Award",
        "Shell Eco-marathon",
    ],
    "Computer Science": [
        "Google Summer of Code",
        "USACO (USA Computing Olympiad)",
        "Gemastik",
        "Imagine Cup (Microsoft)",
        "Capture The Flag (CTF) Global Competitions",
    ],
    "Business & Economics": [
        "Wharton Global High School Investment Competition",
        "ndonesia National Science Enterprise Challenge (INASEC)",
        "Diamond Challenge",
        "HSBC Business Case Competition",
        "Blue Ocean Competition",
    ],
    "Language & Culture": [
        "International Linguistics Olympiad (IOL)",
        "HSK Short Video Competition",
        "International Model United Nations",
        "John Locke Institute Essay Competition",
        "Fourth Global Youth Bilingual Broadcast Contest",
    ],
}

INTERNSHIPS_DATA = {
    "Medicine": [
        {"name": "AIMI Summer Research Internship", "link": None},
        {"name": "Volunteering as a 'Palang Merah Remaja (PMR)'", "link": None},
        {"name": "United Planet Global Health Internships", "link": None},
        {"name": "Pre-Med Project (Virtual)", "link": None},
        {"name": "Stanford University's SHTEM Summer Internships", "link": None},
    ],
    "Engineering": [
        {"name": "Smith College – Summer Science & Engineering Program (SSEP)", "link": None},
        {"name": "Rolls-Royce Engineering Virtual Experience: 'Discover'", "link": None},
        {"name": "Imperial Global Summer School", "link": None},
        {"name": "NTU Singapore Summer Immersion Programme", "link": None},
        {"name": "Explore Engineering Innovation (EEI) (Online/In-Person)", "link": None},
    ],
    "Computer Science": [
        {"name": "Google STEP Internship", "link": " `https://buildyourfuture.withgoogle.com/programs/step/` "},
        {"name": "Microsoft Explore Internship", "link": " `https://careers.microsoft.com/students/us/en/explore-program` "},
        {"name": "Amazon Future Engineer Internship", "link": " `https://www.amazonfutureengineer.com/internship` "},
        {"name": "Stanford AI4ALL Summer Program", "link": " `https://ai4all.stanford.edu/` "},
        {"name": "Girls Who Code Summer Immersion Program", "link": " `https://girlswhocode.com/programs/summer-immersion-program` "},
    ],
    "Business & Economics": [
        {"name": "Bank of America Student Leaders Program", "link": " `https://about.bankofamerica.com/en/making-an-impact/student-leaders` "},
        {"name": "Harvard Pre-College Program: Economics & Business", "link": " `https://summer.harvard.edu/high-school-programs/pre-college-program/` "},
        {"name": "Wharton Global Youth Program", "link": " `https://globalyouth.wharton.upenn.edu/` "},
        {"name": "JA Company Program", "link": " `https://www.jaworldwide.org/program/ja-company-program` "},
        {"name": "FBLA National Leadership Conference Internship", "link": " `https://fbla.org/events/national-leadership-conference/` "},
    ],
    "Language & Culture": [
        {"name": "CIEE Global Navigator Language & Culture Program", "link": " `https://www.ciee.org/go-abroad/high-school-study-abroad/programs` "},
        {"name": "NSLI-Y", "link": " `https://www.nsliforyouth.org/` "},
        {"name": "AFS Intercultural Exchange Programs", "link": " `https://afs.org/intercultural-programs/` "},
        {"name": "YFU Language Immersion", "link": " `https://yfu.org/study-abroad` "},
        {"name": "Fulbright Summer Institute", "link": " `https://us.fulbrightonline.org/summer-institute` "},
    ],
}

POLICIES_DATA = [
    {
        "university": "Tsinghua",
        "title": "Ministry of Education Notice on International Student Eligibility",
        "link": " `http://www.moe.gov.cn/srcsite/A20/moe_850/202006/t20200609_464159.html` ",
    },
    {
        "university": "Tsinghua",
        "title": "Tsinghua University – Academy of Arts & Design Undergraduate Programs",
        "link": " `https://international.join-tsinghua.edu.cn/info/1030/1018.htm` ",
    },
    {
        "university": "Peking",
        "title": "2026 Peking University Undergraduate Admission Brochure for International Students (Entrance Examination)",
        "link": " `https://www.isd.pku.edu.cn/cn/news/detail.php?id=800` ",
    },
    {
        "university": "Peking",
        "title": "2026 Peking University Undergraduate Admission Brochure for International Students (Application Review)",
        "link": " `https://www.isd.pku.edu.cn/cn/detail.php?id=793` ",
    },
    {
        "university": "Peking",
        "title": "2026 Peking University Academic Requirements for Application Review",
        "link": " `https://www.isd.pku.edu.cn/cn/detail.php?id=798` ",
    },
    {
        "university": "Peking",
        "title": "2026 Peking University Boya Overseas Talent Program Admission Brochure",
        "link": " `https://www.isd.pku.edu.cn/cn/detail.php?id=796` ",
    },
    {
        "university": "Peking",
        "title": "2026 Peking University Boya Overseas Talent Program Implementation Plan",
        "link": " `https://www.isd.pku.edu.cn/cn/detail.php?id=795` ",
    },
    {
        "university": "Peking",
        "title": "Future Leaders International Undergraduate Program",
        "link": " `https://www.isd.pku.edu.cn/cn/detail.php?id=544` ",
    },
    {
        "university": "Beijing Normal",
        "title": "2026 BNU Undergraduate Admission Brochure for International Students",
        "link": " `https://admission-is.bnu.edu.cn/english/admissionprogram/bachelordegreeprogram/admissionbrochure/index.html` ",
    },
]

def sanitize_link(s):
    if s is None:
        return None
    txt = str(s).strip()
    txt = re.sub(r"[`'\"]", "", txt)
    txt = txt.strip()
    m = re.search(r"(https?://[^\s]+)", txt)
    return m.group(1) if m else None

def import_competitions(db):
    count = 0
    for field_name, comps in COMPETITIONS_DATA.items():
        for idx, name in enumerate(comps, start=1):
            existing = db.query(Competition).filter(Competition.name == name).first()
            if existing:
                continue
            ext_id = f"comp_{field_name.lower().replace(' & ', '_').replace(' ', '_')}_{idx}"
            item = Competition(
                ext_id=ext_id,
                name=name,
                fields_offered=json.dumps([field_name]),
                city=None,
                level="International",
                link=None,
                deadline=None,
                description=f"{field_name} competition",
            )
            db.add(item)
            count += 1
    db.commit()
    return count

def import_internships(db):
    count = 0
    for field_name, interns in INTERNSHIPS_DATA.items():
        for idx, data in enumerate(interns, start=1):
            name = data.get("name")
            link = sanitize_link(data.get("link"))
            existing = db.query(Internship).filter(Internship.name == name).first()
            if existing:
                if link and (existing.link or "") != link:
                    existing.link = link
                continue
            ext_id = f"intern_{field_name.lower().replace(' & ', '_').replace(' ', '_')}_{idx}"
            company = (name.split()[0] if name else "Various")
            item = Internship(
                ext_id=ext_id,
                company=company,
                name=name,
                fields_offered=json.dumps([field_name]),
                city=None,
                link=link,
                deadline=None,
                description=f"{field_name} internship",
                requirements=json.dumps({}),
            )
            db.add(item)
            count += 1
    db.commit()
    return count

def import_policies(db):
    count = 0
    for p in POLICIES_DATA:
        title = p["title"]
        link = sanitize_link(p["link"])
        existing = db.query(PolicyLink).filter(PolicyLink.title == title).first()
        if existing:
            if link and (existing.link or "") != link:
                existing.link = link
            continue
        item = PolicyLink(university_name=p["university"], title=title, link=link)
        db.add(item)
        count += 1
    db.commit()
    return count

def clear_all(db):
    db.query(Competition).delete()
    db.query(Internship).delete()
    db.query(PolicyLink).delete()
    db.commit()

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--clear", action="store_true")
    parser.add_argument("--db", type=str, default=None)
    args = parser.parse_args()
    url = args.db or DATABASE_URL
    engine = create_engine(url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    try:
        if args.clear:
            clear_all(db)
        c = import_competitions(db)
        i = import_internships(db)
        p = import_policies(db)
        print(f"Imported: competitions={c}, internships={i}, policies={p}")
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
