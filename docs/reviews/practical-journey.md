# Practical journey independent review

**Review date:** 2026-09-13  
**Verdict:** **PASS — 8.9/10**, with no critical blocker  
**Release bar:** every scored area is at least 8/10

## Scope

This review covers the post-calculation journey that now combines two levels:

1. a quick read in the order **Today → This year → This period → Identity**; and
2. the full 108-year explorer, selected-year harmonic detail, Sun evidence, and planning journal immediately below it.

The review inspected the final frontend and backend source, the real API output for the 1985-01-13 09:45 Bangkok fixture at reference date 2026-09-13, automated tests, the production build, and the supplied desktop visual frame. The screenshot validates the component's spacing, hierarchy, and surface treatment; the final tab order was verified in source after that capture and does not alter the layout.

## Scorecard

| Area | Score | Finding |
|---|---:|---|
| Entry hierarchy | **9.1/10** | The first calculated content is a four-view practical read. The full 108-year map remains directly below instead of being hidden behind an expert mode, preserving the requested overview and year-by-year dashboard. |
| Everyday Thai and comprehension | **8.5/10** | Visible titles and summaries avoid `ราศี`, `เรือน`, `orb`, `30°`, and `ดาวจร`. Technical terms appear only in the optional source disclosure and the full dashboard. The current-period explanation is still denser than the other three views, but remains understandable Thai rather than specialist shorthand. |
| Personal specificity and interpretive depth | **9.4/10** | Guidance is materially derived from the person's actual placements, signs, occupied houses, cusp-derived house ownership, sign dispositors, occupied-house rulers, dignity, natal aspects, major/sub-ruler relationship, and every harmonic hit. Tests prove relationship and aspect changes alter visible advice. |
| Time accuracy and scope honesty | **9.5/10** | Today uses real transits calculated for the explicit `reference_date`, including fast bodies, at a disclosed 12:00 Bangkok snapshot. This period exposes both the exact main-period span and current sub-period span. This year is labeled as an age-based symbolic review and explicitly says it is not a continuous forecast. |
| Practical actionability | **8.8/10** | Every view supplies one to three `ควรทำ` and one to three `ควรเลี่ยง` items. Actions name concrete checks such as milestones, owners, dates, boundaries, evidence, and review criteria. They do not become financial buy/sell instructions or outcome guarantees. |
| Evidence transparency | **9.3/10** | Each card has a collapsed source list. Deep evidence retains dates, aspects, pair status, sign/house placement, and actual cusp-ruled houses. Missing relationships remain `unknown`; the system does not invent friendly or hostile pairs. |
| 108-year and harmonic continuity | **9.2/10** | The full 0–108 selector, major ruler, sub-ruler, annual ruler, all harmonic collisions, exact symbolic ages, source degrees, Sun aspects, and detailed interpretation remain available in the same flow. Quick guidance adds an entry path without replacing the dashboard. |
| Visual hierarchy and brand | **9.0/10** | Cream, gold, jade, coral, rounded Material surfaces, restrained elevation, and the existing painted art remain coherent. The selected tab, date chip, summary, and paired do/avoid panels create a clear scan path. |
| Responsive and accessible interaction | **8.4/10** | Final source uses semantic tabs and tabpanel relationships, roving tab focus with arrow/Home/End keys, 48-pixel tab targets, visible focus, and text labels for every state. At narrow width, tabs become a 2×2 grid and action panels stack. Final source and build were verified; a new post-reorder mobile screenshot was not supplied for this review. |
| Production readiness | **8.2/10** | Backend suite passes 35 tests and the frontend production build passes. The calculated response for the reviewed fixture is about 4.7 MB, dominated by the existing 109-year timeline; the added context increases depth but makes payload reduction a worthwhile follow-up. |

## What now works

### The quick read is a useful front door

The final tab order is `วันนี้`, `ปีนี้`, `ช่วงนี้`, `ตัวตน`. Each view keeps the same visual grammar:

- a clearly labeled date or span;
- one interpretation summary;
- up to three actions;
- up to three cautions; and
- a collapsed “ดูที่มาของคำแนะนำ” disclosure.

For the reviewed fixture, Today says that the user can test a small step in work and watch the real response. The source reveals that this came from the actual 13 September 2026 Bangkok-noon transit snapshot. The summary itself does not ask a beginner to understand the planet, aspect, or orb first.

### The advice is genuinely chart-specific

The current-period result does more than attach a generic planet paragraph. It combines:

- the major ruler's actual Capricorn placement in house 10;
- the topics of houses 4 and 7, which that planet rules from the real cusp signs;
- its sign dispositor and the ruler of its occupied house;
- dignity and a natal Mercury–Neptune relationship;
- the current sub-ruler's own placement and cusp ownership; and
- the known or unknown relationship between major and sub rulers.

The resulting visible action asks the user to break a long goal into milestones with owners and dates, then check how a work decision affects home and agreements. This is a defensible synthesis of the supplied chart context rather than a template with the person's planet name inserted.

The harmonic year card preserves every collision. Each hit receives its own full planetary context, including its relationship with the Sun, ruled houses from actual cusps, dispositor links, occupied-house ruler, and natal aspects in either body order. A test changes the natal aspect and verifies that the visible action changes with it.

### The time meanings are separated correctly

- **Today** is a dated one-time snapshot at 12:00 Bangkok, not the birth anniversary and not a claim about every hour of the day.
- **This year** is the completed-age row at the reference date. The UI states that harmonic topics are symbolic age markers, not continuous forecasts or event dates.
- **This period** is the current major 108-year period, with its full start/end dates. The current sub-period is separately retained with its own start/end dates and is named in the explanation.
- **Identity** uses natal Sun, Moon, Ascendant, and the actual house-1 ruler. It does not borrow a transit or annual ruler.

Dates in visible Thai labels use Buddhist years consistently. The API still preserves ISO dates for inspection and state storage.

### The full analysis remains available

The final layout places the 108-year explorer immediately after the quick read. The user can still move through all 109 age rows, see the three ruler layers, inspect the Sun and all Sun aspects, view every harmonic hit, and read the source method. The journal follows the analysis and stores the correct context for the selected quick-read view:

- Today and Identity do not attach age-period rulers;
- This period stores the actual major ruler;
- This year stores major, sub, annual, and harmonic context from the reference-age row; and
- manually exploring another age does not silently overwrite the quick-read reference context.

## Trust boundaries

The feature is deterministic rule-based synthesis. It does not activate or call a live AI model. Guidance asks the user to test observations against actual results and avoids promises, guaranteed events, or guaranteed investment returns.

The relationship layer reports an explicit rule when one exists. When no rule exists, it says so and falls back to context and observed results. House rulership is derived from all twelve actual cusp signs with the declared traditional sign-ruler table. Partial or missing cusp data is marked unknown rather than silently replaced.

## Nonblocking follow-ups

The current-period summary is substantially longer than the other three summaries because it carries the deepest synthesis. A later copy pass could split it into `ภาพหลัก`, `แรงสนับสนุน`, and `จุดที่ต้องตรวจ` while keeping the same evidence. The semicolon-combined actions are specific but can also become long on a phone; limiting the quick layer to one main clause and moving the second clause into the source disclosure would improve scan speed.

The reviewed full API response is about 4.7 MB. Most of that is the pre-existing 109-year timeline, but the richer per-year planetary context adds weight. A future endpoint split or lazy-loading of year details would improve mobile start time without changing the reading logic.

The Identity sample for this fixture ends with a broad phrase equivalent to “also consider the self.” Its actions and evidence are specific, so this is not misleading, but that last phrase could be replaced with the concrete house-1 theme in a later polish pass.

## Validation

- Backend: **35 tests passed**, including explicit reference date, fast-body daily transits, exact current periods, harmonic collisions, actual cusp ownership, dispositors, both natal-aspect directions, same-planet relationships, unknown relationships, and visible advice changes from pair/aspect changes.
- Frontend: TypeScript and Vite production build passed (`index-CGZe1m7P.css`, `index-BrYlQOCt.js`).
- API fixture: HTTP 200, all four cards populated, each with one to three actions and cautions, reference date 2026-09-13, and no expert vocabulary in visible title/summary.
- Visual frame: desktop component hierarchy and styling inspected at 1280×720.

## Release recommendation

Release this version for the pilot. It clears the 8/10 threshold in every reviewed area, has no critical UX or trust blocker, preserves the full 108-year dashboard, and adds a much more approachable first reading without flattening the astrology into generic advice.
