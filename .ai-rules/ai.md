# AI ENGINE IMPLEMENTATION RULES

When writing code for `modules/ai-engine/`:

1. **Structured Outputs:** Always force the OpenAI API to return JSON format so the app can reliably parse summaries, quizzes, and translations.
2. **Prompt Templates:** Hardcode prompt templates in a dedicated `PromptEngine.ts` file. UI components must never contain raw AI prompts.
3. **System Prompts:** The AI system prompt must enforce pedagogical guardrails (e.g., "You are an assistant for a Philippine public school teacher. Lower the Lexile level to Grade 6. Translate key terms to Bisaya.").
4. **Cost Efficiency:** Optimize token usage. Do not send entire textbooks in one API call; chunk the text appropriately.
