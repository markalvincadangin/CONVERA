from engines.problem_parser import parse_phase1_markdown

SAMPLE_MD = """# Phase 1 Startup Problem Discovery: Health & Wellness (Iloilo, Philippines)

**Prepared by:** Phase 1 Discovery Advisor

## 1. Problem Landscape Table

| Problem ID | Sufferer (Occupation + Location) | Problem Statement (Pure Friction) | Evidence Tier | Active Coping Workaround | Quantified Impact / Consequence | Evidence Type(s) | Source(s) |
|---|---|---|---|---|---|---|---|
| [HW-001] | Pregnant women in Miagao, Iloilo | Lack of rural emergency obstetric transport | STRONGLY DOCUMENTED | Hiring private tricycles | ₱15,000 yearly emergency costs and 3h delays | Official + News | [PSA](https://psa.gov.ph); [Panay News](https://www.panaynews.net) |
| [HW-002] | Dialysis patients in Jaro, Iloilo City | Frequent dialysis dialyzer supply stockouts | DOCUMENTED | Traveling to Roxas or Bacolod | ₱4,000 per trip extra expenses | News + Community | [Daily Guardian](https://dailyguardian.com.ph) |

## 2. Deep-Dive Problem Analysis

### [HW-001]: Rural Emergency Obstetric Transit Void
* **Brief Evidence Summary:** PSA maternal mortality data confirms rural transit gaps in Miagao.
* **Workaround & Monetary Sacrifice:** Families pay ₱1,500 per emergency trip to private drivers.
* **Field-Research Gap:** Direct interview with Miagao Rural Health Unit midwives.

### [HW-002]: Dialysis Consumable Bottlenecks
* **Brief Evidence Summary:** Daily Guardian reports supply chain delays.
* **Workaround & Monetary Sacrifice:** Inter-island ferry travel to Bacolod.
"""

def test_parse_phase1_markdown():
    problems = parse_phase1_markdown(SAMPLE_MD, session_id="sess_123", project_id="proj_456")
    assert len(problems) == 2

    p1 = problems[0]
    assert p1["id"] == "HW-001"
    assert p1["sector"] == "Health & Wellness"
    assert p1["sufferer_occupation"] == "Pregnant women"
    assert p1["sufferer_location"] == "Miagao, Iloilo"
    assert p1["evidence_tier"] == "STRONGLY_DOCUMENTED"
    assert len(p1["sources"]) == 2
    assert p1["sources"][0]["source_name"] == "PSA"
    assert p1["sources"][0]["source_url"] == "https://psa.gov.ph"
    assert "Rural Emergency Obstetric Transit Void" in p1["notes"]

    p2 = problems[1]
    assert p2["id"] == "HW-002"
    assert p2["evidence_tier"] == "DOCUMENTED"
    assert len(p2["sources"]) == 1
    assert p2["sources"][0]["source_name"] == "Daily Guardian"
