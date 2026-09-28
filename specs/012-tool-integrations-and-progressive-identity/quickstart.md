# Quickstart & Validation Guide: Feature 012

**Feature**: `012-tool-integrations-and-progressive-identity`  
**Purpose**: Runnable validation scenarios and setup guide to verify progressive identity, credential vault, tool integrations, and Docker deployment end-to-end.

---

## 1. Prerequisites

### Local Development Environment
- Python 3.12+ with virtual environment configured in `backend/.venv`
- Node.js 20+ and npm 10+
- SQLite 3 (built-in with Python)
- Docker 24+ and Docker Compose v2 (v2.20+)

---

## 2. Docker Local Deployment (Primary Mode)

### Step 1: Configure Environment
Copy the environment template:
```bash
cp .env.docker .env
```
Key configuration parameters in `.env`:
```env
AUTH_ENABLED=true
BACKEND_PORT=8000
WEB_PORT=3000
OLLAMA_PORT=11434
OLLAMA_MODEL=llama3.2:3b
```

### Step 2: Launch the 4-Service Stack
```bash
docker compose up -d
```
The stack will:
1. Build and start `convera-backend` (FastAPI)
2. Build and start `convera-web` (Next.js 15)
3. Start `convera-ollama` (Ollama runtime with GPU passthrough if NVIDIA driver present, CPU otherwise)
4. Start `convera-model-bootstrap` (auto-pulls `llama3.2:3b` and exits)

### Step 3: Verify Container Health
```bash
docker compose ps
```
Expected output:
- `convera-backend`: `Up (healthy)`
- `convera-web`: `Up (healthy)`
- `convera-ollama`: `Up (healthy)`
- `convera-model-bootstrap`: `Exited (0)`

Open browser at `http://localhost:3000`.

---

## 3. End-to-End Validation Scenarios

### Scenario A: Progressive Identity & Anonymous Exploration
1. **Action**: Open an incognito browser window at `http://localhost:3000`.
2. **Observe**: No login modal appears. The workspace dashboard loads directly.
3. **Action**: Create a new workspace named `Cap-Solar-01`. Enter a research problem: *"Optimizing micro-inverter heat dissipation in tropical climates"*.
4. **Result**: The problem is saved to the local SQLite database.
5. **Action**: Click "Share Workspace".
6. **Result**: The modal displays the 8-character share code (e.g. `SOLR-9A2X`) and an optional 4-digit PIN.

---

### Scenario B: Account Registration & Ownership Claim
1. **Action**: In the same incognito window, click the user avatar in the navigation bar and select **"Create Account"**.
2. **Action**: Register with:
   - Email: `researcher@university.edu`
   - Password: `SecureAcademicPassword2026!`
   - Display Name: `Maria Santos`
3. **Verify**:
   - HTTP response sets `convera_access` and `convera_refresh` cookies (HttpOnly, SameSite=Lax).
   - In SQLite database, `users` table has a new record with an `Argon2id` hash.
   - `workspace_memberships` table binds `Maria Santos` as `OWNER` of `Cap-Solar-01`.

---

### Scenario C: Role-Based Invite Link Generation & Redemption
1. **Action**: As logged-in user `Maria Santos`, open the workspace settings for `Cap-Solar-01`.
2. **Action**: Click **"Invite Collaborator"**. Select role **"ADVISOR"** and click **"Generate Invite Link"**.
3. **Result**: An invite link `http://localhost:3000/invite/INV-8f2a...` is generated.
4. **Action**: Open a second browser profile. Navigate to the invite link.
5. **Observe**: The invite redemption page displays: *"Maria Santos invited you to join Cap-Solar-01 as an Advisor."*
6. **Action**: Register as `Dr. Alan Cruz`. Click **"Accept Invite"**.
7. **Verify**:
   - `Dr. Alan Cruz` gains access to `Cap-Solar-01`.
   - The user interface reveals the **"Mentor Sign-off"** and **"Review Endorsement"** controls.
   - The user cannot see **"Delete Workspace"** or **"AI Provider Settings"** (RBAC enforced).

---

### Scenario D: AI Provider Credential Encryption & Dynamic Cascade
1. **Action**: Navigate to `http://localhost:3000/settings/ai`.
2. **Action**: Add an API key for Google Gemini or Groq:
   - Enter API Key: `AIzaSyDummyKeyForValidation...`
   - Select priority: Rank 1
3. **Verify**:
   - Key is saved to `ai_provider_registry` in encrypted form (`gAAAAA...` Fernet ciphertext).
   - The database does NOT contain `AIzaSyDummyKeyForValidation` in plaintext.
   - Frontend displays masked key (`••••••••1234`).
4. **Action**: Click **"Test Connection"**.
5. **Result**: Backend decrypts the key in memory, executes a ping test, and updates health status to `HEALTHY`.

---

### Scenario E: Zotero Reference Ingestion
1. **Action**: Navigate to `http://localhost:3000/settings/integrations`.
2. **Action**: Connect Zotero by providing User ID and API Key.
3. **Action**: Click **"Sync References Now"**.
4. **Observe**:
   - Sync progress modal reports references scanned and ingested.
   - References appear in the workspace evidence pool with complete bibliographic metadata (author, title, year, DOI).
   - Epistemic status is stamped as `UNVERIFIED` (Constitution Article III).
   - `sync_log` table contains an entry with `sync_type='PULL'`, `items_created > 0`, and latency in milliseconds.

---

## 4. Teardown & Reset Commands

```bash
# Graceful stop
docker compose down

# Stop and wipe database volume (⚠️ Destructive reset)
docker compose down -v
```
