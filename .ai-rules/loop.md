# DEBUGGING & ITERATION LOOP

If a bug occurs or the user provides an error log, follow this strict loop:

1. **Isolate:** Do not guess. Identify the exact line or service causing the failure.
2. **Explain:** Briefly explain *why* it failed in 1-2 sentences.
3. **Propose Fix:** Provide the exact block of code to fix the issue.
4. **No Regression:** Ensure the fix does not break the offline-first architecture or introduce `any` types.
5. **Console Logging:** If the error is ambiguous, provide code that adds highly specific `console.log()` statements to track the data flow before attempting a blind fix.
