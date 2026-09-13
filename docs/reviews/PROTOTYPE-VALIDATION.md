# Prototype validation · 13 September 2026

Scope: standalone `design-preview`, not the React/FastAPI application. No deployment or live AI requests. Browser interaction checks, not evidence of astrology or investment forecasting accuracy.

- Material hero inspected at 1440px and 390px; original generated Phiphek-inspired artwork, warm colored surfaces and shadows. No black design tokens; native calendar icon filtered to warm color, age spinner removed.
- Atlas viewport document width equals viewport at 390px and 360px. Horizon strip scrolls within its container.
- Horizon/focus persist in URL after reload. Date input and return-to-today update reference labels.
- Slider ArrowRight changes age 40 to 41; next-year button changes to 42. Direct focused age entry 108 disables next, 0 disables previous. Range has step 1, label and age value text. Age is retained in URL.
- Plan save prevents duplicate entries. Delete followed by undo restores the entry. Saved journal entry survived reload in earlier checks.
- Unknown birth time disables time entry and removes required validation. Escape closes native dialog and returns focus to opener.
- Follow-up draft context includes selected horizon, topic, age for the life view, and reference date. DOM confirmed age 42 and 13 September 2026 after context update.
- JavaScript syntax check passed after final context update.

Native input automation required clicking the age field before filling and blurring it; early attempts without focus did not commit a value and were not counted as passes. One undo attempt occurred after its timeout and was not counted; immediate delete/undo was rerun successfully.

Screenshots with prefix `material-` are the current design. Earlier unprefixed screenshots and parchment review scores are historical. Files are viewport captures; lower-section captures intentionally omit the header. Reviewers separately record acceptance in `design-v2.md` and `journey-v2.md`.

Limits: not a device-lab or screen-reader certification; no touch-drag test on physical phone, backend integration, real AI analysis, auth, production load, or deployment was performed in this prototype validation.
