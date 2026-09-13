# Thai planetary-deva art and UI review

**Review date:** 2026-09-13  
**Verdict:** PASS — production-ready for the current symbolic-reading experience  
**Overall score:** **9.0/10**

## Scope and evidence

This is an independent read-only review of the corrected Thai planetary-deva atlas and its use in the 108-year reading flow. Evidence reviewed:

- `frontend/public/assets/planet-devas-thai-v2.png` (1774×887 PNG)
- `frontend/src/components/SolarianJourney.tsx`
- `frontend/src/solarian-journey.css`
- `frontend/public/assets/MYTHICAL-ART.md`
- `frontend/public/assets/THAI-DEVA-V2-PROMPT.md`
- `docs/reviews/screenshots/thai-deva-desktop.png` (1280×720)
- `docs/reviews/screenshots/thai-deva-mobile.png` (390×844)
- `docs/reviews/screenshots/thai-deva-legend.png` (1280×720)
- Final production frontend build (`tsc -b && vite build`), which passed on 2026-09-13

## Scorecard

| Area | Score | Review |
|---|---:|---|
| Art direction and finish | **9.3/10** | The eight panels have a coherent painterly Thai celestial style, refined adult figures, strong focal hierarchy, clear motifs, and a consistent ivory-and-gold field. The result reads as commissioned editorial art rather than stock iconography. |
| User-specified mapping | **9.6/10** | The UI maps Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn/Rahu to red/yellow/pink/green/orange/sky blue/purple/black and to the requested lion, angels, buffalo, elephant, hermits, white bull, tiger, and khomot-head motifs. Text preserves the exact powers 6, 15, 8, 17, 19, 21, 10, and 12, totaling 108. |
| Cultural and historical honesty | **9.2/10** | Copy repeatedly scopes the material as “the story used in the app.” It says the reflective kusolobai is the app’s interpretation and explicitly avoids claiming scripture or a single canonical standard. Provenance notes likewise call the painting an original artistic interpretation. |
| Information design | **8.9/10** | The selected ruler gets a compact image, origin, power, weekday color, story-cloth color, and reflection. The full eight-ruler legend is progressively disclosed, so the main reading remains usable while detail stays available. Weekday color and story-cloth color are separated instead of conflated. |
| Responsive layout | **8.8/10** | The desktop two-column reading is balanced and the 390-pixel view collapses cleanly without horizontal overflow. The 108-pixel mobile portrait remains legible and the fact rows reflow to one column. |
| Accessibility and semantics | **8.7/10** | Decorative atlas crops are hidden from assistive technology while adjacent labels provide the meaning. Color is always paired with text. Disclosure targets are at least 48 pixels high, and the legend changes from two columns to one on narrow screens. |
| Brand and color handling | **9.1/10** | The surrounding interface stays cream, gold, and jade. The user-authorized Rahu black appears in the Rahu painting and labeled swatch without spreading into large UI surfaces or weakening the warm Material visual system. |
| Performance and maintainability | **8.1/10** | One atlas keeps ordering and style consistent, and the real uneven horizontal divider is documented and accommodated by the crop math. The 2.8 MB PNG is the main remaining cost; a later WebP/AVIF export or responsive per-panel crops would reduce transfer size without changing the design. |

## Content integrity findings

The final UI carries the exact origin and power labels:

| Ruler | Origin shown | Power | Weekday color | Story-cloth color |
|---|---|---:|---|---|
| Sun | ราชสีห์ 6 ตัว | 6 | แดง | แดง |
| Moon | นางฟ้า 15 นาง | 15 | เหลือง | ขาวนวล |
| Mars | กระบือ 8 ตัว | 8 | ชมพู | ชมพูแดง |
| Mercury | ช้าง 17 เชือก | 17 | เขียว | เขียวใบไม้ |
| Jupiter | พระฤาษี 19 องค์ | 19 | ส้ม | แสด/เหลือง |
| Venus | โคอุสุภราชสีขาว 21 ตัว | 21 | ฟ้า | ฟ้า/คราม |
| Saturn | เสือ 10 ตัว | 10 | ม่วง | ดำคล้ำ |
| Rahu | หัวผีโขมด 12 หัว | 12 | ดำ | ทองสำริด/หมอกมัว |

The painted motifs are intentionally illustrative rather than a literal census of every animal or figure. The adjacent text is the authoritative count, and the asset documentation states this plainly. This is the right choice at the displayed portrait size.

Ketu is clearly scoped as a separate central figure associated with nine nagas in the app’s story and is explicitly excluded from this eight-ruler, 108-year set. The note also says the display does not change the calculation engine. This avoids implying that Ketu is a ninth ruler in the cycle.

The reflections are labeled “กุศโลบาย: ข้อคิดชวนทบทวน (การตีความของแอป).” Their wording is reflective and practical, with no deterministic prediction or claim of scriptural authority.

## Visual findings

The corrected atlas makes each ruler immediately distinguishable through both dominant garment color and foreground motif. The white bull reads separately from Mars’s dark buffalo; Saturn’s tiger is unmistakable; Rahu’s black armor, eclipse orb, smoky bronze field, and surrounding khomot heads form a strong finale without gore. The upper and lower source rows have unequal heights, but the UI’s crop geometry keeps crowns, faces, and motifs intact in both tested layouts.

On desktop, the deity card anchors the long-term context without overpowering the trigger panel. On mobile, the portrait, ruler name, and source facts form one readable vertical story. Cream surfaces, restrained outlines, gold washes, and jade reflection panels maintain the established Solarian Material language.

## Limits and release recommendation

This review verifies the requested mapping, product wording, visual quality, semantics, responsive behavior, and build integrity. It does not authenticate the creation story as a historical or canonical Thai source. The product correctly avoids making that claim. If a future version presents this material as cultural history rather than an app-specific symbolic story, it should add a named source and expert review.

No blocking issue remains. The current implementation clears the requested 8/10 threshold in every scored area and is suitable for release. The only meaningful follow-up is image delivery optimization; it does not block the experience or alter the content verdict.
