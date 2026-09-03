import pytest
import os
import gc
import tempfile
from storage.sqlite_adapter import SQLiteStorageAdapter, calculate_evidence_score

@pytest.fixture
def temp_storage():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    adapter = SQLiteStorageAdapter(db_path=path)
    yield adapter
    gc.collect()
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass

def test_add_and_get_problem(temp_storage):
    prob_data = {
        "id": "HW-001",
        "sector": "Health & Wellness",
        "sufferer_occupation": "Pregnant women in rural areas",
        "sufferer_location": "Miagao, Iloilo",
        "problem_statement": "Delayed emergency obstetric referral transport causes high maternal risk",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "workaround": "Hiring private tricycles at ₱1,500 emergency fee",
        "quantified_impact": "₱15,000 yearly emergency expenses and 3-hour transfer delays",
        "evidence_types": ["Official", "News"],
        "sources": [
            {
                "source_name": "PSA",
                "source_url": "https://psa.gov.ph",
                "source_tier": "A",
                "evidence_type": "Official Statistic",
                "quote_or_summary": "High home birth rate in southern Iloilo"
            },
            {
                "source_name": "Panay News",
                "source_url": "https://www.panaynews.net",
                "source_tier": "B",
                "evidence_type": "News Report",
                "quote_or_summary": "Ambulance shortage in rural Panay"
            }
        ],
        "tags": ["maternal", "emergency"]
    }

    saved = temp_storage.add_problem(prob_data)
    assert saved["id"] == "HW-001"
    assert saved["score"] > 50.0
    assert len(saved["sources"]) == 2

    fetched = temp_storage.get_problem("HW-001")
    assert fetched is not None
    assert fetched["sector"] == "Health & Wellness"
    assert "maternal" in fetched["tags"]
    assert len(fetched["sources"]) == 2
    assert fetched["sources"][0]["source_name"] == "PSA"

def test_list_and_filter_problems(temp_storage):
    temp_storage.add_problem({
        "id": "AGR-001",
        "sector": "Agriculture & Fisheries",
        "problem_statement": "Bulb onion spoilage in Bayuyan",
        "evidence_tier": "DOCUMENTED"
    })
    temp_storage.add_problem({
        "id": "HW-002",
        "sector": "Health & Wellness",
        "problem_statement": "Insulin cold storage loss",
        "evidence_tier": "SIGNAL"
    })

    # Filter by sector
    agri = temp_storage.list_problems(sector="Agriculture & Fisheries")
    assert len(agri) == 1
    assert agri[0]["id"] == "AGR-001"

    # Filter by search
    searched = temp_storage.list_problems(search="Insulin")
    assert len(searched) == 1
    assert searched[0]["id"] == "HW-002"

def test_update_and_history(temp_storage):
    temp_storage.add_problem({
        "id": "ED-001",
        "sector": "Education & Youth",
        "problem_statement": "Lack of offline STEM materials",
        "status": "discovered"
    })

    updated = temp_storage.update_problem("ED-001", {
        "status": "shortlisted",
        "phase2_verdict": "ADVANCE",
        "notes": "Strong market plausibility"
    })
    assert updated["status"] == "shortlisted"
    assert updated["phase2_verdict"] == "ADVANCE"

    # Record history
    h = temp_storage.record_problem_history(
        problem_id="ED-001",
        phase_number=2,
        action="screened_advance",
        verdict="ADVANCE",
        model_used="Google Gemini 3.5 Flash-Lite"
    )
    assert h["id"] is not None

    full = temp_storage.get_problem("ED-001")
    assert len(full["phase_history"]) == 1
    assert full["phase_history"][0]["verdict"] == "ADVANCE"
