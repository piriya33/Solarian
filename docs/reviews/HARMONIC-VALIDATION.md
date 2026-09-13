# Harmonic connected release validation — 2026-09-13

Local app: http://localhost:8000/. Frontend build passed; final backend suite: **26 passed, 2 warnings**. Tests ran with a separate SQLite database and no AI API key.

## Changes

- Kept the user's modulo-30 trigger engine and its rounding/zero-distance conventions. Interpretation now includes every hit in `degree_trigger_details`; the singular field remains a compatibility alias.
- Each interpretation binds macro ruler, target planet/house, natal degrees, modulo distance, exact symbolic age, cycle, and rounded year bucket to a planning question and practical follow-up.
- No-hit years are explicitly neutral with respect to this method. Unknown houses and unsupported Thaksa pairs are not invented. Adjacent legacy interpretation wording was softened where it implied guaranteed outcomes.
- AI context preparation retains all natal Sun aspects and the complete harmonic catalog, plus current-year hits; removed the fixed 2026 context year. No live AI call was made and the new interface does not activate AI consultation.
- PDF catalog includes all tracked bodies rather than the first eight, with fractional age → rounded bucket and a symbolic-method explanation.
- Generated and integrated original 8-planet and 12-zodiac painterly atlases. Prompts and mapping are in `frontend/public/assets/MYTHICAL-ART.md`.
- New local journal entries preserve the harmonic method identifier and every selected-year hit's name/age. Existing notes remain readable.

## Browser checks

Synthetic birth profile 1985-01-13, 09:45, Bangkok:

- Age 41: Mercury macro context, Chiron distance 10.84°, exact age 40.84, bucket 41, house 3. Source disclosure showed Sun 22.86° → Chiron 3.70° within modulo 30.
- Age 3: both Saturn 2.95 and True Node 2.82 displayed; filtering Saturn hid the other card and All restored both.
- Age 0: truthful no-hit message.
- Journal saved both age-3 hits with their exact ages. The synthetic QA note was then removed.
- At 390px, document width stayed 390px. New age input has a stable accessible name; macro-period buttons announce planetary names and age spans.
- PDF endpoint returned HTTP 200, 37,144 bytes after the harmonic catalog update.

Screenshots: `screenshots/harmonic-desktop.png`, `harmonic-mobile.png`, `harmonic-sun-art.png`. Independent scoring is in `harmonic-connected.md` and applies to this local interface, not a production hosting/security certification.

## Remaining boundaries

Birth-time and UTC/DST accuracy still depend on user-confirmed inputs. This symbolic progression is separate from real birthday transit snapshots. Native mobile distribution, daily forecast, Bazi, relationship/company analysis and Lightning payment remain future work. Generated art is currently delivered as PNG atlases; web image optimization is a future performance improvement before wider mobile rollout.
