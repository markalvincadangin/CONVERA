# CONVERA AI & CIIA Rules

## Provider Independence
Never hard-code a specific LLM provider or API key into business logic. All inference must use the CIIA Gateway cascade (Gemini $	o$ Groq $	o$ Ollama).

## AI Output Epistemic Status
Treat all LLM outputs as:
- Candidate interpretations
- Candidate classifications
- Candidate recommendations
- Candidate generated drafts

AI output is **never** authoritative evidence without source provenance and human verification.

## Tri-Part Confidence Calibration
Always enforce the epistemic separation:
$$\text{AI Model Confidence} \neq \text{Evidence Strength} \neq \text{Decision Confidence}$$

- Flag an `OVERCONFIDENCE WARNING` whenever AI linguistic certainty is high ($\ge 0.80$) while empirical evidence strength is low ($\le 0.40$).

## Contradiction & Invalidation Protocol
- When contradicting evidence is introduced, downgrade claims to `CONTESTED`.
- Invalidate downstream decisions non-destructively by raising `STALE_REVIEW_REQUIRED` alerts.

## MCP Tool Boundaries
- MCP tools must expose bounded, audited interfaces with typed schemas.
- Do not expose raw arbitrary SQL execution over MCP.
