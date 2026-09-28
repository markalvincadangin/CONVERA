# CONVERA Script Catalog & Developer Utilities

**Authority**: `docs/08-operations/DEPLOYMENT.md`  
**Standard**: CONVERA Engineering Directory Structure (`CONVERA-ENG-014`)  

---

## Directory Overview

```text
scripts/
├── dev/                  # Development lifecycle automation
│   ├── start-dev.sh      # 1-click Unix/macOS/WSL development startup (:3000 & :8000)
│   └── start-dev.ps1     # 1-click Windows PowerShell multi-device startup
│
├── ops/                  # Operational and production pipelines
│   ├── deploy-prod.sh    # 5-stage automated dev-to-prod promotion pipeline
│   ├── backup.sh         # Online SQLite WAL live backup & integrity verification
│   ├── seed-prod-db.sh   # Seed production container database with dev snapshot
│   ├── share.sh          # Cloudflare Quick Tunnel 1-click teammate sharing (Unix)
│   └── share.ps1         # Cloudflare Quick Tunnel 1-click teammate sharing (Windows)
│
└── (shims)               # Backwards-compatible forwarders for legacy paths
```

---

## 1. Development Scripts (`scripts/dev/`)

### `start-dev.sh`
- **Purpose**: Bootstraps environment files (`.env`, `backend/.env`), detects Python virtual environment (`backend/.venv`), spawns the FastAPI backend hot-reload server on port `8000`, and launches the Next.js development server on port `3000`.
- **Usage**:
  ```bash
  ./scripts/dev/start-dev.sh
  # Or via root make/npm:
  make dev
  npm run dev:all
  ```

### `start-dev.ps1`
- **Purpose**: Windows PowerShell variant of development startup. Binds to `0.0.0.0` and detects LAN IP for seamless local mobile/tablet testing.
- **Usage**:
  ```powershell
  .\scripts\dev\start-dev.ps1
  ```

---

## 2. Operational Scripts (`scripts/ops/`)

### `deploy-prod.sh`
- **Purpose**: Executes the 5-stage automated deployment pipeline:
  1. **Stage 0**: Synchronize environment files.
  2. **Stage 1**: Run offline test suite (`pytest -m "not live"`).
  3. **Stage 2**: Run Phase 9 local structural conformance gate.
  4. **Stage 3**: Take safety snapshot of active production SQLite database.
  5. **Stage 4**: Rebuild Docker container images.
  6. **Stage 5**: Zero-downtime rolling update via `docker compose up -d`.
- **Usage**:
  ```bash
  ./scripts/ops/deploy-prod.sh
  # Or via make:
  make prod-deploy
  ```

### `backup.sh`
- **Purpose**: Performs a hot, zero-lock online SQLite backup using the SQLite Online Backup API, verifies database integrity (`PRAGMA integrity_check`), checks foreign keys (`PRAGMA foreign_key_check`), and archives the database as a timestamped gzip file in `backups/YYYYMMDD/`.
- **Usage**:
  ```bash
  ./scripts/ops/backup.sh
  # Or via make:
  make prod-backup
  ```

### `seed-prod-db.sh`
- **Purpose**: Copies the active local development database snapshot (`backend/convera.db`) into the running production container (`convera-backend:/data/convera.db`) and verifies integrity.
- **Usage**:
  ```bash
  ./scripts/ops/seed-prod-db.sh
  # Or via make:
  make prod-seed
  ```

### `share.sh` / `share.ps1`
- **Purpose**: Launches an ephemeral, secure Cloudflare Quick Tunnel (`trycloudflare.com`) pointing to port `3001` to allow instant testing and demonstration with remote teammates without firewall configuration.
- **Usage**:
  ```bash
  ./scripts/ops/share.sh
  # Or via make:
  make prod-share
  ```
