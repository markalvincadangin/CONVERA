import pytest
import asyncio
from engines.document_parser import chunk_text, parse_and_extract_document, IngestedDocumentResult


@pytest.mark.unit
def test_chunk_text():
    sample_text = (
        "Paragraph 1: Transportation in rural Iloilo is irregular and expensive for university students.\n\n"
        "Paragraph 2: Most jeepneys stop operating after 7:00 PM, forcing students to hire private tricycles.\n\n"
        "Paragraph 3: Existing transport apps like Grab do not service secondary routes."
    )

    chunks = chunk_text(sample_text, max_chunk_chars=150)
    assert len(chunks) >= 2
    for c in chunks:
        assert len(c) > 0


@pytest.mark.live
def test_parse_and_extract_document():
    raw_transcript = (
        "Interview with Sarah (3rd Year CS Student, CPU Iloilo):\n"
        "I commute 18km every day from Passi to Jaro. The biggest issue is that after my 6:30 PM lab class, "
        "there are zero jeepneys available on the highway. "
        "I have to wait up to 90 minutes or pay 150 PHP for a special tricycle ride. "
        "I already spent 1,200 PHP extra last month just getting home safely."
    )

    result = asyncio.run(parse_and_extract_document(
        raw_content=raw_transcript,
        source_name="Student Commute Interview Transcript",
        authority_tier="FIELD_INTERVIEW"
    ))

    assert isinstance(result, IngestedDocumentResult)
    assert result.document_id.startswith("doc_")
    assert len(result.evidence_candidates) >= 1
    assert result.provenance.source_name == "Student Commute Interview Transcript"
    assert result.provenance.authority_tier == "FIELD_INTERVIEW"

    first_cand = result.evidence_candidates[0]
    assert first_cand.id.startswith("cand_")
    assert first_cand.claim_type in ["FRICTION_REALITY", "FREQUENCY_CONSEQUENCE", "WORKAROUND_DISSATISFACTION", "ADOPTION_COMMITMENT"]
    assert first_cand.evidence_tier in ["DISCOVERY_SIGNAL", "CONTEXTUAL_EVIDENCE", "VALIDATION_EVIDENCE"]
    assert 0.0 <= first_cand.ai_confidence <= 1.0
