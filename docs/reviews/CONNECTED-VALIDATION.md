# Connected local application validation — 2026-09-13

The Material interface now runs in the actual React application at http://localhost:8000/, backed by FastAPI. The separate port 8766 preview is not the connected application.

## Verified

- Frontend production build succeeds. Backend suite: 20 passed, 2 warnings, using a separate SQLite test database and an empty AI API key.
- Browser guest flow: explicitly entered synthetic 2000-02-29, 12:00, Bangkok. Actual API calculation returned 109 ages (0–108), Sun Pisces 9°54′47″, house 10, and all seven natal Sun aspects. Next-year, direct age 108, and return-to-current-age controls changed the actual selected data.
- Non-leap annual birthday samples use February 28 and expose the actual reference date. The UI identifies these as one birthday snapshot, not a daily forecast or a whole-year scan.
- Journal save, delete, and undo worked with profile name, age, calendar year, Sun and ruler context. The synthetic journal entry on the main local origin was removed after testing. Journals remain browser-local.
- Account testing used a separate server/database on port 8001: registration saved Profile A, refresh restored account/profile and selected age 27; calculation and save of Profile B reset to its current age 25; selecting A restored A's calculation and current age 26. The user's account database was not used for these registration tests.
- At 390px, both the plan and advanced chart pages had document scroll width 390px. The natal wheel measured 328×328px. Wide tables scroll internally.
- The current port 8000 PDF endpoint returned HTTP 200, 36,603 bytes, a five-page PDF for the synthetic leap-day profile. An older isolated process initially returned an undefined-variable error; the current source and reloaded application succeeded. This validates export functionality, not a new visual redesign of the PDF.

## Scope

Removed prototype wording from primary actions; supplied real calculation/profile persistence, Sun-first evidence, a 108-year selector, rule-based interpretation, and local journal interactions. AI consultation, Bazi integration, relationship/company analysis and monetization remain unavailable in this interface. No paid AI calls or public deployment were performed.

The design review is recorded separately in `connected-design.md`. Its acceptance applies to the connected local interface. Public-hosting security and operational readiness remain separate work described in `../CLASS-PILOT-ARCHITECTURE.md`.

Legacy profiles now carry a completeness marker when stored fields are missing. Historical records already populated with defaults cannot retrospectively be distinguished from user-confirmed values. Birth location/time and UTC offset remain visible for user verification; historical DST is not automatically resolved.
