# CONVERA Full Verification Workflow

## Automated Verification Suite
Run all standard engineering verification gates:

```powershell
# 1. Backend Pytest Suite
cd backend
python -m pytest tests -v

# 2. Frontend TypeScript Build
cd ../web
npx tsc --noEmit

# 3. Graphify Knowledge Graph Refresh
cd ..
graphify update .
```

## Gate Requirement
All checks must return **PASS (0 Errors)** before changes can be accepted into `main`.
