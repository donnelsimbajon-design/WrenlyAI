# TECH STACK & CODING SKILLS

## Approved Stack
- **Frontend:** React Native (Expo) + Expo Router
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Local DB:** `expo-sqlite` and Async Storage
- **State Management:** Zustand
- **AI API:** OpenAI API (`gpt-4o`)

## Strict Coding Rules
1. **TypeScript Only:** Strict typing is mandatory. NEVER use `any`. Define interfaces in a `types.ts` file for every module.
2. **Dumb Components:** UI components must not contain complex business logic. Logic lives in custom hooks (`useFeature.ts`) and services.
3. **Repository Pattern:** All Supabase interactions must go through repository files (e.g., `AuthRepository.ts`), never directly inside a `.tsx` view.
4. **Error Handling:** Wrap all async operations in try/catch blocks and return standardized error objects.
