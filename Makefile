.DEFAULT_GOAL := help
SHELL := /bin/bash

# Configuration: detect virtual environment binaries with system fallbacks
ROOT_DIR := $(shell pwd)
PYTHON_VENV := $(ROOT_DIR)/backend/.venv/bin
PYTHON := $(if $(wildcard $(PYTHON_VENV)/python),$(PYTHON_VENV)/python,python3)
UVICORN := $(if $(wildcard $(PYTHON_VENV)/uvicorn),$(PYTHON_VENV)/uvicorn,uvicorn)
PYTEST := $(if $(wildcard $(PYTHON_VENV)/pytest),$(PYTHON_VENV)/pytest,pytest)

.PHONY: help dev dev-backend dev-web prod-up prod-down prod-status prod-logs prod-build prod-deploy prod-share prod-backup prod-seed test test-backend test-frontend verify clean

## help: Display this interactive help menu
help:
	@echo "=========================================================="
	@echo "   CONVERA: Operational & Engineering Command Center     "
	@echo "=========================================================="
	@grep -E '^## [a-zA-Z_-]+:.*?$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = "## |: "}; {printf "  \033[36m%-16s\033[0m %s\n", $$2, $$3}'

# -----------------------------------------------------------------
# Development (Bare-Metal: Ports 3000 & 8000)
# -----------------------------------------------------------------

## dev: Start complete local dev stack (FastAPI backend + Next.js web)
dev:
	./scripts/dev/start-dev.sh

## dev-backend: Start FastAPI backend with hot-reload in .venv (:8000)
dev-backend:
	cd backend && $(UVICORN) server:app --reload --port 8000

## dev-web: Start Next.js 15 development server (:3000)
dev-web:
	npm run dev --prefix web

# -----------------------------------------------------------------
# Production & Docker Topology (Ports 3001 & 8001)
# -----------------------------------------------------------------

## prod-up: Launch team production containers in background (:3001 & :8001)
prod-up:
	docker compose up -d

## prod-down: Stop all team production containers
prod-down:
	docker compose down

## prod-status: Show running production container status and health
prod-status:
	docker compose ps

## prod-logs: Stream production container logs
prod-logs:
	docker compose logs -f

## prod-build: Rebuild production Docker images
prod-build:
	docker compose build

## prod-deploy: Run 5-stage safe promotion and deployment pipeline
prod-deploy:
	./scripts/ops/deploy-prod.sh

## prod-share: Launch Cloudflare Quick Tunnel to port 3001 for teammates
prod-share:
	./scripts/ops/share.sh

## prod-backup: Perform safe online SQLite WAL backup
prod-backup:
	./scripts/ops/backup.sh

## prod-seed: Seed production container database with local dev snapshot
prod-seed:
	./scripts/ops/seed-prod-db.sh

# -----------------------------------------------------------------
# Quality, Testing & Verification
# -----------------------------------------------------------------

## test: Run full monorepo test suite (backend pytest + frontend typecheck)
test: test-backend test-frontend

## test-backend: Run backend pytest suite (Tiers 1 & 2 offline tests)
test-backend:
	cd backend && PYTHONPATH=. $(PYTEST) tests/

## test-frontend: Run Next.js TypeScript typecheck
test-frontend:
	npm run typecheck --prefix web

## verify: Run all tests and synchronize AST knowledge graph
verify: test
	graphify update .

# -----------------------------------------------------------------
# Housekeeping
# -----------------------------------------------------------------

## clean: Remove Python bytecode, pytest cache, and Next.js build artifacts
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf web/.next
