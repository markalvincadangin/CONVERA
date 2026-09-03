import pytest
import os
import gc
import tempfile
from storage.sqlite_adapter import SQLiteStorageAdapter
from engines.evidence_scorer import calculate_score_breakdown

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
        "problem_statement": "Delayed emergency obstetric transport causes fatal maternal complications",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "workaround": "Hiring private tricycles at ₱1,500 emergency fare to travel 25km",
        "quantified_impact": "₱15,000 yearly emergency expenses and 3-hour transfer delays",
        "evidence_types": ["Official", "News"],
        "sources": [
            {
                "source_name": "PSA Southern Iloilo Report",
                "source_url": "https://psa.gov.ph",
                "source_tier": "A",
                "evidence_type": "Official Statistic",
                "quote_or_summary": "Rural maternal transfer times average 2.8 hours"
            }
        ],
        "tags": ["maternal", "emergency"],
        "notes": "Verified with Miagao health workers"
    }

    added = temp_storage.add_problem(prob_data)
    assert added["id"] == "HW-001"
    assert added["score"] > 60.0
    assert len(added["sources"]) == 1

    fetched = temp_storage.get_problem("HW-001")
    assert fetched is not None
    assert fetched["problem_statement"] == prob_data["problem_statement"]
    assert fetched["tags"] == ["maternal", "emergency"]
    assert "score_breakdown" in fetched

def test_list_and_filter_problems(temp_storage):
    p1 = {
        "id": "AG-001",
        "sector": "Agriculture & Fisheries",
        "sufferer_occupation": "Smallholder onion farmers",
        "sufferer_location": "Miagao, Iloilo",
        "problem_statement": "Storage rot destroys 30% of harvested red onions",
        "evidence_tier": "STRONGLY_DOCUMENTED",
        "workaround": "Selling immediately at depressed prices",
        "quantified_impact": "₱40,000 lost profit per season",
        "sources": []
    }
    p2 = {
        "id": "HW-002",
        "sector": "Health & Wellness",
        "sufferer_occupation": "Barangay health workers",
        "sufferer_location": "Pototan, Iloilo",
        "problem_statement": "Stockouts of essential hypertension meds",
        "evidence_tier": "DOCUMENTED",
        "workaround": "Patients skipping doses",
        "quantified_impact": "₱3,000 out-of-pocket per month",
        "sources": []
    }

    temp_storage.add_problem(p1)
    temp_storage.add_problem(p2)

    all_probs = temp_storage.list_problems()
    assert len(all_probs) == 2

    ag_probs = temp_storage.list_problems(sector="Agriculture & Fisheries")
    assert len(ag_probs) == 1
    assert ag_probs[0]["id"] == "AG-001"

    searched = temp_storage.list_problems(search="hypertension")
    assert len(searched) == 1
    assert searched[0]["id"] == "HW-002"

def test_update_and_history(temp_storage):
    p = {
        "id": "MSME-001",
        "sector": "MSMEs & Retail",
        "sufferer_occupation": "Sari-sari store owners",
        "sufferer_location": "Jaro, Iloilo City",
        "problem_statement": "Micro-merchants pay 20% interest to loan sharks due to lack of working capital",
        "evidence_tier": "DOCUMENTED",
        "workaround": "Borrowing from 5-6 lenders",
        "quantified_impact": "₱12,000 annual interest bleed",
        "sources": []
    }
    temp_storage.add_problem(p)

    updated = temp_storage.update_problem("MSME-001", {"status": "validating", "notes": "Interviewing 5 owners in Jaro"})
    assert updated["status"] == "validating"
    assert "Interviewing" in updated["notes"]

    h = temp_storage.record_problem_history(
        problem_id="MSME-001",
        phase_number=2,
        action="screened",
        verdict="ADVANCE",
        model_used="gemini-3.8-flash"
    )
    assert h["verdict"] == "ADVANCE"

    fetched = temp_storage.get_problem("MSME-001")
    assert len(fetched["phase_history"]) == 1
    assert fetched["phase_history"][0]["action"] == "screened"


def test_normalize_problem_ids_and_merge(temp_storage):
    storage = temp_storage
    
    p1 = storage.add_problem({
        "id": "HW-99",
        "sector": "Health & Wellness",
        "problem_statement": "Maternal health logistics delay.",
        "score": 85.0
    })
    p2 = storage.add_problem({
        "id": "TEMP-AGR-X",
        "sector": "Agriculture & Fisheries",
        "problem_statement": "Post-harvest onion spoilage.",
        "score": 90.0
    })
    
    # Reindex
    normalized = storage.normalize_problem_ids()
    ids = [p["id"] for p in normalized]
    assert "AGR-001" in ids
    assert "HLT-001" in ids
    
    # Add duplicate to merge
    dup = storage.add_problem({
        "id": "AGR-999",
        "sector": "Agriculture & Fisheries",
        "problem_statement": "Bulb onion rot in Miagao.",
        "votes": 5
    })
    
    merged = storage.merge_problems("AGR-001", ["AGR-999"])
    assert merged is not None
    assert merged["votes"] == 5
    assert storage.get_problem("AGR-999") is None
    
    # Bulk delete
    deleted = storage.bulk_delete_problems(["AGR-001", "HLT-001"])
    assert deleted == 2
    assert len(storage.list_problems()) == 0
