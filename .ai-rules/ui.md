# UI & UX GUIDELINES

## Visual Identity
- **Vibe:** Clean, accessible, minimal, similar to `shadcn/ui` but adapted for mobile.
- **Colors:** White backgrounds, dark navy text, soft "Fairy-Wren" blue accents, and high-contrast alert colors (warning yellow/red).

## Component Rules
1. **Accessibility First:** Tap targets must be large (minimum 44x44pt). Fonts must be highly legible and scale with device settings.
2. **Offline Transparency:** EVERY screen must check network state and display a non-intrusive "Offline Mode" indicator if the device is disconnected.
3. **NativeWind:** Use Tailwind utility classes for all styling. Do not use `StyleSheet.create` unless absolutely necessary for complex animations.
