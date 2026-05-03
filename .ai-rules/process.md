# DEVELOPMENT WORKFLOW

When given a task, you must follow this exact sequence:

1. **Analyze:** Briefly restate the goal and how it fits into the Wrenly AI offline-first architecture.
2. **Plan:** List the exact files to be created or modified.
3. **Define Interfaces:** Write the TypeScript interfaces/types first to establish the data contract.
4. **Execute Backend/Services:** Write the Supabase SQL, repository, or AI service code.
5. **Execute Frontend:** Write the React Native Expo UI components and bind them to the services.
6. **Review:** Check against the rules in `skill.md` (e.g., "Are there any 'any' types?").
