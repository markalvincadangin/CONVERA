# Backup & Disaster Recovery Specification

**Document ID**: `CONVERA-OPS-003`  
**Classification**: SQLite WAL Backup, DR & RPO/RTO Procedures  
**Authority Tier**: Tier 2 Operations Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟡 PARTIAL  
**Canonical Path**: `docs/08-operations/BACKUP_DISASTER_RECOVERY.md`  
**Upstream Dependencies**: `05-data/DATA_ARCHITECTURE.md, 08-operations/DEPLOYMENT.md`  
**Downstream Dependents**: `08-operations/SYSTEM_CERTIFICATION.md`  

---

## 1. Executive Summary & Epistemic Recovery Invariants

The **Backup & Disaster Recovery Specification** defines the backup protocols, snapshot mechanisms, recovery procedures, and integrity verification standards for CONVERA.

Because CONVERA is an evidence-driven project intelligence system rather than a transient cache, **its SQLite Write-Ahead Logging (WAL) database represents the canonical, authoritative repository of all problem claims, empirical evidence, provenance records, decision rationales, gate reviews, and traceability linkages**.

### Core Recovery Axioms
1. **Epistemic Lineage Preservation (Constitution Article III & VI)**: Backup and disaster recovery procedures must restore not merely table rows, but the complete, uncorrupted epistemic lineage. A recovery that restores problem entities but loses historical provenance hashes, invalidation events, or mentor signoffs is **invalid and unacceptable**.
2. **Safe Online SQLite Backup**: Never copy raw `.db` files while active write transactions are occurring without proper WAL checkpointing or using the SQLite Online Backup API. Hot copies of `.db` without `.db-wal` and `.db-shm` cause database corruption.
3. **Dual-Tier Recovery (Macro vs Micro)**:
   * **Macro-Recovery (Disaster Recovery)**: Full database and artifact restoration from physical backups following host failure, hardware destruction, or database corruption.
   * **Micro-Recovery (Session Rollback)**: Fine-grained, application-level point-in-time state restoration using `SessionSnapshot` (E12) checkpoints without service downtime or database replacement.

---

## 2. Recovery Objectives Matrix (RPO & RTO)

| Deployment Profile | Recovery Point Objective (RPO) | Recovery Time Objective (RTO) | Backup Mechanism | Storage Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Profile 1: Local Development** | $< 1\text{ hour}$ | $< 5\text{ minutes}$ | Manual / Git-ignored local `.db` snapshots | Local disk (`scratch/` or `.backup/`) |
| **Profile 2: Local / On-Premise Prod** | $< 15\text{ minutes}$ | $< 10\text{ minutes}$ | Automated cron WAL checkpoint + sqlite3 backup | Dedicated local backup directory / NAS |
| **Profile 3: Self-Hosted Docker / VPS** | $< 5\text{ minutes}$ | $< 15\text{ minutes}$ | Continuous named volume snapshot + off-site sync | Encrypted S3 / Cloud Storage bucket |
| **Profile 4: Offline / Air-Gapped** | Per Milestone | $< 5\text{ minutes}$ | Application `SessionSnapshot` + manual DB export | Air-gapped USB / Optical drive |

---

## 3. SQLite WAL Backup Protocols

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SQLITE WAL BACKUP PROTOCOL                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ Active CONVERA Backend ] ── Write Transactions ──► [ ratchetai.db ]      │
│                                                       [ ratchetai.db-wal ]  │
│                                                       [ ratchetai.db-shm ]  │
│                                                               │             │
│                                                               ▼             │
│  [ Step 1: WAL Checkpoint ] ◄── PRAGMA wal_checkpoint(PASSIVE / TRUNCATE); │
│                                                               │             │
│                                                               ▼             │
│  [ Step 2: Online Backup API ] ◄── sqlite3.Connection.backup(target_conn)   │
│                                    OR: sqlite3 .backup "convera_bak.db"     │
│                                                               │             │
│                                                               ▼             │
│  [ Step 3: Integrity Verification ] ◄── PRAGMA integrity_check;             │
│                                         PRAGMA foreign_key_check;           │
│                                                               │             │
│                                                               ▼             │
│  [ Step 4: Encrypted Archive ] ── Gzip / AES-256 ──► [ Off-Site Storage ]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Live Backup Procedure (Automated Script)
To generate an uncorrupted live backup while CONVERA is actively serving requests:

```bash
#!/usr/bin/env bash
# CONVERA Safe Live Backup Script (CCDS-OPS-002)
set -euo pipefail

DB_PATH="${SQLITE_PATH:-backend/ratchetai.db}"
BACKUP_DIR="backups/$(date +%Y%m%d)"
BACKUP_FILE="${BACKUP_DIR}/convera_backup_$(date +%Y%m%d_%H%M%S).db"

mkdir -p "${BACKUP_DIR}"

# 1. Execute safe online backup using sqlite3 CLI
sqlite3 "${DB_PATH}" ".backup '${BACKUP_FILE}'"

# 2. Verify backup database integrity
INTEGRITY=$(sqlite3 "${BACKUP_FILE}" "PRAGMA integrity_check;")
if [ "${INTEGRITY}" != "ok" ]; then
    echo "ERROR: Backup integrity check failed: ${INTEGRITY}" >&2
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# 3. Compress and archive
gzip -9 "${BACKUP_FILE}"
echo "[OK] CONVERA live backup completed and verified: ${BACKUP_FILE}.gz"
```

---

## 4. Application-Level Session Snapshots (Micro-Recovery)

For non-destructive user rollbacks, framework switches, and experimentation safety, CONVERA provides fine-grained point-in-time state snapshots via `SessionSnapshot` (E12).

### Snapshot Lifecycle & Storage
1. **Automatic Milestone Snapshots**: Created prior to framework transitions (`switch_session_framework`), major decision commits, and gate reviews.
2. **Persistence Table (`session_snapshots`)**:
   * `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   * `session_id` (TEXT NOT NULL, indexed)
   * `label` (TEXT NOT NULL, e.g., `"Pre-transition snapshot (INNOVATION -> RESEARCH)"`)
   * `phase_number` (INTEGER NOT NULL)
   * `snapshot_data` (JSON TEXT containing serialized session state and framework progress)
   * `created_at` (ISO-8601 UTC timestamp)
3. **Instant Reversion (`restore_snapshot`)**: Deserializes snapshot state back into the active session record in $< 100\text{ms}$ without requiring database restart or affecting other project records.

---

## 5. Disaster Recovery Procedures

### Scenario A: SQLite Database Corruption or Lock Failure
**Symptoms**: `sqlite3.DatabaseError: database disk image is malformed` or persistent lock contention timeouts.
1. **Stop Application**: Terminate FastAPI and Next.js services (`killall uvicorn` or `docker compose down`).
2. **Preserve Malformed Files**: Move `ratchetai.db`, `ratchetai.db-wal`, and `ratchetai.db-shm` to a quarantine folder (`quarantine/`).
3. **Execute SQLite Recovery / Restore**:
   * *Option 1 (Recent Verified Backup)*: Restore latest `.db.gz` backup from `backups/`.
   * *Option 2 (SQLite Recover API)*: `sqlite3 quarantine/ratchetai.db ".recover" | sqlite3 backend/ratchetai.db`.
4. **Run Diagnostic Verification**:
   ```sql
   PRAGMA integrity_check;
   PRAGMA foreign_key_check;
   SELECT COUNT(*) FROM problems;
   SELECT COUNT(*) FROM evidence_provenance;
   ```
5. **Restart Application**: Launch backend and verify `GET /api/health`.

### Scenario B: Host Hardware Failure / Bare-Metal Migration
**Symptoms**: Complete server instance destruction.
1. **Provision New Host**: Install Python 3.12+, Node.js 20+, and runtime dependencies.
2. **Restore Filesystem & Secrets**:
   * Clone repository or deploy container image.
   * Restore `.env` configuration file containing API keys and host parameters.
   * Decompress latest verified backup to `backend/ratchetai.db`.
   * Restore document attachments and exported dossier artifacts to `exports/`.
3. **Verify Lineage & Connectors**: Run pre-flight deployment gates (Gate 1 through Gate 4 in `DEPLOYMENT.md`).

---

## 6. Backup & Disaster Recovery Invariants (BDR-01 through BDR-10)

| Invariant ID | Formulation | Enforceability & Status |
| :--- | :--- | :--- |
| **BDR-01** | **Lineage-Preserving Recovery**: Any backup and restore operation must restore complete epistemic lineage, provenance hashes, decision rationales, and gate reviews without data truncation. | `[NORMATIVE / IMPLEMENTED]`<br>Full schema serialization in SQLite WAL backup. |
| **BDR-02** | **Safe Online Backup Execution**: Physical database backups must use the SQLite Online Backup API or proper WAL checkpoints; raw uncoordinated file copying of active `.db` files is prohibited. | `[NORMATIVE / IMPLEMENTED]`<br>Documented in backup scripts and CLI procedures. |
| **BDR-03** | **Pre-Transition Snapshot Automation**: Every framework methodology transition must automatically create an attributable `SessionSnapshot` before mutating session state. | `[NORMATIVE / IMPLEMENTED]`<br>Executed in `switch_session_framework`. |
| **BDR-04** | **Post-Backup Integrity Verification**: Every automated backup must execute `PRAGMA integrity_check;` before being marked as a valid recovery point. | `[NORMATIVE / IMPLEMENTED]`<br>Enforced in automated backup pipeline. |
| **BDR-05** | **Micro-Recovery Isolation**: Restoring a `SessionSnapshot` for a specific session must never overwrite, revert, or corrupt other unrelated projects or sessions in the database. | `[NORMATIVE / IMPLEMENTED]`<br>Scoped updates in `restore_snapshot`. |
| **BDR-06** | **Disaster Recovery RTO Threshold**: Full system recovery from a verified backup must complete within the profile-specific RTO threshold ($<15\text{ minutes}$ for production). | `[NORMATIVE / IMPLEMENTED]`<br>Verified via single-file SQLite restoration. |
| **BDR-07** | **Off-Site Backup Encryption**: Backups exported to external or cloud destinations must be encrypted using AES-256 or equivalent standards before transit. | `[NORMATIVE / IMPLEMENTED]`<br>Standardized in operational security profile. |
| **BDR-08** | **Document & Artifact Sync**: Physical backups must synchronize both the relational SQLite database and associated uploaded source documents and generated deliverables. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Database backup is automated; document folder sync is documented. |
| **BDR-09** | **Corrupted WAL Quarantine**: Recovery procedures from malformed databases must quarantine corrupted WAL files rather than attempting destructive in-place writes. | `[NORMATIVE / IMPLEMENTED]`<br>Documented in Scenario A recovery protocol. |
| **BDR-10** | **Regular Disaster Recovery Drills**: Operators must execute periodic test restorations into an isolated staging environment to verify backup validity. | `[NORMATIVE / IMPLEMENTED]`<br>Standardized in deployment validation procedures. |

---

## 7. Architectural & Operational Boundary Summary

1. **Recovery vs Epistemic State**: Disaster recovery restores the physical storage layer to a known verified state; it does not alter the canonical rules governing claim validation or decision lifecycles.
2. **Subordination to Constitution**: All recovery protocols strictly adhere to Article III (*Provenance Primacy*) and Article VI (*Epistemic Invalidation*). Historical audit trails are never truncated.
3. **Local Sovereignty Guarantee**: CONVERA backups require no external cloud database subscriptions to be restored; a single SQLite `.db` file plus the codebase is sufficient for total system recreation.
