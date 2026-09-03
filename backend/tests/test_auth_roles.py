import pytest
import os
import tempfile
from storage.sqlite_adapter import SQLiteStorageAdapter

@pytest.fixture
def storage():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    adapter = SQLiteStorageAdapter(db_path=path)
    yield adapter
    if os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass

def test_passcode_security(storage):
    # Create project session
    state = storage.save_session("sess_sec_test", {"project_name": "Security Test Venture"})
    project_id = state["project_id"]

    # Initial state should have no passcode or verify cleanly
    assert storage.verify_project_passcode(project_id, "") is True

    # Set 4-digit PIN
    storage.set_project_passcode(project_id, "1234")

    # Verification checks
    assert storage.verify_project_passcode(project_id, "1234") is True
    assert storage.verify_project_passcode(project_id, "9999") is False
    assert storage.verify_project_passcode(project_id, "") is False

def test_team_member_management(storage):
    state = storage.save_session("sess_team_test", {"project_name": "Team Venture"})
    project_id = state["project_id"]

    # Upsert founder
    m1 = storage.upsert_project_member(project_id, {
        "id": "mem_maria",
        "name": "Maria Santos",
        "role": "FOUNDER_LEAD",
        "avatar": "👩‍💻"
    })
    assert m1["name"] == "Maria Santos"
    assert m1["role"] == "FOUNDER_LEAD"

    # Upsert researcher
    m2 = storage.upsert_project_member(project_id, {
        "id": "mem_juan",
        "name": "Juan Dela Cruz",
        "role": "RESEARCHER",
        "avatar": "👨‍🔬"
    })

    # List members
    members = storage.list_project_members(project_id)
    assert len(members) == 2
    assert any(m["role"] == "FOUNDER_LEAD" for m in members)
    assert any(m["role"] == "RESEARCHER" for m in members)

def test_problem_threaded_comments(storage):
    # Add a problem record
    prob = storage.add_problem({
        "id": "PRB-COMM-01",
        "sector": "Agriculture",
        "problem_statement": "Post-harvest transport loss in Passi sugar plantations.",
        "sufferer_occupation": "Sugar Planter",
        "sufferer_location": "Passi City",
        "created_by": "Maria"
    })

    # Add comment by team member
    c1 = storage.add_problem_comment("PRB-COMM-01", {
        "user_name": "Juan Dela Cruz",
        "user_role": "RESEARCHER",
        "user_avatar": "👨‍🔬",
        "comment": "Interviewed 3 truckers in Passi, they confirm 25% vibration damage."
    })
    assert c1["id"] is not None

    # Add comment by mentor
    c2 = storage.add_problem_comment("PRB-COMM-01", {
        "user_name": "Prof. Garcia",
        "user_role": "MENTOR_PROFESSOR",
        "user_avatar": "🎓",
        "comment": "Good field evidence. Make sure to check Sugar Regulatory Administration official stats."
    })

    # Retrieve problem with attached comments
    fetched = storage.get_problem("PRB-COMM-01")
    assert fetched is not None
    assert len(fetched.get("comments", [])) == 2
    assert fetched["comments"][0]["user_name"] == "Juan Dela Cruz"
    assert fetched["comments"][1]["user_role"] == "MENTOR_PROFESSOR"

def test_mentor_signoff_recording(storage):
    state = storage.save_session("sess_mentor_test", {"project_name": "Panay Cold Chain"})
    project_id = state["project_id"]

    # Mentor records signoff for Phase 3
    signoff = storage.record_mentor_signoff(
        project_id,
        phase_number=3,
        mentor_name="Prof. Garcia",
        notes="Passed Level 6 Socratic Mom Test validation criteria with economic proof."
    )
    assert signoff["id"] is not None
    assert signoff["phase_number"] == 3

    # List signoffs
    signoffs = storage.list_mentor_signoffs(project_id)
    assert len(signoffs) == 1
    assert signoffs[0]["mentor_name"] == "Prof. Garcia"
