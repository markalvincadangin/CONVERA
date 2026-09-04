# CONVERA Testing Rules

Every meaningful code change must include appropriate verification.

## Backend Verification
- Run the relevant Pytest test suite: `python -m pytest tests/test_<module>.py -v`.
- Before final acceptance, verify the full test suite (`pytest tests`).

## Frontend Verification
- Run TypeScript type checking from `web/`: `npm run build` or `npx tsc --noEmit`.

## Regression Immunity
- A change is not complete merely because newly added tests pass.
- All 86 existing regression tests must remain passing.

## Failure Handling Protocol
If a test or verification step fails:
1. Identify the exact root cause from the error traceback.
2. Determine whether the defect is in code, schema, test fixtures, or environment.
3. Apply the minimal necessary fix.
4. Re-run verification until 100% clean.
5. Never disable, skip, or mock out a failing test to fake a green result.

## Agent Iteration Limit
- Max implementation attempts per task: 3
- Max automated repair attempts: 2
If unresolved, stop and present diagnostic evidence to the user.
