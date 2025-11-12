# Loop4U – Changelog (work‑in‑progress)

## 2025-11-12

- Settings page stabilized and rebuilt safely:
  - Restored missing class methods: readTheme, parseICS, splitIcsDate, clearLocalData, clearAllData, editCategory, saveCategory, resetCategoryForm, preview helpers.
  - Fixed broken template endings and removed mojibake strings in TS alerts.
  - Categories: added color grid selector (no text input), using colorOptions; kept bgColorClass sanitizer.
  - Default emoji for categories: uses 🏷️ when empty; also applied on import when creating missing categories.
  - “Sobre la app” moved to the end in a bordered card.
- Reminder form UX:
  - Priority dot rendered inside the select (overlay) and fixed class binding for pr-8.
  - Category select shows the category emoji in each option.
- Tailwind safelist:
  - Added bg-* entries for the color grid (400/500 hues and greys) to avoid empty swatches.

## 2025-11-11

- Calendar: added “Crear recordatorio” CTA at the end of the day’s list (and in empty state) passing ?date=YYYY-MM-DD.
- Docs: recorded decisions and fixes in docs/codex.md (now complemented by this changelog).

Notes
- Prefer entities/ASCII in TS strings (alerts, confirms) and use HTML entities in templates to avoid encoding regressions.
- After changing tailwind.config.js, restart the dev server so the new safelist is picked up.
