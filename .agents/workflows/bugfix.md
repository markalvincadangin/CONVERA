# CONVERA Bugfix Workflow

## Sequence: OBSERVE $\to$ REPRODUCE $\to$ DIAGNOSE $\to$ FIX $\to$ VERIFY $\to$ RATIFY

1. **Observe & Reproduce:** Run the failing test or reproduce the issue with minimal steps.
2. **Diagnose Root Cause:** Trace through stack trace, AST, and database state to identify exact failure line.
3. **Minimal Fix:** Apply the smallest surgical correction that resolves the issue without architectural churn.
4. **Regression Test:** Run the affected test and full test suite to ensure 0 regressions.
5. **Verify:** Confirm all quality gates pass.
