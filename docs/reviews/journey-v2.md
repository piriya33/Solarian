# Solarian Journey V2 — Product UX Audit และข้อเสนอสำหรับ Student Pilot

วันที่ตรวจ: 13 กันยายน 2026  
ขอบเขต: ตรวจแบบ read-only จาก source ปัจจุบันใน `frontend/src`, `backend/main.py` และ `backend/engine`; ไม่ได้เปลี่ยน app source และไม่ได้รับรองพฤติกรรมจาก production build  
โจทย์ล่าสุดที่ใช้ตัดสิน: หยุดการเก็บเงินทั้งหมดในช่วง pilot, นักเรียนเรียนรู้ Astrology for investment planning, ใช้งานจริงได้ตั้งแต่ daily ถึง 108 ปี, วิเคราะห์ macro-to-micro โดยให้ Sun และ aspects-to-Sun สำคัญที่สุด, Bazi เป็น optional experimental, แยกบุคคล/คู่ชีวิต/หุ้นส่วนธุรกิจ/บริษัท และเก็บ mobile เป็นงานอนาคต

## Executive decision

**สถานะปัจจุบัน: ไม่ผ่าน pilot gate — 3.6/10 และมี 5 critical issues**

ฐานคำนวณและองค์ประกอบสำคัญมีอยู่มากกว่าที่ UI เปิดให้ใช้: natal chart, aspects, transits รายวัน, annual map และ timeline 108 ปี แต่ journey ปัจจุบันจัดผลิตภัณฑ์ตามโหมดทางเทคนิค (`Companion / Pro / Bazi / AI`) แทนงานวางแผนของนักเรียน จึงยังไม่ทำให้ผู้ใช้เดินจาก “วันนี้ควรเรียนรู้อะไร” ไปสู่ “บริบทระยะยาวคืออะไร” ได้เป็นระบบ

ทิศทางที่แนะนำคือเปลี่ยนหน้าแรกเป็น **Planning Workspace** ซึ่งมีตัวเลือกช่วงเวลาเป็นแกนเดียว แล้วแสดงคำตอบ 4 ชั้นในลำดับคงที่: **Macro climate → Solar core → Supporting signals → Learning action** โดยให้ Bazi อยู่ในห้องทดลองที่ผู้ใช้เปิดเองเท่านั้น และถอดทุกองค์ประกอบราคา แพ็กเกจ การอัปเกรด และ paywall ออกจาก pilot

## สิ่งที่พบจากโค้ดจริง (Observed)

### O1 — เส้นทางหลักเริ่มด้วยข้อมูลตัวอย่างและโหมดของระบบ

- เมื่อไม่มีบัญชี ระบบคำนวณ preset โดยอัตโนมัติจากวันเกิด `1985-01-13 09:45` ที่กรุงเทพฯ (`frontend/src/App.tsx:85-95`, `:158-161`) ก่อนผู้ใช้ระบุว่าเป็นข้อมูลของตนเองหรือเป็นตัวอย่าง ผู้ใช้ใหม่จึงมีโอกาสเข้าใจผิดว่าผลที่เห็นเป็น onboarding หรือผลเฉพาะตน
- Navigation หลักเป็น 4 ปุ่มระดับเดียวกัน: เข้าใจง่าย, มืออาชีพ, ปาจื่อ และ AI (`frontend/src/App.tsx:354-407`) สิ่งนี้บังคับให้นักเรียนเลือก “เครื่องมือ” ก่อนรู้ว่าจะวางแผนเรื่องใดหรือช่วงเวลาใด
- แบบฟอร์มแสดงศัพท์เทคนิคและพิกัดตั้งแต่ต้น เช่น Placidus, JPL DE431, latitude, longitude และ UTC offset (`frontend/src/components/BirthInputForm.tsx:156-162`, `:311-342`) แม้ข้อมูลเหล่านี้ควรอยู่ใน Advanced settings
- ส่วนที่ดีและควรเก็บ: มี visible labels, loading state, profile selector, collapse summary และ PDF export (`BirthInputForm.tsx:92-140`, `:179-237`, `:241-363`)

### O2 — โครงเวลาไม่ครอบคลุม daily ถึง 108 ปีใน journey เดียว

- หน้าเข้าใจง่ายคำนวณ “วัยปัจจุบัน” จากปีปฏิทินลบปีเกิด และแสดง current chapter รายปี (`frontend/src/components/SimpleReadingView.tsx:37-48`, `:219-340`) ไม่มีตัวเลือกวัน สัปดาห์ เดือน หรือ drill-down
- หน้า 108 ปีมี slider อายุ 0–108 และ quick jumps (`frontend/src/components/LifeMap108.tsx:132-163`) แต่เริ่มที่อายุ 40 เสมอ (`:10-20`) ไม่ใช่อายุปัจจุบันของเจ้าชะตา และไม่มี Today shortcut
- Backend มีเครื่องมือคำนวณ transit ตามวันที่อยู่แล้ว (`backend/engine/transits.py:32-108`) แต่หน้าเว็บใช้การ sample วันเกิดของแต่ละปีเพื่อสร้าง annual map (`backend/engine/transits.py:201-233`) จึงยังไม่เกิด daily planning journey
- ช่วงเวลา 108 ปีทำงานแยกจาก current chapter ผู้ใช้ไม่สามารถเลือกช่วงใหญ่แล้ว drill ลงปี → เดือน → วันโดยรักษาบริบทเดิม

### O3 — ลำดับ macro-to-micro ยังไม่ให้ Sun และ aspects-to-Sun เป็นศูนย์กลาง

- หน้าเข้าใจง่ายวาง Sun, Moon และ Ascendant เป็นการ์ดขนาดเท่ากันใน “Core Trinity” (`frontend/src/components/SimpleReadingView.tsx:119-217`) แล้วข้ามไป current chapter โดยไม่มีส่วน aspects-to-Sun
- หน้า Pro แสดง summary 6 ช่องที่ Sun เป็นหนึ่งช่องเท่ากับ Sunrise, Ascendant, Moon และ MC (`frontend/src/App.tsx:680-743`)
- Aspect analyzer เริ่มด้วย `all`, ขยายการ์ดแรก และกรองตาม orb/aspect type (`frontend/src/components/AspectGrid.tsx:19-44`, `:150-219`) ไม่ได้เริ่มจาก Sun และไม่มีกลุ่ม “มุมที่กระทบดวงอาทิตย์”
- Backend เรียง aspect ทั้งหมดด้วย potency (`backend/engine/interpretation.py:575-699`) ส่วน AI เลือก 4 รายการแรก (`backend/engine/ai_counselor.py:58-63`) จึงไม่มีหลักประกันว่า aspects-to-Sun จะได้รับความสำคัญก่อน
- จุดแข็งที่ควรต่อยอด: Life Map ระบุ macro ruler → sub-period → annual/transit ไว้ชัด (`LifeMap108.tsx:165-327`) และ engine มี Sun-specific transit descriptions บางส่วน (`backend/engine/transits.py:113-153`)

### O4 — Bazi เป็นแกนบังคับ ทั้งที่โจทย์ให้เป็น optional experiment

- Bazi เป็น top-level mode เท่ากับ journey หลัก (`frontend/src/App.tsx:382-393`)
- ข้อความ AI สื่อว่าผสาน 3 ศาสตร์เป็นค่าเริ่มต้น (`frontend/src/components/AICounselorView.tsx:264-269`)
- Backend คำนวณ Bazi ทุกครั้งทั้ง chart และ AI และส่งเข้า context (`backend/main.py:132-145`, `:651-669`, `:735-752`); persona บังคับ cross-discipline synthesis (`backend/engine/ai_counselor.py:17-26`)
- ค่า gender สำหรับ Bazi ถูกส่งเป็น `"m"` แบบคงที่ใน flow คำนวณ (`backend/main.py:141`, `:659`, `:743`) ทำให้ผล experimental ไม่ควรถูกนำไปปนกับผลหลักโดยไม่บอกผู้ใช้

### O5 — ประเภทบุคคล/ความสัมพันธ์มีแค่ field หลังบ้าน ยังไม่มี journey แยก

- Data model มี `relationship` แบบทั่วไป เช่น self, spouse, partner, client (`backend/models.py:44-55`) และ API รองรับ field นี้ (`backend/main.py:350-384`, `:412-463`)
- UI บันทึก profile ใหม่โดยไม่ถามประเภทความสัมพันธ์ (`BirthInputForm.tsx:211-234`) และคำสั่งบันทึกจากเมนูบังคับ `relationship: "other"` (`frontend/src/App.tsx:310-320`)
- แอปคำนวณ chart ได้ครั้งละ profile เดียว ไม่มี synastry/composite, partner-role context หรือ company incorporation schema ดังนั้น “คู่ชีวิต”, “หุ้นส่วนธุรกิจ” และ “บริษัท” ยังเป็นเพียงชื่อ profile ที่อาจถูกตีความเหมือนบุคคลเดียว

### O6 — Pilot ยังมี monetization surfaces และเส้นทางอัปเกรดที่ทำงานได้

- เมนูบัญชีมี “แพ็กเกจสมาชิก” (`frontend/src/App.tsx:547-557`) และ mount paywall modal เสมอ (`:804-813`)
- AI แสดงสถานะโควตา, ปุ่มอัปเกรด, “สมัครสมาชิกพรีเมียม” และ paywall notice (`frontend/src/components/AICounselorView.tsx:228-281`, `:300-323`)
- Modal แสดง Premium ฿290/เดือนและ Pro plan และเรียก endpoint upgrade simulation (`frontend/src/components/AIPaywallModal.tsx:34-65`, `:111-180`)
- Endpoint เปลี่ยน tier ในฐานข้อมูลได้โดยไม่ตรวจ payment (`backend/main.py:586-605`) และ AI ยัง gate จาก tier/query count (`backend/main.py:633-649`, `:718-733`)
- แม้ไม่ได้รับเงินจริง ประสบการณ์นี้ขัดกับข้อกำหนด “พักการเก็บเงินทั้งหมด” และทำให้ผู้ใช้ pilot เข้าใจว่าต้องซื้อเพื่อเรียนต่อ

### O7 — Accessibility และ responsive contract ยังไม่พร้อมเป็น baseline

- `html` ระบุ `lang="en"` ทั้งที่เนื้อหาหลักเป็นภาษาไทย (`frontend/index.html:2`)
- Mode switch เป็นปุ่มทั่วไป ไม่มี tab semantics, `aria-selected` หรือ keyboard tab behavior (`frontend/src/App.tsx:354-407`)
- Slider 108 ปีไม่มี accessible label หรือ value text (`frontend/src/components/LifeMap108.tsx:132-142`)
- Aspect cards ใช้ clickable `div` และ clickable nested `div` (`frontend/src/components/AspectGrid.tsx:233-284`) จึงใช้งานผ่าน keyboard ไม่ครบ
- Modal หลักไม่มี `role="dialog"`, `aria-modal`, focus trap หรือการคืน focus; ปุ่มปิดบางจุดไม่มี accessible name (`frontend/src/components/AIPaywallModal.tsx:67-85`; pattern เดียวกันพบใน auth/AI key modal)
- หลายข้อความอยู่ที่ 10–12px และ input หลักใช้ `outline-none` โดยมีเพียง border-color เป็น focus indicator (`BirthInputForm.tsx:241-342`)
- `body { overflow-x: hidden; }` (`frontend/src/index.css:43-48`) อาจซ่อนอาการ overflow แทนการรับประกัน reflow; header มี logo, four-mode control และ account actions ในแถวเดียว (`frontend/src/App.tsx:337-410`)
- จุดแข็ง: viewport meta ถูกต้อง, layout ใช้ responsive grid หลายจุด, icon set หลักเป็น Lucide และมี light/dark tokens (`frontend/index.html:6`; `frontend/src/index.css:5-40`)

## Critical issues ที่ต้องเป็นศูนย์ก่อน pilot

| ID | Critical issue | เหตุผลที่เป็น blocker | เกณฑ์ปิด |
|---|---|---|---|
| C1 | ยังมีราคา แพ็กเกจ paywall และ upgrade simulation | ขัดกับ pilot policy โดยตรงและรบกวนการเรียน | ไม่มีข้อความราคา/ซื้อ/อัปเกรดใน user journey, ไม่มีการเรียก upgrade endpoint, ทุก pilot feature ที่อนุญาตเปิดด้วย pilot entitlement |
| C2 | ไม่มี daily → 108-year journey เดียว | Core job ไม่สำเร็จ ผู้ใช้ทำได้เพียง annual/current-year และ age slider | เลือก Today, 7/30 วัน, 1 ปี, หลายปี และ 108 ปีได้; drill-down รักษา profile/purpose/selection |
| C3 | Sun และ aspects-to-Sun ไม่ได้มาก่อนปัจจัยรอง | ขัดกับ analytic model และเสี่ยงให้ผู้ใช้ตีความน้ำหนักผิด | ทุก horizon แสดง Macro ก่อน แล้ว Solar core + aspects-to-Sun ก่อน supporting signals; test fixture ยืนยันลำดับ |
| C4 | Bazi ถูกผสานอัตโนมัติ | ผล experimental ปนกับแกนหลักและมี silent gender default | ค่าเริ่มต้นปิด, มี Experimental label/consent, ไม่คำนวณหรือส่งเข้า AI context จนกว่าจะ opt in |
| C5 | Couple / business partner / company ไม่ได้แยก semantics | ผลลัพธ์แบบบุคคลเดียวอาจถูกใช้ผิดกับโจทย์ความสัมพันธ์หรือบริษัท | มี entry, schema, copy และ output template แยก; ถ้ายังไม่มี engine ให้แสดง unavailable/coming next อย่างตรงไปตรงมาแทนผลจำลอง |

## Journey ที่เสนอ (Proposed)

### P1 — Entry: เริ่มจากงานของผู้ใช้ ไม่เริ่มจาก chart ตัวอย่าง

หน้าแรกควรสื่อ 3 อย่างในหนึ่งหน้าจอ:

1. **Student Pilot — ใช้ฟรีระหว่างการทดลอง ไม่มีการชำระเงิน**
2. งานหลัก: “ใช้โหราศาสตร์เป็นกรอบสังเกตจังหวะและวางแผนการเรียนรู้ด้านการลงทุน”
3. CTA เดียว: **เริ่มวางแผน**; ลิงก์รอง “ดูตัวอย่าง” ต้องติดป้าย Demo ชัดและไม่ใช้ข้อมูลตัวอย่างเป็นดวงของผู้ใช้

ก่อนรับข้อมูลเกิด ให้ถาม “คุณกำลังวิเคราะห์อะไร” เป็น 4 เส้นทางแยก:

| เส้นทาง | Input contract | Output contract |
|---|---|---|
| บุคคล | วัน/เวลา/สถานที่เกิด + ความแม่นยำของเวลา | จังหวะการเรียนรู้, วินัย, risk-awareness และ decision journal ของบุคคล |
| คู่ชีวิต | บุคคล A + B + เป้าหมายร่วม | ความต่างด้านการตัดสินใจ/เงิน, จุดคุยกัน, shared guardrails; ไม่ใช้ copy แบบ romance ทั่วไป |
| หุ้นส่วนธุรกิจ | A + B + บทบาทของแต่ละคน + ประเภทการตัดสินใจ | role complement, conflict protocol, decision rights และช่วงทบทวนร่วม |
| บริษัท | วัน/เวลา/สถานที่ก่อตั้งหรือเหตุการณ์อ้างอิง + เขตอำนาจ/ตลาด | company cycle, operating themes, review calendar; ระบุชัดว่าเป็น event chart ไม่ใช่บุคลิกมนุษย์ |

พิกัดและ timezone ให้อยู่ใต้ “การตั้งค่าขั้นสูง” หลังเลือกเมือง ระบบควรขอให้ผู้ใช้ยืนยันความแม่นยำของเวลาเกิด (`แน่นอน / โดยประมาณ / ไม่ทราบ`) เพราะส่งผลต่อสิ่งที่ UI ควรอ้างจาก Ascendant และ houses

### P2 — Planning Workspace: โครงเดียวทุกช่วงเวลา

หลังคำนวณ ให้ landing ที่ workspace ของ profile/entity และจำ context ไว้ใน URL/state เช่น `/{entity}/{id}/plan?range=today&date=...` เพื่อกลับมาใช้และแชร์ deep link ได้

Navigation ระดับหนึ่งบน desktop:

- **แผนของฉัน** — default workspace
- **เปรียบเทียบ** — เลือก Couple / Business partner / Company ตาม schema ที่ถูกต้อง
- **ดวงพื้นฐาน** — raw natal chart และเครื่องมือสำหรับผู้เรียนขั้นสูง
- **บันทึกการตัดสินใจ** — สมมติฐาน สิ่งที่ทำ และผลลัพธ์
- **ห้องทดลอง** — Bazi (Experimental) และ feature ที่ยังไม่ผ่าน validation

เลิกใช้ `เข้าใจง่าย / มืออาชีพ / Bazi / AI` เป็น navigation ระดับหนึ่ง ผู้ใช้ควรเปิด “รายละเอียดเชิงเทคนิค” จากภายในคำตอบเดียว โดยไม่ต้องสลับ product mode แล้วเสียบริบท

### P3 — Universal time navigator: Today ถึง 108 ปี

ใช้ time navigator เดียวที่อยู่ใต้ profile/entity header:

`วันนี้` · `7 วัน` · `30 วัน` · `1 ปี` · `3–10 ปี` · `108 ปี`

- **วันนี้:** date picker + Previous/Today/Next; daily transit ที่สำคัญต่อ Sun ก่อน พร้อม 1–3 learning actions
- **7/30 วัน:** event list หรือ calendar bands; ไม่ใช้ heatmap สีอย่างเดียว; แสดงวันที่และข้อความโดยตรง
- **1 ปี:** 12 เดือน + major/sub-period context; คลิกเดือนลงสู่วันโดยรักษา filter
- **3–10 ปี:** line/timeline ของจุดเปลี่ยนสำคัญ พร้อม list/table fallback
- **108 ปี:** overview ของ major periods ก่อน; เลือกช่วงแล้ว zoom เป็นปี จากปีลงเดือน/วัน

ทุกระดับต้องมีปุ่ม **กลับสู่วันนี้**, แสดงวันที่จริงควบคู่ “อายุ/อายุย่าง”, และไม่ reset selection เมื่อสลับหน้า รายการ/ตารางต้องเป็น accessible fallback ของ visual timeline เสมอ

### P4 — Content hierarchy: Macro → Sun → Supporting → Action

ทุก horizon ใช้ template เดียวเพื่อลดภาระการเรียนรู้:

1. **Macro climate — บริบทที่ครอบอยู่**  
   ดาวเสวยอายุ, ดาวแทรก, ช่วงวัฏจักร และขอบเขตวันที่ อธิบายสั้นก่อนรายละเอียด
2. **Solar core — แกนดวงอาทิตย์**  
   Natal Sun sign/house/dignity และ aspects-to-Sun เรียงตาม relevance ของ horizon; ระบุ transit body, aspect, orb, applying/separating และช่วงวันที่มีผล
3. **Supporting signals — ตัวสนับสนุน/ตัวต้าน**  
   Moon, Ascendant, houses และ aspects อื่นอยู่ชั้นรอง เปิดดูเพิ่มได้ ห้ามแข่งขันด้าน visual weight กับ Solar core
4. **Learning action — แปลงเป็นงานที่ทำได้**  
   ใช้ 3 ช่องคงที่: `สังเกตอะไร` · `เตรียมอะไร` · `บันทึก/ทบทวนอะไร` พร้อม CTA “เพิ่มลง decision journal”

สำหรับ investment planning ให้ภาษามุ่งที่กระบวนการเรียนรู้และการบริหารความเสี่ยง เช่น checklist, time horizon, thesis review และ position-sizing exercise ไม่แสดงคำสั่งซื้อ/ขายหรืออ้างผลตอบแทนจากดวงดาว แต่ละ insight มี **ทำไมจึงเห็นข้อความนี้** เพื่อเปิด source layers และวันคำนวณ

### P5 — Bazi Experimental ที่ผู้ใช้ควบคุม

- อยู่ใต้ `ห้องทดลอง` ไม่อยู่ใน top-level primary tabs
- ก่อนเปิดครั้งแรก แสดง: วัตถุประสงค์, input เพิ่มเติมที่ใช้, ข้อจำกัด และข้อความว่าไม่ถูกนำไปผสมในผลหลักโดยอัตโนมัติ
- Toggle ชัด: `รวม Bazi ใน synthesis นี้` ค่าเริ่มต้น off และมีสถานะ persistent ต่อ workspace ไม่ใช่ global silent default
- Output แยกกรอบและมี `Experimental` label ทุกหน้าที่ใช้ ห้ามใช้สีหรือข้อความที่ทำให้ดูเชื่อถือได้มากกว่าแกน Western/Sun

### P6 — Pilot access และ trust

- แทน tier/paywall ด้วย badge เล็ก `Student Pilot · Free access`
- AI ถ้าเปิดให้ใช้ ให้สื่อ source (`AI synthesis` หรือ `rule-based fallback`), วันที่สร้าง, profile snapshot และปุ่ม report issue; ห้ามเรียกสิ่งเดียวกันด้วยคำว่า “ไม่จำกัด” หากยังไม่มี service guarantee
- Signup เป็นจังหวะหลังผู้ใช้เห็น first useful plan แล้ว CTA คือ `บันทึกแผนและกลับมาทบทวน` ไม่ใช่ `สมัครสมาชิกพรีเมียม`
- เก็บ draft/date/profile เมื่อ error; ข้อผิดพลาดบอกสาเหตุและ recovery action ใกล้จุดที่เกิด

### P7 — Mobile-ready contract สำหรับอนาคต

รอบ pilot นี้ไม่จำเป็นต้องสร้าง native/mobile feature แต่ architecture เว็บต้องไม่ปิดทาง:

- บน desktop ใช้ sidebar/compact top bar; บนหน้าจอแคบในอนาคตใช้ navigation ไม่เกิน 5 จุดพร้อม icon + label
- ทุก control มี hit area อย่างน้อย 44×44px, text body 16px, visible focus, no hover-only meaning
- Timeline reflow เป็น cards/list; ไม่ซ่อน overflow ทั้งหน้าเพื่อกลบ layout defect
- รองรับ 375px, landscape, 200% zoom และ `prefers-reduced-motion`; sticky header ต้องไม่บัง focused element

## Screen inventory สำหรับ prototype

| Screen | เป้าหมาย | Primary action | ต้องเห็นเหนือ fold |
|---|---|---|---|
| 1. Pilot welcome | เข้าใจคุณค่าและเงื่อนไขใช้ฟรี | เริ่มวางแผน | Free pilot, purpose, privacy summary |
| 2. Choose analysis type | แยก semantics ก่อนกรอกข้อมูล | เลือก 1 จาก 4 | Person / Couple / Partner / Company + availability |
| 3. Guided setup | ให้ข้อมูลขั้นต่ำอย่างมั่นใจ | สร้าง workspace | progress, visible labels, time-accuracy, advanced collapsed |
| 4. Today workspace | ได้ first useful plan | เพิ่มลง journal | Macro, Solar core, 1–3 actions, why-this |
| 5. Time explorer | เคลื่อนจากวันสู่ 108 ปี | เลือก/zoom ช่วง | universal range control, current context, back to today |
| 6. Solar detail | เข้าใจ Sun และ aspects-to-Sun | เปิด technical evidence | ranked aspects, date/orb/state, supporting signals collapsed |
| 7. Compare workspace | ใช้ output ตามประเภท entity | บันทึก shared plan | type-specific roles/guardrails; ไม่มี single-person copy |
| 8. Decision journal | เรียนจากสิ่งที่ทำจริง | บันทึกผลลัพธ์ | hypothesis, timeframe, planned check-in, outcome |
| 9. Bazi lab | ทดลองโดยไม่ปนแกนหลัก | Opt in | Experimental status, limits, explicit include toggle |

## ลำดับงานที่ actionable

### P0 — ก่อนให้ผู้เรียนใช้

1. ถอด/ซ่อน paywall, plan prices, membership CTA และ upgrade simulation จาก pilot build; เปลี่ยน AI gating เป็น explicit pilot entitlement
2. เปลี่ยน default entry ไม่ให้ auto-present preset เป็นข้อมูลผู้ใช้; เพิ่ม Demo label หากต้องมีตัวอย่าง
3. สร้าง time navigator + Today view จาก daily transit ที่ backend มี และเชื่อม drill-down ถึง 108 ปี
4. สร้าง Solar core selector/query ที่ยก aspects-to-Sun ก่อนทุก aspect อื่น ทั้ง deterministic view และ AI context
5. ทำ Bazi opt-in และหยุดคำนวณ/ส่ง context เมื่อ off
6. เพิ่ม entity-type setup; feature ที่ engine ยังไม่รองรับต้องแสดง unavailable อย่างตรงไปตรงมา
7. ปิด accessibility blockers: `lang="th"`, semantic tabs, labelled slider, keyboard-operable aspect cards, dialog focus management, visible focus และ minimum target size

### P1 — ระหว่าง pilot เพื่อวัดการเรียนรู้

1. Decision journal + scheduled reflection โดยผูกกับ insight snapshot
2. Save/restore range, date, filters และ scroll state ต่อ workspace
3. “Why this” provenance และ feedback ต่อ insight (`เข้าใจ / ไม่ชัด / ไม่เกี่ยวข้อง`)
4. Compare templates แยก Couple, Business partner และ Company พร้อม vocabulary tests
5. Responsive web QA ที่ 375/768/1024/1440px, landscape และ keyboard-only

### P2 — หลังได้หลักฐานจาก pilot

1. Mobile navigation/native shell ตามพฤติกรรมที่วัดได้จริง
2. ขยาย Bazi เฉพาะเมื่อความถูกต้อง input, labeling และ comprehension ผ่านเกณฑ์ทดลอง
3. Advanced chart studio/PDF export โดยใช้ workspace state เดียวกัน

## UX rubric และ acceptance gate

ให้คะแนนหัวข้อละ 0–1 คะแนน รวมเต็ม 10 คะแนน ใช้ rubric เดียวกันตรวจ prototype รอบสุดท้าย

| # | มิติ | 1 คะแนนเมื่อ | คะแนนปัจจุบัน |
|---|---|---|---:|
| 1 | Pilot clarity | เห็นชัดว่าใช้ฟรี ไม่มี payment และไม่มี purchase path | 0.0 |
| 2 | Task-first onboarding | เริ่มจาก purpose/entity, ไม่มีข้อมูลตัวอย่างที่ดูเหมือนของผู้ใช้, progressive disclosure | 0.4 |
| 3 | Time-scale completeness | Today ถึง 108 ปีใช้งานได้จริงและ drill-down รักษาบริบท | 0.3 |
| 4 | Macro-to-micro fidelity | Macro ก่อน, Sun + aspects-to-Sun เด่นก่อน supporting signals ทุก horizon | 0.3 |
| 5 | Actionability for learning | มี observe/prepare/record และ decision journal โดยไม่ชี้นำ buy/sell | 0.6 |
| 6 | Entity separation | Person/Couple/Partner/Company มี input, copy และ output semantics แยก | 0.1 |
| 7 | Optional experiment integrity | Bazi off by default, opt-in, labelled และไม่ปน synthesis เงียบ ๆ | 0.0 |
| 8 | Navigation/state continuity | IA ตามงาน, deep link/back/selection/profile state ไม่หาย | 0.5 |
| 9 | Accessibility | Keyboard, focus, semantics, contrast, labels, table/list fallbacks และ 200% zoom ผ่าน | 0.4 |
| 10 | Responsive/trust/feedback | 375–1440px, loading/error recovery, provenance และ source state ชัด | 1.0 |
|  | **รวม** |  | **3.6/10 — FAIL** |

**Release gate:** คะแนนรวมต้อง **≥ 8.0/10**, ไม่มีมิติใดต่ำกว่า **0.6**, และ critical issue **ต้องเป็น 0 รายการ** คะแนนสูงไม่สามารถชดเชย C1–C5 ได้

### Scenario checks ที่ต้องผ่านในรอบ final prototype review

1. นักเรียนใหม่ที่ไม่รู้ศัพท์โหราศาสตร์เริ่มจากศูนย์และได้ Today plan โดยไม่เลือก Pro/Bazi/AI และไม่เห็นราคา
2. ผู้ใช้เปลี่ยน Today → 1 ปี → 108 ปี → ปีหนึ่ง → วันหนึ่ง แล้ว profile, purpose และ date context ไม่หาย
3. Fixture ที่ strongest aspect ไม่แตะ Sun ยังต้องแสดง Sun/aspects-to-Sun ใน Solar core ก่อน แล้ว strongest non-Sun อยู่ Supporting signals พร้อมน้ำหนักอธิบาย
4. Bazi off: ไม่มี Bazi ใน request/context/output; เมื่อ on มี Experimental label และผู้ใช้ปิดกลับได้
5. Couple, partner และ company ไม่ใช้ heading หรือคำแนะนำแบบ single-person สลับกัน
6. Keyboard-only ใช้ setup, time navigator, timeline drill-down, dialog และ aspect details ได้; focus ไม่หายหรือถูก sticky header บัง
7. ที่ 375px และ 200% zoom ไม่มี content/action หาย ไม่มี horizontal page scroll และ body ไม่ต้องพึ่ง `overflow-x: hidden`
8. API ล้มเหลวระหว่างคำนวณแล้วข้อมูลที่กรอกและช่วงเวลายังอยู่ พร้อมปุ่มลองใหม่

## แนวทางชื่อแบรนด์

| ชื่อ | Rationale | Trade-off |
|---|---|---|
| **Solarian Atlas** (แนะนำ) | รักษาชื่อเดิมและสื่อ “แผนที่” หลายสเกลตั้งแต่วันถึง 108 ปี เหมาะกับ workspace มากกว่า service ทำนาย | ชื่อยาวขึ้นเล็กน้อย; subtitle ควรบอก investment-learning context |
| **HelioPlan** | `Helio` เชื่อมแกน Sun และ `Plan` บอกงานหลักตรงไปตรงมา ฟังเป็นเครื่องมือเรียนรู้สมัยใหม่ | ภาษาอังกฤษล้วนและไม่สื่อ 108 ปีในชื่อ |
| **SunCycle 108** | บอก Sun-first และวงรอบระยะยาวชัด เหมาะกับ pilot/course | ตัวเลขอาจทำให้ผู้ใช้คิดว่าเป็นศาสตร์เดียวหรือจำกัดเฉพาะอายุขัย |
| **สุริยเข็ม (SuriyaKhem)** | ไทย จำง่าย และสื่อเข็มทิศเพื่อการตัดสินใจ ไม่ฟังเป็นคำสั่งลงทุน | ต้องมี romanization/copy อังกฤษที่คงที่หากขยายตลาด |
| **Solarian Lab** | เหมาะกับ student pilot และทำให้ feature ทดลอง เช่น Bazi มีพื้นที่ชัด | คำว่า Lab ให้ความรู้สึกยังไม่ใช่ผลิตภัณฑ์สำหรับใช้ระยะยาว จึงเหมาะเป็นชื่อ pilot มากกว่า master brand |

ชื่อทั้งหมดเป็น creative direction เท่านั้น รายงานนี้ไม่ได้ตรวจหรือรับรองเครื่องหมายการค้า ชื่อบริษัท โดเมน หรือ app-store availability

## ข้อสรุปสำหรับทีม prototype

Prototype รอบถัดไปควรพิสูจน์ C1–C5 ก่อนงาน visual polish โดยใช้ 4 หน้าหลักเป็น minimum coherent flow: **Pilot welcome → Entity setup → Today workspace → Time explorer** จากนั้นเพิ่ม Solar detail, compare templates, journal และ Bazi lab เมื่อแกนหลักเดินครบ การคงโทน navy/amber และ typography ปัจจุบันทำได้ แต่ hierarchy, semantics และ journey ต้องมาก่อน effect หรือความหนาแน่นของ dashboard

---

## Prototype review — รอบ 1

วันที่ตรวจ: 13 กันยายน 2026  
ขอบเขต: `design-preview/index.html`, `style.css`, `app.js` และ screenshots 6 ภาพใน `docs/reviews/screenshots`  
วิธีคิดคะแนน: ให้คะแนนเฉพาะ design/interaction ที่ prototype ตั้งใจพิสูจน์ ไม่หักคะแนนเพราะยังไม่เชื่อม calculation engine, AI, account หรือ relationship engine; ความพร้อมเหล่านั้นแยกไว้ในหัวข้อ Readiness

### ผลตัดสิน

**8.4/10 แต่ยังไม่ผ่าน release gate เพราะมี 1 critical issue**

ต้นแบบเปลี่ยนจาก dashboard เชิงเทคนิคเป็น editorial planning experience ได้ชัด ภาษาหลักเข้าใจง่ายและไม่อ้างว่าตัวอย่างเป็นผลโหราศาสตร์จริง โครง 108 ปี → บทชีวิต → ปี → 90 วัน → วันนี้ สื่อแนวคิด macro-to-micro ได้ดี และทุก action ปลายทางเน้นการทบทวน/บันทึกแทนคำสั่งลงทุน

อย่างไรก็ตาม หน้า Atlas ที่เป็นหัวใจยังไม่ได้แสดง **Solar core และ aspects-to-Sun เป็นชั้นเนื้อหาที่มองเห็นได้** หลัก Sun-first ปรากฏในหน้า Method และ evidence ที่พับไว้เท่านั้น จึงยังไม่พิสูจน์ analytic hierarchy ตามโจทย์

### สิ่งที่ผ่านใน design scope

- **Pilot clarity:** หน้าแรกบอกว่าเป็นต้นแบบของคลาส, ไม่มีการเก็บเงินหรือเรียก AI จริง และ CTA ใช้คำว่า “สำรวจตัวอย่าง” (`design-preview/index.html:21-25`)
- **No fake astrology:** Atlas มี sample banner, ribbon มีคำอธิบายว่าไม่ใช่สัดส่วนดาวเสวยอายุ และแต่ละ horizon ระบุข้อจำกัดของข้อความตัวอย่าง (`index.html:58-66`; `app.js:5-10`)
- **Task-first focus:** ผู้ใช้เลือกการงาน/การเงิน/การลงทุนจาก landing และเปลี่ยน focus ต่อใน Atlas ได้; `aria-pressed` สะท้อนสถานะ (`index.html:53`, `:62`; `app.js:21`, `:26-28`)
- **Long-to-short horizon:** Navigation แสดง 108 ปี → บทชีวิต → ปีนี้ → 90 วัน → วันนี้ เป็นแกนเดียว และ content/action เปลี่ยนตามช่วง (`index.html:60-67`; `app.js:5-15`, `:21`)
- **Actionability:** ทุก focus จบที่ reflection และหนึ่งก้าวที่บันทึกลง journal ได้; investment copy แยกสมมติฐาน หลักฐาน และเงื่อนไขทบทวน พร้อมย้ำให้ใช้ข้อมูลธุรกิจ ราคา และความเสี่ยงจริง (`app.js:12-15`, `:21`, `:29`)
- **Local journal trust:** แจ้งว่าเก็บเฉพาะใน browser, กันรายการซ้ำ, escape user text ก่อน render และบอกเมื่อ localStorage ใช้ไม่ได้ (`index.html:75`; `app.js:17-22`, `:29-30`)
- **Question draft:** ระบุชัดว่าไม่ส่ง AI และเก็บเป็นร่าง local พร้อม context ของ horizon/focus (`index.html:82`; `app.js:39-40`)
- **Entity separation:** Couple, business partner และ company แยกเป็นคนละ card/copy และเปิดข้อมูลเตรียมที่ต่างกัน โดยประกาศชัดว่ายังไม่มี engine (`index.html:73`; `app.js:37-38`)
- **Bazi integrity:** อยู่เป็นมุมมองเสริม เปิดด้วย action แยก มี “แนวคิดทดลอง” และไม่สร้างผลส่วนบุคคล (`index.html:60`; `app.js:36`)
- **Accessibility foundation:** `lang="th"`, skip link, `aria-current`, `aria-pressed`, native `<dialog>`, visible labels, close-button names และ live toast มีใน HTML (`index.html:2`, `:11-17`, `:78-82`); `style.css` กำหนด focus-visible 3px, reduced-motion และ target หลัก 44–48px
- **Visual clarity:** palette กระดาษ/หมึกสร้างเอกลักษณ์สงบ เหมาะกับการอ่านระยะยาว; contrast ที่คำนวณจาก token ผ่านสำหรับ body pairs หลัก เช่น `#765443` บน `#f6ebdd` = 5.72:1 และ `#a14e36` บน `#fff8ee` = 5.44:1 ภาพ mobile 390px ไม่พบข้อความหรือ CTA หลักหลุดกรอบจากภาพที่ส่งมา

### Critical issue ในรอบ 1

| ID | สิ่งที่พบ | ผลต่อโจทย์ | การแก้ขั้นต่ำเพื่อปิด |
|---|---|---|---|
| CP1 | Visible reading มี generic summary → life ribbon → reflection/action; Sun และ aspects-to-Sun อยู่ใน Method/evidence เท่านั้น (`index.html:52`, `:63-66`) | ผู้ใช้ยังไม่เห็นว่าระบบให้น้ำหนัก Sun ก่อนปัจจัยรอง แม้ copy จะกล่าวไว้ จึงไม่ผ่าน core analytic model | เพิ่มโครงที่เห็นทันทีใน reading: **1 Macro context → 2 Solar core: Natal Sun + aspects-to-Sun → 3 Supporting signals (พับได้) → 4 Reflection/action** ใช้ placeholder ที่บอกว่า engine ยังไม่เชื่อม ห้ามเติมผลดวงสมมติ |

### ข้อแก้สำคัญที่ไม่เป็น critical

1. **ให้ horizon มี time coordinate ที่ชัด** — ตอนนี้เปลี่ยนชื่อ/เนื้อหา แต่ไม่เห็นวันที่หรือช่วงวันที่ที่เลือก เพิ่ม selected date/range และ `กลับสู่วันนี้`; prototype ใช้วันที่ browser จริงได้โดยไม่ต้องสร้างผลโหราศาสตร์ (`app.js:5-10`, `:21`)
2. **ประกาศ dynamic reading ต่อ assistive technology** — การกด horizon/focus เปลี่ยน heading/body ใน DOM แต่ไม่มี live region หรือ focus move เพิ่ม `aria-live="polite"` ที่ summary/status หรือ focus heading อย่างมีเหตุผล โดยไม่ทำให้ผู้ใช้ keyboard ถูกดึง focus ทุกครั้ง (`app.js:21`, `:27-28`)
3. **รักษา horizon/focus เมื่อ refresh/back** — hash เก็บเฉพาะ page; refresh Atlas จะกลับ `life/career` เสมอ เก็บ state ใน query/hash เช่น `#atlas?range=today&focus=investment` หรือ equivalent (`app.js:4`, `:23-28`)
4. **ให้ลบบันทึกแบบย้อนกลับได้** — ปุ่มลบตัดรายการจาก localStorage ทันที เพิ่ม Undo toast หรือ confirm ที่ไม่รบกวน flow (`app.js:22`, `:30`)
5. **เพิ่มสถานะ “โปรไฟล์บุคคล” ให้ชัด** — profile dialog ปัจจุบันเป็น personal setup ที่ดีและไม่บันทึกข้อมูล แต่ควรติด label `บุคคล` และลิงก์ไป “วิเคราะห์ผู้ร่วมทาง/บริษัท” เพื่อไม่ให้ผู้ใช้คิดว่า form เดียวใช้กับทุก entity (`index.html:57`, `:80`)
6. **ใช้ wording ของ horizon ให้สัมพันธ์กับระบบจริงในอนาคต** — “บทชีวิต” และ “90 วัน” เป็น planning layers ที่ดี แต่ implementation spec ควรระบุ mapping ถึง date range, annual transits และ 108-year periods เพื่อไม่ให้ทีม backend ตีความเป็นการคำนวณชนิดใหม่
7. **สร้าง visual QA evidence ใหม่** — `desktop-home.png` มีขนาด 462×1000 จึงไม่ใช่หลักฐาน desktop; `desktop-atlas.png` 1440×1327 แต่ scale ดูไม่สม่ำเสมอกับ `desktop-connections.png` 1440×1000 ระบุ CSS viewport/DPR และจับใหม่ที่ 1440px กับ 390px หลังแก้ CP1

### คะแนน prototype รอบ 1

| # | มิติเดิม | คะแนน | เหตุผลย่อ |
|---|---|---:|---|
| 1 | Pilot clarity | 1.0 | ฟรี/no-payment/no-real-AI และ demo label ชัด |
| 2 | Task-first onboarding | 0.8 | เริ่มจาก intent และมี guided profile; entity chooser ยังไม่ได้เชื่อมจาก personal setup |
| 3 | Time-scale completeness | 0.8 | มีปลายทั้ง 108 ปีและ Today พร้อม layers ระหว่างกลาง; ยังไม่มี date/range control และ stateful drill-down |
| 4 | Macro-to-micro fidelity | 0.4 | ลำดับช่วงเวลาชัด แต่ Solar core/aspects-to-Sun ไม่อยู่ใน visible hierarchy |
| 5 | Actionability for learning | 0.9 | reflection/action/journal ดีและไม่ชี้นำ buy/sell |
| 6 | Entity separation | 0.9 | copy/คำถามแยกสามชนิดและไม่แกล้งว่าคำนวณแล้ว |
| 7 | Optional experiment integrity | 1.0 | Bazi แยก, optional, experimental และไม่มีผลปลอม |
| 8 | Navigation/state continuity | 0.8 | hash pages, active state และ context to journal ดี; horizon/focus ไม่อยู่ใน URL |
| 9 | Accessibility | 0.9 | semantic foundation แข็งแรง; dynamic content announcement และ undo ยังขาด |
| 10 | Responsive/trust/feedback | 0.9 | mobile/reduced motion/error messaging ดี; desktop screenshot evidence ยังไม่ครบ |
|  | **รวม** | **8.4/10** | **FAIL เพราะ CP1 ยังเปิดอยู่** |

### Prototype acceptance checks รอบถัดไป

รอบ 2 ควรทดสอบจาก prototype เท่านั้น:

1. ในทุก horizon ผู้ใช้มองเห็นลำดับ Macro → Solar core → Supporting → Action โดยไม่เปิด evidence ก่อน
2. Solar core แสดงตำแหน่งสำหรับ Natal Sun และ aspects-to-Sun พร้อมข้อความ placeholder ที่ไม่อ้างผลคำนวณ
3. เมื่อเลือก Today/Year/108-year UI แสดง date/range context และกลับ Today ได้
4. Refresh/deep link คืน horizon และ focus เดิมได้
5. Screen reader รับรู้ว่าบทอ่านเปลี่ยนหลังเลือก horizon/focus โดยไม่มี focus jump ที่รบกวน
6. ลบบันทึกแล้ว Undo ได้
7. ภาพ 1440px แสดง landing สองคอลัมน์ครบ และภาพ 390px ไม่มี page-level horizontal overflow

### Production readiness แยกจากคะแนน prototype

รายการต่อไปนี้ **ไม่ได้ถูกหักจาก 8.4 คะแนน** แต่ต้องเสร็จก่อนนำ flow ไปใช้จริง:

- เชื่อม selected profile, time accuracy และ timezone ที่ผ่าน validation
- สร้าง daily/range/annual/108-year data contract และเลือก date จริง
- จัดอันดับ Sun/aspects-to-Sun ใน deterministic response และ AI context ก่อน supporting signals
- สร้าง entity-specific engine/schema หรือคง honest unavailable state สำหรับ Couple/Partner/Company
- ทำ Bazi consent flag ให้ควบคุม computation และ synthesis จริง
- ผูก journal/question กับ immutable profile + calculation snapshot; มี privacy/delete/sync policy
- ถอด monetization/paywall/upgrade path จาก pilot build จริง ไม่ใช่เฉพาะ design preview
- ทดสอบ keyboard, screen reader, 200% zoom, 375/768/1024/1440px และ error recovery กับ build ที่เชื่อมระบบ

---

## Final prototype source review — รอบ 2

วันที่ตรวจ: 13 กันยายน 2026  
ขอบเขต: ตรวจ source ล่าสุดใน `design-preview/index.html`, `style.css`, `app.js` และภาพหลักฐาน Material ใน `docs/reviews/screenshots`; ไม่แก้ app source และไม่ได้เปิดหรือควบคุม browser tab ของผู้ใช้  
หลักฐาน interaction: ใช้ผลการทดสอบ browser ที่ทีมส่งให้ประกอบ source review ได้แก่ URL reload, keyboard slider, boundary states, 390/360px overflow, journal undo และ dialog focus return  
สถานะของส่วนนี้: เป็นคำตัดสินสุดท้ายของ **design prototype** และใช้แทนคำตัดสินรอบ 1 ข้างต้น ไม่ได้เปลี่ยนผล audit ของ production app ตอนต้นรายงาน

### ผลตัดสิน

**9.3/10 — PASS สำหรับ prototype gate, critical issue 0 รายการ**

ต้นแบบพิสูจน์ journey ที่ได้รับมอบหมายครบ: landing → เลือกเรื่อง → Atlas ที่เปลี่ยน horizon/focus โดยรักษา state → เห็นภาพรวม 108 ปีและสำรวจอายุทีละปี → เห็น Solar core → บันทึกหรือร่างคำถามพร้อม context → กลับมาทบทวนใน journal ส่วน Connections และ Bazi ถูกแยกอย่างตรงไปตรงมาและไม่สร้างผลวิเคราะห์ปลอม

คะแนนนี้รับรองเฉพาะคุณภาพ journey, interaction และการสื่อสารภายในต้นแบบที่ยังระบุว่าเป็น Demo การที่ calculation engine, account, sync, AI, relationship/company analysis และ deployment ยังไม่ถูกเชื่อมเป็น production readiness ที่แยกต่างหาก ไม่ถูกนำมาหักคะแนนต้นแบบ

### Observed — สิ่งที่ยืนยันได้จาก source และหลักฐาน

- **108 ปีมีทั้งภาพรวมและปีเฉพาะ:** life ribbon ยังแสดง global overview ก่อน year explorer; slider ใช้ช่วง 0–108 และ `step="1"` พร้อม output, ปุ่มปีก่อน/ปีถัดไป และช่องกรอกอายุโดยตรง (`design-preview/index.html:46-53`)
- **Age state เป็นชุดเดียว:** `renderAge()` อัปเดต slider, direct input, output, live detail และ disabled boundaries พร้อมกัน; `setAge()` ตรวจจำนวนเต็ม 0–108 และบันทึก URL เมื่อ commit (`app.js:52-54`)
- **Mobile ไม่บังคับลาก slider อย่างเดียว:** ที่ 360px control ก่อน/ถัดไปและ direct age อยู่ในแถวที่อ่านได้ ไม่มี page-level overflow ตามภาพ `material-mobile-slider-360.png`; หลักฐาน browser เพิ่มเติมยืนยัน 390px ไม่มี overflow
- **Keyboard และขอบเขตทำงาน:** ผลทดสอบที่ส่งให้ยืนยัน ArrowRight เปลี่ยน 40 → 41, ปุ่มถัดไปเป็น 42, direct age 108 ปิด Next และ age 0 ปิด Previous สอดคล้องกับ logic ใน `renderAge()`
- **Context ไม่หลุด:** `focus`, `horizon`, `date` และ `age` อยู่ใน query state และถูกอ่านคืน (`app.js:7-8`); landing intent เรียก `saveURL()`, `renderReading()` และ `announceReading()` แล้ว (`app.js:34`)
- **Journal และคำถามจำสิ่งที่เลือก:** `contextLabel()` รวม horizon, focus, อายุที่เลือกเมื่ออยู่ใน 108-year view และวันที่อ้างอิง แล้วใช้ทั้ง saved plan และ draft question (`app.js:39`, `:49-51`) ผล browser ที่ส่งให้ยืนยันข้อความบริบท “อายุ 42 ปี · 13 ก.ย. 2569”
- **Macro-to-micro มองเห็นได้:** global ribbon/year explorer มาก่อน Solar core ที่แสดงช่อง Natal Sun และ aspects-to-Sun โดยใช้ placeholder ชัดว่าไม่ได้เชื่อมเครื่องคำนวณ (`index.html:45-55`) จึงปิด CP1 โดยไม่สร้าง fake astrology
- **ช่วงเวลาสั้นและยาวอยู่ใน workspace เดียว:** 108 ปี, บทชีวิต, ปี, 90 วัน และวันนี้เปลี่ยน content ใน template เดียว มีวันที่อ้างอิงและปุ่มกลับสู่วันนี้ (`index.html:41-44`; `app.js:10-17`, `:35-38`)
- **Action ปลายทางทบทวนได้:** save, delete และ undo ใน journal ทำงานตามผล browser; source มี fallback เมื่อ localStorage ใช้ไม่ได้และ escape ข้อความก่อน render (`app.js:25-29`, `:39-40`)
- **Profile prototype ซื่อสัตย์กับข้อมูล:** form ระบุว่าไม่ส่งหรือบันทึก, unknown birth time ปิดและยกเลิก required ของช่องเวลา; native dialog ปิดด้วย Escape และคืน focus ได้ตามผล browser (`index.html:70`; `app.js:42-44`)
- **ขอบเขตระบบรองชัด:** Connections แยกคู่ครอง/หุ้นส่วนธุรกิจ/บริษัทเป็นคนละคำถามและระบุว่ายังไม่มี engine; Bazi เป็น action เสริมพร้อม Experimental/ไม่มีผลส่วนบุคคล (`index.html:41`, `:63`; `app.js:46-48`)

### Critical closure

| Critical เดิม | สถานะรอบสุดท้าย | หลักฐานปิด |
|---|---|---|
| CP1 — Solar core ไม่อยู่ใน visible reading hierarchy | **ปิดแล้ว** | Solar core อยู่ใต้ global/year context และก่อน evidence/reflection พร้อมสองช่อง “ดวงอาทิตย์กำเนิด” และ “มุมสัมพันธ์สู่อาทิตย์” (`index.html:54`) |

**Critical issue รอบสุดท้าย: 0 รายการ**

### UX rubric รอบสุดท้าย

ใช้ rubric เดิมหัวข้อละ 0–1 รวมเต็ม 10; release gate คือรวม ≥8.0, ไม่มีมิติใดต่ำกว่า 0.6 และไม่มี critical

| # | มิติ | คะแนน | เหตุผลย่อ |
|---|---|---:|---|
| 1 | Pilot clarity | 1.00 | Demo/no-payment/no-real-AI และขอบเขตการลงทุนเห็นชัดในจุดตัดสินใจ |
| 2 | Task-first onboarding | 0.90 | เริ่มจากคุณค่าและ intent ก่อนข้อมูลเกิด; profile/entity ยังเป็นตัวอย่างแยกหน้า ไม่ใช่ setup engine จริง |
| 3 | Time-scale completeness | 0.95 | Today ถึง 108 ปีอยู่ใน workspace เดียว และ 108 ปีเลือกได้ทีละปีสามวิธี; ยังไม่มี computed drill-down ซึ่งอยู่นอก design scope |
| 4 | Macro-to-micro fidelity | 0.95 | global context → selected year → visible Solar core → evidence/action ชัด; supporting engine data ยังเป็น placeholder อย่างถูกต้อง |
| 5 | Actionability for learning | 0.95 | reflection, next step, dated/aged journal context และ question draft สนับสนุนการทบทวนโดยไม่ชี้นำซื้อขาย |
| 6 | Entity separation | 0.90 | Couple/Partner/Company แยก semantics และ honest-unavailable; ยังไม่ใช่ entity-specific setup จริง |
| 7 | Optional experiment integrity | 1.00 | Bazi แยกเป็น optional experimental และไม่ปนผลหลักหรือสร้างผลปลอม |
| 8 | Navigation/state continuity | 0.95 | focus/horizon/date/age อยู่ใน URL, reload คืนค่า และ saved artifacts เก็บ context ที่เลือก |
| 9 | Accessibility | 0.90 | semantic range, aria-valuetext/live text, keyboard/boundaries, native dialog focus และ target sizes ผ่านหลักฐานที่มี; ยังไม่ได้ตรวจ screen reader/200% zoom เต็มชุด |
| 10 | Responsive/trust/feedback | 0.90 | ภาพ Material ที่ 360/390px และ browser checks ไม่พบ overflow; feedback/error/undo ชัด แต่ยังไม่มี network error state เพราะไม่เชื่อมบริการ |
|  | **รวม** | **9.30/10 — PASS** | **ทุกมิติ ≥0.90 และ critical = 0** |

### Proposed — งานต่อจากต้นแบบ ไม่ใช่ blocker ของคะแนนนี้

1. เมื่อเชื่อมโปรไฟล์จริง ให้คำนวณ selected age เป็นปีปฏิทินและช่วงวันที่จากวันเกิด/เขตเวลา พร้อมกำหนด “อายุเต็ม” หรือ “อายุย่าง” ให้ชัด
2. ให้ age selection ดึง major period, sub-period และ aspects-to-Sun ของปีนั้นจาก deterministic engine แล้วผูก evidence snapshot เดียวกับ journal/question
3. ทำ list/table fallback ของวงรอบ 108 ปีสำหรับ screen reader และผู้ใช้ที่ไม่ต้องการใช้ slider พร้อมทดสอบ screen reader และ zoom 200%
4. เชื่อม entity-specific setup/engine หรือรักษา honest-unavailable state เดิมจนกว่าคู่ครอง หุ้นส่วน และบริษัทจะมี schema และ validation ของตนเอง
5. รักษา Bazi opt-in flag แยก computation และ synthesis จริง และถอด monetization/paywall จาก pilot build ที่นำไปใช้กับผู้เรียน

### Final readiness distinction

- **Prototype journey:** ผ่าน 9.3/10, critical 0; พร้อมใช้เป็นหลักฐานทิศทางและสำหรับ usability session ที่ใช้ข้อมูลตัวอย่าง
- **Production implementation:** ยังไม่ถูกรับรองและยังไม่เผยแพร่ ต้องผ่าน calculation correctness, data/privacy, engine integration, pilot entitlement, full accessibility และ responsive regression ก่อนใช้งานจริง
