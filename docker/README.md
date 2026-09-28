# CONVERA Docker Topology & Containerized Deployment

**Specification**: Profile 3 (Self-Hosted Team Docker Deployment)  
**Governance**: Free-First, 100% Offline Baseline (Articles I-VIII)  
**Operational Guide**: `docs/08-operations/DEPLOYMENT.md`  

---

## 1. Architecture & Service Topology

The Docker deployment topology runs as a self-contained multi-container network:

```
                           CONVERA DOCKER TOPOLOGY
                           
      Host Port 3001                                  Host Port 8001
            │                                               │
            ▼                                               ▼
  ┌───────────────────────┐                       ┌───────────────────────┐
  │      convera-web      │  /api/* (SSR Proxy)   │    convera-backend    │
  │   (Next.js 15 SSR)    │ ────────────────────► │  (FastAPI + SQLite)   │
  │     Port 3000         │                       │      Port 8000        │
  └───────────────────────┘                       └───────────┬───────────┘
              │                                               │
              │             convera-network                   │
              └───────────────────┬───────────────────────────┘
                                  ▼
                      ┌───────────────────────┐
                      │    convera-ollama     │
                      │  (Local LLM Engine)   │
                      │      Port 11434       │
                      └───────────────────────┘
                                  ▲
                                  │ (bootstraps default model)
                      ┌───────────────────────┐
                      │convera-model-bootstrap│
                      │  (One-shot curl init) │
                      └───────────────────────┘
```

---

## 2. Port Mapping & Non-Interference Guarantee

To ensure total independence between bare-metal local development and containerized production, production ports are offset by `+1`:

| Service | Container Internal Port | Default Host Production Port | Dev Bare-Metal Port | Configurable Variable |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | `3000` | **`3001`** | `3000` | `PROD_WEB_PORT` |
| **Backend API** | `8000` | **`8001`** | `8000` | `PROD_BACKEND_PORT` |
| **Ollama LLM** | `11434` | **`11434`** | `11434` | `OLLAMA_PORT` |

---

## 3. Persistent Volumes

| Volume Name | Container Mount Point | Contents | Lifecycle |
| :--- | :--- | :--- | :--- |
| `convera-data` | `convera-backend:/data` | SQLite database (`convera.db`), WAL files, master encryption key (`.convera_key`) | Persists across container rebuilds and reloads. |
| `convera-ollama-models` | `convera-ollama:/root/.ollama` | Quantized GGUF model weights (e.g. `llama3.2:3b`) | Preserves downloaded models across host reboots. |

---

## 4. Operational Commands

```bash
# Start container stack in detached mode
docker compose up -d

# Check running status and healthcheck states
docker compose ps

# View real-time container logs
docker compose logs -f

# Stop container stack
docker compose down

# Rebuild images after modifying source code
docker compose build
```
Or via root `Makefile`:
```bash
make prod-up
make prod-down
make prod-status
make prod-logs
make prod-build
```
