# Harmonic reading connected review

Date: 2026-09-13  
Reviewer role: independent UX, content, and trust review  
Scope: the connected 30-degree Sun harmonic reading, its relationship to the 108-year map, practical planning, responsive presentation, and new planetary/zodiac art

## Verdict

**8.8/10 — passes the requested 8/10 release bar for the pilot.**

The feature now reads as one coherent path: the user chooses a year inside the 108-year map, sees the major-period context, inspects every symbolic degree hit assigned to that year, checks its source values, and converts the interpretation into a question and a bounded next step. The interface clearly separates the symbolic modulo-30 method from the real transit snapshot calculated on the birthday reference date.

No critical blocker remains in the harmonic journey. The main deductions concern dense reading length on a phone, some assertive wording that remains in older macro/dignity copy outside the new harmonic card, and one 108-year endpoint convention that should receive specialist confirmation before a broader public launch.

## Scorecard

| Area | Score | Finding |
|---|---:|---|
| Formula and source transparency | 9.2 | Shows the symbolic formula, cycle, source degrees, exact decimal age, rounded year bucket, and method limitation. |
| Multiple-hit and empty states | 9.4 | Preserves every collision, supports filtering without losing entries, and does not equate “no hit” with an uneventful year. |
| Macro-to-micro journey | 9.0 | Establishes 108-year context before the selected-year trigger, then separates the birthday transit snapshot and action journal. |
| Planning usefulness | 8.8 | Each hit supplies a question, two practical checks, and a decision check grounded in real evidence. |
| Trust and non-guaranteed outcomes | 8.5 | Harmonic copy is careful and explicit; a few older interpretation strings elsewhere remain more assertive than the new standard. |
| Visual system and art direction | 9.1 | Cream, gold, jade, and coral Material surfaces are cohesive; Thai-inspired painted devas and zodiac imagery feel intentional and contain no black UI treatment. |
| Responsive and accessible interaction | 8.5 | The 390px layout fits the viewport, controls meet the 44px target, states have text labels, decorative art is hidden from assistive technology, and details progressively disclose dense content. |
| Production readiness | 8.4 | Build and backend tests pass. The pilot is reviewable and stable; broader release would benefit from further copy editing and specialist validation of method boundaries. |

## What passed

### The method is represented honestly

- The reading calls this a **symbolic 30-degree progression**, not an observed solar transit or an empirically verified event.
- The method disclosure explains `(planet longitude - Sun longitude) mod 30`, a 30-year recurrence, and the current zero-distance convention.
- A value such as `40.84 years` is presented as a symbolic decimal age and as approximately `40 years 10 months`.
- The interface separately says that this value appears in the `age 41` slot because of the formula's rounding rule. It does not call 41 the exact event age.
- The birthday transit panel follows as a distinct section with a dated one-day reference and an explicit statement that it is not a whole-year forecast.

### Every calculated hit remains available

- Backend synthesis produces `degree_trigger_details` for every item in the selected year's `degree_triggers` array.
- The singular `degree_trigger_detail` remains only as a compatibility alias.
- The reviewed collision at age 3 displays both Saturn (`2.95`) and Rahu (`2.82`). Selecting the Saturn filter hides Rahu; selecting “all” restores both.
- The empty state explains that no rounded harmonic hit was assigned to that slot and that this does not imply a year without important events.

### The hierarchy supports planning

The page order is understandable without specialist guidance:

1. 108-year period map and selected year
2. natal Sun and all included Sun aspects
3. major-period context plus symbolic harmonic signals
4. real birthday-date transit snapshot
5. interpretation and planning journal

The harmonic card does more than name a planet. It gives the source age and distance, natal house context, relationship-rule status, a planning question, two practical actions, and a decision check. The actions ask the user to record current facts, goals, constraints, costs, downside, and a review date. This is appropriate for career, money, and investment planning without converting astrology into a buy/sell signal or guaranteed outcome.

### The visual direction is coherent

- The new section uses the existing cream canvas, gold macro layer, jade signal layer, warm raised cards, rounded Material surfaces, and restrained elevation.
- The UI does not introduce black surfaces or black text tokens.
- The planet-deva and zodiac atlases have a consistent hand-painted Thai celestial character. They are presented as artistic interpretation, not canonical religious iconography.
- The correct Capricorn sea-goat tile accompanies the reviewed natal Sun in Capricorn. The major-period Mercury tile uses the matching manuscript-and-stylus portrait.
- Art is decorative in the accessibility tree, while adjacent text carries the calculated meaning.

### Responsive and interaction checks passed

- The reviewed phone viewport remained 390px wide with a 390px document width and no horizontal overflow.
- Major-period detail can collapse, limiting the amount of text shown before the trigger card.
- Trigger filters wrap, have explicit pressed states, and use text in addition to symbols.
- Buttons and disclosure summaries use at least 44px interaction height.
- The year input has an accessible name, and the page retains semantic regions, headings, lists, terms, and definitions.

## Remaining limitations

### Older interpretation copy is still more forceful than the harmonic standard

The most causal phrases were softened during this review. Some older strings outside the harmonic card still use language such as “golden opportunity,” “significant driving force,” “strongest success in later life,” or similarly certain dignity metaphors. They are framed by disclaimers, but the next content pass should rewrite them as possibilities, reflection prompts, or conditions. A nearby disclaimer should support careful claims rather than compensate for deterministic prose.

This is not a blocker for the current harmonic pilot because the new harmonic copy consistently says it is a framework and asks for real-world evidence. It is a material follow-up before presenting the entire interpretation engine as evidence-grounded public guidance.

### Mobile reading length remains high

A complete trigger card is long because it contains source data, interpretation, planning prompts, and safeguards. The typography and spacing remain readable, and progressive disclosure reduces the initial load. Future iteration could collapse the long narrative by default while keeping the symbolic age, source values, planning question, and first action visible.

### The age-108 boundary follows a rounded-slot convention

The engine currently includes a symbolic exact age slightly above 108 when rounding assigns it to the age-108 slot. This is internally consistent with the current year-bucket rule and is disclosed as a rounded grouping, but a domain specialist should confirm whether the 108-year boundary is intended to use exact age or rounded slot membership.

### The artwork is interpretive

The generated devas and zodiac paintings are original UI art inspired by Thai celestial and Ramakien visual language. They should continue to be described as artistic interpretations. Planet labels and calculated data must remain the source of meaning, especially for bodies without a matching atlas tile.

## Validation evidence

- Backend suite: **26 passed** (`python3 -m pytest backend/tests -q`)
- Frontend production build: **passed** (`npm run build`)
- Reviewed exact-age example: Sun `22.86°` to Chiron `3.70°` gives `10.84°`; cycle 2 yields symbolic age `40.84`, displayed in rounded slot 41.
- Reviewed collision: age 3 retained Saturn `2.95` and Rahu `2.82`, including filter and restore behavior.
- Reviewed empty state: age 0 did not invent a trigger or claim the year would be uneventful.
- Reviewed responsive screenshots:
  - `docs/reviews/screenshots/harmonic-desktop.png`
  - `docs/reviews/screenshots/harmonic-mobile.png`
  - `docs/reviews/screenshots/harmonic-sun-art.png`

## Release recommendation

Use this implementation for the class pilot. It meets the requested connected-reading, visual, and practical-planning goal, while exposing enough method detail for users to distinguish symbolic interpretation from calculated transit evidence. Keep the remaining legacy-copy cleanup and the age-108 convention review on the next release checklist.
