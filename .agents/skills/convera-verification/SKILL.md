---
name: convera-verification
description: Engineering verification protocol for CONVERA. Use to execute pytest suites, TypeScript typechecks, schema checks, and closed-loop regression tests.
---

# CONVERA Verification Skill

## Verification Workflow
Execute the standard 4-step verification gate:

1. **Backend Unit & Integration Tests:**
   ```powershell
   cd backend
   python -m pytest tests -v
   ```

2. **Frontend Typecheck & Build:**
   ```powershell
   cd web
   npm run build # or npx tsc --noEmit
   ```

3. **Schema & Integrity Verification:**
   Verify foreign keys and column order in `storage/sqlite_adapter.py`.

4. **Graphify Knowledge Graph Update:**
   ```powershell
   graphify update .
   ```
