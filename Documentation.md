# WRENLY AI — Implementation Prompts
**Step-by-step build guide with one prompt per module**
Stack: Expo · Supabase · Gemma 3 (on-device, free AI)

---

## ⚡ BEFORE YOU START — Read This First

Build in this exact order. Each module depends on the one before it.

| Order | Module | Depends On |
|-------|--------|------------|
| 1 | Security (Auth + Roles) | Nothing — start here |
| 2 | Classroom System | Security |
| 3 | Materials Processing | Classroom |
| 4 | AI Engine (Gemma) | Materials |
| 5 | Chat System | Classroom + Security |
| 6 | Offline-First | Materials + AI Engine |
| 7 | Sync Engine | Offline |
| 8 | Voice System | AI Engine |
| 9 | Analytics | AI Engine + Quizzes |
| 10 | Wrenly Brain (Master) | All modules |

---

## 🛠️ PHASE 0 — Project Setup

### Prompt 0A — Initialize Expo Project

```
Create a new Expo project for an app called Wrenly AI.

Requirements:
- Use: npx create-expo-app wrenly-ai --template blank-typescript
- Set up Expo Router v3 with file-based routing
- Create this folder structure:
  /app               ← screens (Expo Router)
  /modules
    /security
    /classroom
    /materials
    /ai-engine
    /voice
    /chat
    /analytics
    /offline
    /sync
    /wrenly-brain
  /components
  /services
  /store
  /types
  /config
  /database
- Install these packages:
  @supabase/supabase-js
  expo-secure-store
  @react-native-async-storage/async-storage
  expo-file-system
  expo-document-picker
  expo-av
  expo-speech
  react-native-gifted-chat
  zustand
  expo-sqlite
  @legendapp/state
- Create /config/supabase.ts that reads SUPABASE_URL and SUPABASE_ANON_KEY from environment variables using expo-constants
- Show me every command to run and every file to create
```

---

### Prompt 0B — Supabase Project Setup

```
Set up a Supabase project for Wrenly AI.

Give me the exact steps:
1. How to create a new project at supabase.com
2. Where to find the Project URL and anon key
3. How to enable Email auth in the Auth settings
4. How to enable Storage
5. Create this SQL schema — give me the full SQL to paste into the Supabase SQL editor:

Tables needed:
- profiles (id, email, role: 'teacher'|'student', full_name, avatar_url, created_at)
- classrooms (id, name, code, teacher_id, description, created_at)
- classroom_members (id, classroom_id, student_id, joined_at)
- materials (id, classroom_id, teacher_id, title, file_url, file_type, status: 'processing'|'ready', created_at)
- lessons (id, material_id, title, summary, simplified_text, tagalog_text, bisaya_text, created_at)
- quizzes (id, lesson_id, questions: jsonb, created_at)
- quiz_attempts (id, quiz_id, student_id, answers: jsonb, score, completed_at)
- messages (id, classroom_id, sender_id, content, type: 'text'|'ai', created_at)
- announcements (id, classroom_id, teacher_id, title, content, created_at)

Enable Row Level Security on all tables.
Write RLS policies so:
- Teachers can manage their own classrooms and materials
- Students can only read classrooms they are members of
- All authenticated users can read their own profile

Also create a Supabase Storage bucket called 'materials' (public: false).
```

---

## 🔐 MODULE 09 — Security System

### Prompt 1 — Auth Screens + Role Assignment

```
Build the Security module for Wrenly AI using Expo Router and Supabase Auth.

Files to create:
- /app/(auth)/login.tsx
- /app/(auth)/register.tsx
- /app/(auth)/_layout.tsx
- /modules/security/auth.service.ts
- /modules/security/useAuth.ts (Zustand store)
- /types/auth.types.ts

Requirements:
- Login screen: email + password fields, login button, link to register
- Register screen: full name, email, password, role selector (Teacher or Student radio buttons)
- On register, create a row in the profiles table with the selected role
- On login, fetch the profile and store role in Zustand
- useAuth store must expose: user, profile, role, isLoading, signIn(), signOut(), signUp()
- Protect routes: if not logged in, redirect to /login
- If logged in, redirect based on role:
  - Teacher → /teacher/dashboard
  - Student → /student/dashboard
- Use expo-secure-store to persist the session token
- Show loading spinner while checking auth state

Use TypeScript. Show every complete file.
```

---

## 🏫 MODULE 01 — Classroom System

### Prompt 2 — Create & Join Classrooms

```
Build the Classroom module for Wrenly AI.

Files to create:
- /app/(teacher)/dashboard.tsx
- /app/(teacher)/classroom/[id].tsx
- /app/(teacher)/classroom/create.tsx
- /app/(student)/dashboard.tsx
- /app/(student)/classroom/[id].tsx
- /app/(student)/join.tsx
- /modules/classroom/classroom.service.ts
- /modules/classroom/useClassroom.ts

Requirements:
Teacher side:
- Dashboard shows list of their classrooms (fetched from Supabase)
- Create classroom form: name + description → auto-generate a 6-character join code → save to Supabase
- Classroom detail page shows: members list, announcements tab, materials tab
- Teacher can post announcements (saved to announcements table)

Student side:
- Dashboard shows list of joined classrooms
- Join screen: enter 6-character code → find classroom → insert into classroom_members
- Classroom view: see announcements and available materials (no upload button)

classroom.service.ts must have:
- createClassroom(name, description, teacherId)
- generateJoinCode() — returns random 6-char uppercase string
- joinClassroom(code, studentId)
- getMyClassrooms(userId, role)
- getClassroomMembers(classroomId)
- postAnnouncement(classroomId, teacherId, title, content)

Use TypeScript. Show every complete file.
```

---

## 📄 MODULE 02 — Materials Processing

### Prompt 3 — File Upload + Extraction

```
Build the Materials Processing module for Wrenly AI.

Files to create:
- /app/(teacher)/classroom/[id]/upload.tsx
- /modules/materials/materials.service.ts
- /modules/materials/extractor.service.ts
- /types/materials.types.ts

Requirements:
Upload flow:
1. Teacher taps Upload in their classroom
2. expo-document-picker opens — allow PDF and PPT files only
3. File uploads to Supabase Storage bucket 'materials' at path: classroomId/filename
4. Insert a row into materials table with status: 'processing'
5. Show upload progress bar

Extraction (extractor.service.ts):
- For PDFs: use expo-file-system to read the file, extract raw text using a simple byte-reading approach
- Store extracted text in a local variable and pass it to the AI engine
- Create a function: extractTextFromFile(fileUri, fileType) → Promise<string>
- After extraction, update materials row status to 'ready'

materials.service.ts must have:
- uploadMaterial(file, classroomId, teacherId) → uploads + creates DB row
- getMaterials(classroomId)
- getMaterialById(id)
- updateMaterialStatus(id, status)
- deleteMaterial(id)

Show a material card component:
/components/MaterialCard.tsx
- Shows: file name, type badge (PDF/PPT), status badge (Processing/Ready), upload date
- Tap to open lesson view

Use TypeScript. Show every complete file.
```

---

## 🤖 MODULE 03 — AI Engine (Gemma 3 — Free, On-Device)

### Prompt 4A — Install Gemma 3 On-Device AI

```
Set up Gemma 3 as the free on-device AI for Wrenly AI using React Native.

I want to use MediaPipe LLM Inference or the react-native-executorch package to run Gemma 3 locally on the phone with no internet and no API cost.

Do this:
1. Install: expo install react-native-executorch
   (or if not available: use @mediapipe/tasks-genai via a custom Expo module)
2. Download the Gemma 3 1B model file (gemma-3-1b-it-int4.task) from Hugging Face:
   https://huggingface.co/google/gemma-3-1b-it
3. Store the model file in /assets/models/gemma3.task
4. Create /modules/ai-engine/gemma.service.ts with:
   - initModel() — loads the model once on app start
   - generate(prompt: string, maxTokens?: number) → Promise<string>
   - isModelLoaded: boolean
   - Handle loading state and errors
5. Create /modules/ai-engine/ModelLoader.tsx component:
   - Shows download progress on first launch
   - Stores model in expo-file-system cache directory after first download
   - On subsequent launches, loads from cache (no re-download)
6. Wrap the root layout with ModelLoader so the model is ready before any screen loads

Show every complete file with TypeScript.
```

---

### Prompt 4B — AI Learning Engine (Summarize, Quiz, Translate)

```
Build the AI Learning Engine module for Wrenly AI using the Gemma 3 service from the previous step.

Files to create:
- /modules/ai-engine/lesson.service.ts
- /modules/ai-engine/quiz.service.ts
- /modules/ai-engine/translation.service.ts
- /modules/ai-engine/prompts.ts
- /app/(teacher)/classroom/[id]/material/[materialId].tsx

prompts.ts — create these exact prompt templates:

SUMMARIZE_PROMPT:
"You are Wrenly, an AI teacher assistant for Filipino students. 
Read this lesson text and create a simplified summary a Grade 5 student can understand.
Use short sentences. Avoid difficult words. Maximum 200 words.
Lesson text: {{TEXT}}
Summary:"

QUIZ_PROMPT:
"You are Wrenly. Generate 5 multiple-choice questions from this lesson.
Format your response as JSON array only, no extra text:
[{"question":"...","choices":["A)...","B)...","C)...","D)..."],"answer":"A"}]
Lesson: {{TEXT}}"

TAGALOG_PROMPT:
"You are Wrenly. Translate this lesson summary to simple Filipino/Tagalog that a Grade 5 student can understand.
Keep sentences short. Do not use difficult Tagalog words.
English text: {{TEXT}}
Tagalog translation:"

BISAYA_PROMPT:
"You are Wrenly. Translate this lesson summary to simple Cebuano/Bisaya that a student from Mindanao can understand.
Keep sentences short and natural.
English text: {{TEXT}}
Bisaya translation:"

lesson.service.ts:
- processLesson(materialId, extractedText) → runs summarize → translate to Tagalog → translate to Bisaya → save all to lessons table

quiz.service.ts:
- generateQuiz(lessonId, lessonText) → run QUIZ_PROMPT → parse JSON → save to quizzes table
- submitQuizAttempt(quizId, studentId, answers) → calculate score → save to quiz_attempts

Material detail screen:
- Shows tabs: Summary | Tagalog | Bisaya | Quiz
- Teacher sees a Generate button that triggers processLesson() and generateQuiz()
- Students see the lesson in their preferred language
- Quiz tab shows questions one at a time with radio button choices

Show every complete file with TypeScript.
```

---

## 💬 MODULE 05 — Chat System

### Prompt 5 — Classroom Chat + AI Chat

```
Build the Chat module for Wrenly AI using Supabase Realtime and react-native-gifted-chat.

Files to create:
- /app/(teacher)/classroom/[id]/chat.tsx
- /app/(student)/classroom/[id]/chat.tsx
- /modules/chat/chat.service.ts
- /modules/chat/useChat.ts
- /components/ChatBubble.tsx

Requirements:
Classroom group chat:
- Real-time messages using Supabase Realtime subscription on messages table
- Filter by classroom_id
- Show sender name and timestamp on each bubble
- Teachers see a [Teacher] badge next to their name
- Messages persist in Supabase messages table

AI chat (student only):
- A separate chat tab where the student talks directly to Wrenly AI
- Student message → run through Gemma 3 with this system prompt:
  "You are Wrenly, a friendly AI tutor for Filipino students. 
   Answer only questions related to lessons, school, and learning.
   Keep answers short and easy to understand.
   If asked in Tagalog, answer in Tagalog. If asked in Bisaya, answer in Bisaya."
- AI response appears as a message bubble with a 🤖 Wrenly avatar
- Messages are stored locally only (not in Supabase) for privacy

chat.service.ts:
- sendMessage(classroomId, senderId, content)
- subscribeToMessages(classroomId, callback) → returns unsubscribe function
- getMessageHistory(classroomId, limit = 50)

Show every complete file with TypeScript.
```

---

## 📶 MODULE 07 — Offline-First System

### Prompt 6 — Local SQLite + Offline Access

```
Build the Offline-First module for Wrenly AI using expo-sqlite and @legendapp/state.

Files to create:
- /database/schema.ts
- /database/db.ts
- /modules/offline/offline.service.ts
- /modules/offline/useOfflineStore.ts

Requirements:
Local SQLite database:
Create these tables locally (mirroring Supabase):
- local_lessons (id, material_id, title, summary, simplified_text, tagalog_text, bisaya_text, cached_at)
- local_quizzes (id, lesson_id, questions TEXT, cached_at)
- local_quiz_attempts (id, quiz_id, student_id, answers TEXT, score, synced: INTEGER DEFAULT 0, completed_at)
- local_messages (id, classroom_id, sender_id, content, type, synced: INTEGER DEFAULT 0, created_at)
- local_announcements (id, classroom_id, title, content, cached_at)

offline.service.ts must have:
- initDatabase() — creates all tables if they don't exist, called on app start
- cacheLesson(lesson) — saves lesson to local_lessons
- getCachedLesson(materialId) — reads from SQLite
- cacheQuiz(quiz) — saves quiz locally
- getCachedQuiz(lessonId)
- saveOfflineAttempt(attempt) — saves with synced=0
- saveOfflineMessage(message) — saves with synced=0
- getPendingSyncItems() — returns all rows where synced=0

useOfflineStore.ts:
- Use @legendapp/state for reactivity
- isOnline: boolean (use NetInfo to detect)
- When a lesson is opened, check local cache first. If not cached, fetch from Supabase and cache it.
- If offline: serve from cache. Show a small "Offline Mode" banner at the top.

Show every complete file with TypeScript.
```

---

## 🔁 MODULE 08 — Sync Engine

### Prompt 7 — Background Sync When Online

```
Build the Sync Engine module for Wrenly AI.

Files to create:
- /modules/sync/sync.service.ts
- /modules/sync/useSync.ts
- /modules/sync/SyncIndicator.tsx

Requirements:
sync.service.ts:
- syncAll() — master function, runs all sync tasks in order
- syncQuizAttempts() — find local_quiz_attempts where synced=0 → push to Supabase quiz_attempts → mark synced=1
- syncMessages() — find local_messages where synced=0 → push to Supabase messages → mark synced=1
- pullNewLessons(classroomIds) — fetch lessons created after last sync timestamp → cache locally
- pullNewAnnouncements(classroomIds) — same pattern
- Store last_sync_timestamp in expo-secure-store

Trigger sync:
- When app comes back online (NetInfo event), call syncAll() automatically
- When app opens and is online, call syncAll() after 2 second delay
- Use a background task with expo-background-fetch to sync every 15 minutes when online

useSync.ts:
- isSyncing: boolean
- lastSyncTime: Date | null
- pendingCount: number (count of unsynced local rows)
- triggerSync() — manual sync

SyncIndicator.tsx component:
- Small banner that shows:
  - 🟢 "Synced" when everything is up to date
  - 🔄 "Syncing..." with a spinner when syncing
  - 🔴 "X items pending sync" when offline with pending data
- Show this in the header of every main screen

Use TypeScript. Show every complete file.
```

---

## 🎤 MODULE 04 — Voice System

### Prompt 8 — Text-to-Speech + Speech-to-Text

```
Build the Voice module for Wrenly AI using expo-speech and expo-av.

Files to create:
- /modules/voice/tts.service.ts
- /modules/voice/stt.service.ts
- /modules/voice/useVoice.ts
- /components/VoiceReader.tsx
- /components/VoiceInput.tsx

tts.service.ts — Text to Speech (uses device TTS, zero bandwidth):
- speak(text, language?) — uses expo-speech to read text aloud
  - language options: 'en-PH', 'fil-PH' (Tagalog), 'ceb' (Bisaya/fallback to en)
- stop() — stop speaking
- isSpeaking: boolean
- getAvailableVoices() — list installed voices on device

stt.service.ts — Speech to Text:
- startListening() — uses expo-av to record audio
- stopListening() → returns recorded audio URI
- transcribe(audioUri) → run through Gemma 3 with prompt:
  "Transcribe this student's spoken question into text. 
   The student may speak in English, Tagalog, or Bisaya.
   Return only the transcribed text, nothing else."

VoiceReader.tsx component:
- Receives: text (string), language ('en'|'tl'|'ceb')
- Shows a 🔊 Play button and a ⏹ Stop button
- When Play is tapped, calls tts.service.ts speak()
- Shows which language is being read
- Place this at the bottom of every lesson summary screen

VoiceInput.tsx component:
- A 🎤 microphone button
- Hold to record, release to transcribe
- Shows audio waveform animation while recording
- On release: transcribes → sends transcribed text to AI chat

Show every complete file with TypeScript.
```

---

## 📊 MODULE 06 — Analytics System

### Prompt 9 — Student Performance + Teacher Dashboard

```
Build the Analytics module for Wrenly AI.

Files to create:
- /modules/analytics/analytics.service.ts
- /app/(teacher)/classroom/[id]/analytics.tsx
- /app/(student)/my-progress.tsx
- /components/ProgressChart.tsx
- /components/WeakTopicCard.tsx

analytics.service.ts:
- getStudentScores(classroomId) → fetch all quiz_attempts joined with quizzes and profiles
- getWeakTopics(studentId) → find quizzes where score < 60% → return lesson titles
- getClassAverage(classroomId) → average score across all students
- getStudentProgress(studentId) → array of {lessonTitle, score, completedAt} ordered by date
- getCompletionRate(classroomId) → % of students who completed at least one quiz

Teacher Analytics screen (/app/(teacher)/classroom/[id]/analytics.tsx):
- Class average score (big number display)
- List of students with their average score and a color badge:
  - 🟢 80%+ = Excellent
  - 🟡 60–79% = Needs Review  
  - 🔴 Below 60% = Needs Help
- Weak topics section: list of lesson titles where class average is below 60%
- Each weak topic has an "AI Suggestion" button — taps generate a Gemma 3 prompt:
  "A class of Filipino students scored below 60% on this lesson: {{LESSON_TITLE}}.
   Give 3 short, practical teaching tips to help them understand it better."

Student Progress screen:
- Personal score history shown as a simple bar chart (use react-native-chart-kit)
- List of completed lessons with score badges
- Weak topics: "You need to review:" section

Show every complete file with TypeScript.
```

---

## 🧠 MODULE 10 — Wrenly Brain (Master AI Controller)

### Prompt 10 — Prompt Engine + Mode Controller

```
Build the Wrenly Brain module — the master AI behavior controller for Wrenly AI.

Files to create:
- /modules/wrenly-brain/brain.service.ts
- /modules/wrenly-brain/prompts.registry.ts
- /modules/wrenly-brain/memory.service.ts
- /modules/wrenly-brain/guardrails.service.ts

prompts.registry.ts — Master prompt registry:
Create a typed registry of all prompts used across the app.
Each prompt has: id, mode ('teacher'|'student'|'both'), template (string with {{VARIABLES}}), maxTokens

Include prompts for:
- LESSON_SUMMARIZE (teacher mode)
- QUIZ_GENERATE (teacher mode)
- TRANSLATE_TAGALOG (both)
- TRANSLATE_BISAYA (both)
- STUDENT_TUTOR (student mode) — Wrenly answers student questions
- TEACHER_INSIGHT (teacher mode) — explains analytics and gives teaching tips
- WEAK_TOPIC_ADVICE (teacher mode) — gives remediation suggestions
- CONTENT_CHECK (both) — checks if a question is school-appropriate

brain.service.ts — Master controller:
- ask(promptId, variables, userRole) → 
  1. Get prompt from registry
  2. Check user role matches prompt mode
  3. Fill in variables
  4. Run guardrails check
  5. Call Gemma 3
  6. Return response

guardrails.service.ts — Safety layer (DepEd DO 003 compliance):
- isSchoolAppropriate(text) → run through Gemma with prompt:
  "Is this question appropriate for a school learning app for Filipino students aged 6-18?
   Answer only YES or NO."
- requiresTeacherReview(action) → returns true for: grade recording, disciplinary notes, final assessment
- logAIInteraction(promptId, input, output, userId) → save to local SQLite for audit trail

memory.service.ts — Student learning memory:
- saveStudentContext(studentId, {lastLesson, weakTopics, preferredLanguage})
- getStudentContext(studentId) → inject into student prompts for personalization
- Store in expo-secure-store as JSON

Show every complete file with TypeScript.
```

---

## 🔗 INTEGRATION — Wire All Modules Together

### Prompt 11 — Final Integration

```
Wire all Wrenly AI modules together into a complete working app.

Do the following:

1. Root layout (/app/_layout.tsx):
- Wrap with: ModelLoader (Gemma), DatabaseInit (SQLite), AuthProvider, SyncProvider
- Check auth state on load → redirect to correct dashboard
- Show SyncIndicator in all authenticated layouts

2. Teacher app flow:
/app/(teacher)/_layout.tsx → tab navigator with:
- Dashboard (classrooms list)
- For each classroom: Materials | Chat | Announcements | Analytics tabs

3. Student app flow:
/app/(student)/_layout.tsx → tab navigator with:
- My Classes
- My Progress (analytics)
- AI Chat (Wrenly tutor)

4. Lesson flow (student):
- Tap material → check offline cache first → show lesson
- Language switcher (EN | Filipino | Bisaya) at top
- VoiceReader component at bottom
- Take Quiz button → shows questions → submit → show score

5. Lesson flow (teacher):
- Tap material → see processing status
- If ready: tap Generate Lesson → calls AI engine → generates lesson + quiz
- Preview lesson in all 3 languages
- Publish button makes it visible to students

6. Environment setup:
Create /config/env.ts with:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- AI_MODE: 'gemma' (always use on-device Gemma, never paid APIs)

Create a .env file template showing exactly what variables are needed.

Show every file needed to complete the integration. Use TypeScript.
```

---

## 📱 FREE AI — Gemma 3 Setup Reference

### Which model to use

| Model | Size | RAM Needed | Speed | Best For |
|-------|------|-----------|-------|----------|
| Gemma 3 1B INT4 | ~600MB | 2GB RAM | Fast | Student tutor, translation |
| Gemma 3 4B INT4 | ~2.5GB | 4GB RAM | Medium | Better quality answers |

Use **Gemma 3 1B INT4** for most phones in the Philippines.

### Where to download

```
Model file: gemma-3-1b-it-int4.task
Download from: https://huggingface.co/google/gemma-3-1b-it
Or use: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
```

### Alternative: Ollama (for development only)

```
If testing on a computer (not phone), use Ollama:
1. Install: https://ollama.com
2. Run: ollama pull gemma3:1b
3. API runs at: http://localhost:11434/api/generate
4. Only use this for local dev — switch to on-device for real phones
```

### Prompt to set up Ollama dev mode

```
Set up a development AI service for Wrenly AI that uses Ollama locally for testing.

Create /modules/ai-engine/ai.service.ts that:
- In development (__DEV__ === true): calls Ollama at http://localhost:11434/api/generate with model 'gemma3:1b'
- In production: uses the on-device Gemma 3 via react-native-executorch
- Same interface: generate(prompt, maxTokens?) → Promise<string>
- Handles errors and timeouts (30 second timeout)
- Logs every prompt and response in development mode

This way I can test fast on my computer and it automatically switches to on-device AI when I build for real phones.
```

---

## ✅ CHECKLIST — In Order

Copy this and check off as you go:

```
PHASE 0 — Setup
[ ] Ran: npx create-expo-app wrenly-ai --template blank-typescript
[ ] Created Supabase project
[ ] Pasted SQL schema into Supabase SQL editor
[ ] Enabled RLS on all tables
[ ] Created storage bucket 'materials'
[ ] Added SUPABASE_URL and SUPABASE_ANON_KEY to .env
[ ] Installed all npm packages

MODULE 09 — Security
[ ] Login screen works
[ ] Register screen works with role selection
[ ] Profile row created in Supabase on register
[ ] Teacher redirects to teacher dashboard
[ ] Student redirects to student dashboard
[ ] Session persists after app close

MODULE 01 — Classroom
[ ] Teacher can create a classroom
[ ] Join code is generated and visible
[ ] Student can join with code
[ ] Announcements show in classroom

MODULE 02 — Materials
[ ] Teacher can upload a PDF
[ ] File appears in Supabase Storage
[ ] Material row created with status 'processing'
[ ] Students can see uploaded materials

MODULE 03 — AI Engine
[ ] Gemma 3 model downloads on first launch
[ ] Model loads from cache on second launch
[ ] Generate Lesson button runs summarization
[ ] Lesson appears in English, Tagalog, and Bisaya tabs
[ ] Generate Quiz creates 5 questions
[ ] Student can take quiz and see score

MODULE 05 — Chat
[ ] Group chat messages appear in real time
[ ] Messages persist in Supabase
[ ] AI chat tab responds with Gemma 3
[ ] Teacher badge shows next to teacher names

MODULE 07 — Offline
[ ] SQLite database initializes on app start
[ ] Lesson loads from cache when offline
[ ] "Offline Mode" banner shows
[ ] Quiz attempt saved locally when offline

MODULE 08 — Sync
[ ] SyncIndicator shows in header
[ ] Quiz attempts push to Supabase when back online
[ ] Messages sync when back online
[ ] Last sync time updates

MODULE 04 — Voice
[ ] Lesson text reads aloud in English
[ ] Lesson text reads in Filipino voice
[ ] Microphone button records student question
[ ] Transcribed text sent to AI chat

MODULE 06 — Analytics
[ ] Teacher sees class average score
[ ] Color badges show on student list
[ ] Weak topics identified correctly
[ ] Student sees their own progress chart

MODULE 10 — Wrenly Brain
[ ] All prompts go through brain.service.ts
[ ] Role check blocks wrong-mode prompts
[ ] Guardrails flag inappropriate questions
[ ] Student context saved and injected into prompts

FINAL INTEGRATION
[ ] App runs end-to-end: upload → AI → lesson → quiz → score → analytics
[ ] Offline mode tested: airplane mode → open lesson → take quiz → reconnect → syncs
[ ] Voice tested: press play → lesson reads aloud
[ ] Both teacher and student flows complete
```

---

## 🚀 HOW TO USE THESE PROMPTS

1. Open **Claude.ai** or any AI assistant
2. Paste the prompt **exactly as written** — do not summarize it
3. Copy the code it gives you **exactly** into the specified file
4. Run the app after each module — fix errors before moving to the next
5. If you get an error, paste it back to Claude and say:
   `"I got this error after following your code: [paste error]"`

**Pro tip:** Do one prompt at a time. Do not paste multiple prompts together.

---

*Wrenly AI — Built for the Philippine Learning Crisis*
*Stack: Expo · Supabase · Gemma 3 (free, on-device)*