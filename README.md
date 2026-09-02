# RatchetAI ⚙️ — Evidence-Ratcheted Problem-to-Solution Venture Engine

**RatchetAI** is an evidence-ratcheted technopreneurship validation platform engineered to eliminate premature solutioning. It enforces strict empirical validation gates across 5 progressive venture development phases, guiding student founders and technopreneurs in building viable, locally grounded ventures in the Western Visayas / Philippine ecosystem.

---

## 🌟 Key Capabilities (v2.0.0)

- **⚡ High-Concurrency SQLite WAL Database:** Instant persistence with zero lock contention (`pipeline/ratchetai.db`) and PostgreSQL (Neon/Supabase) cloud readiness.
- **👥 Multi-Device Team Collaboration:** Connect teammates on the same campus Wi-Fi or share worldwide via Cloudflare Quick Tunnels.
- **🔑 6-Character Project Room Codes:** Groupmates enter a clean share code (e.g. `RATCH-AGRI`) to instantly join the workspace.
- **⏪ Milestone Snapshots & Pivot History:** 1-Click rollback if customer interviews invalidate an assumption.
- **📊 Interactive Pitch Presentation Mode:** Full-screen 6-slide presentation canvas ready for faculty grading and investor defense.
- **🛡️ Universal Multi-Provider Gateway:** Dynamic failover cascade across Google Gemini 3.5 Flash, Groq Llama 3.3 70B, OpenRouter, and Local Ollama.

---

## 🚀 Quickstart Guide

### 1. Launch Full-Stack Application on Your PC
```powershell
.\start-dev.ps1
```
- **Local Access:** [http://localhost:3000](http://localhost:3000)
- **Campus Wi-Fi Access:** `http://<your-local-ip>:3000` (printed in terminal)
- **FastAPI Agent Backend:** `http://localhost:8000` (Bound to `0.0.0.0:8000`)

### 2. Worldwide Remote Sharing (Cloudflare Tunnel)
```powershell
.\share-tunnel.ps1
```
Generates a secure, 100% free public HTTPS link (e.g. `https://xxxx-xxxx.trycloudflare.com`) to share with groupmates anywhere in the world!

---

## 🗺️ The 5-Phase Mechanical Ratchet

```
Phase 1: Startup Problem Discovery ➔ Phase 2: Problem Screening & Scorecard ➔ Phase 3: Socratic Mom Test Defense ➔ Phase 4: Multi-Mechanism SVB Ideation ➔ Phase 5: MVP Empirical Validation
```

1. **🌾 Phase 1: Problem Landscape Discovery:** Scans 8 regional sectors in Western Visayas (*Miagao, Pototan, Carles, Dumangas*), extracting unaddressed friction and existing workarounds while eliminating solutions-in-disguise.
2. **⚖️ Phase 2: Problem Screening & Shortlisting:** Evaluates candidates across 5 criteria (*Pain, Frequency, Market Size, Sacrifice, Access*), assigning `ADVANCE TO VALIDATION`, `SECOND LOOK`, or `PARK` verdicts.
3. **🎙️ Phase 3: Socratic Mom Test Defense Clinic:** Enforces Rob Fitzpatrick's *Mom Test* across 6 sequential levels, demanding concrete figures and past actions while discarding polite compliments.
4. **💡 Phase 4: Multi-Mechanism SVB Ideation:** Explores 15 mechanism families (*Software, Hardware, Physical Hubs, Logistics, Financial Pooling, Community*) and prioritizes the Riskiest Assumption ($P_1$).
5. **📈 Phase 5: MVP Empirical Validation Audit:** Ranks skin-in-the-game evidence across the 5-Tier Behavioral Commitment Hierarchy, issuing `SCALE`, `PIVOT`, or `RETIRE` recommendations.

---

## 🧪 Automated Testing & Build Status

```powershell
# Run backend pytest suite (10/10 tests)
cd pipeline
python -m pytest tests/

# Run frontend production build (4/4 static pages)
cd web
npm run build
```

---

## 📑 Documentation

- **[docs/SRSDS.md](file:///c:/Users/markc/_Projects/automation/RatchetAI/docs/SRSDS.md)** — Software Requirements & System Design Specification (IEEE 830 / ISO 29148 / IEEE 1016).
- **[docs/DESIGN_SYSTEM.md](file:///c:/Users/markc/_Projects/automation/RatchetAI/docs/DESIGN_SYSTEM.md)** — 60-30-10 Design System & Nielsen Norman Heuristics Manual.
- **[docs/README.md](file:///c:/Users/markc/_Projects/automation/RatchetAI/docs/README.md)** — System Documentation Index.
