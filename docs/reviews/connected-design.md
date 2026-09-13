# Connected Material UI — independent review

สถานะ: **PASS เฉพาะ connected local UI ที่ตรวจ ทุกหมวด ≥8/10 ไม่มี critical ที่ยังเปิดอยู่ในหลักฐานรอบสุดท้าย**

ขอบเขต: frontend ที่เชื่อม calculation และ profiles จริงในเครื่อง ไม่ใช่ static prototype ผล PASS ใน `design-v2.md` ไม่ได้ยกมาใช้กับงานนี้ ผู้ตรวจไม่แก้ application เป็นผู้ตรวจ read-only และเขียนรายงานไฟล์นี้เท่านั้น

## เกณฑ์ตรวจ

Material surfaces/elevation พร้อม painterly mythical illustration, ไม่มีสีดำใน UI, ภาษาไทยอ่านง่าย, mobile ไม่หลุดขอบ, เริ่มด้วยข้อมูลผู้ใช้ยืนยันจริง, Sun-first และข้อมูลอาทิตย์ครบ, slider 0–108 เชื่อมข้อมูลจริงทุกอายุ, profile switch ไม่ปนคน, error/recovery ชัดเจน ทุกหมวดของ UI rubric เดิมต้อง ≥8/10 และไม่มี critical issue ใน connected flow

## API contract ที่ตรวจและส่งให้ implementation agent

- `backend/main.py:67` ChartRequest มี default DOB 1985-01-13/time09:45/Bangkok จึงต้องส่งข้อมูลเกิดครบแบบ explicit หลัง validation ห้ามเรียก empty payload หรือ auto preset ในฐานะดวงผู้ใช้
- `backend/main.py:152` ชื่อผู้ใช้ใน calculation response อยู่ `profile.name` ไม่ใช่ `chart.metadata.name`
- `frontend/src/types.ts:1` และ `:72`: อาทิตย์ใช้ `chart.planets_dict.Sun` ให้เห็น sign_thai, longitude/formatted_dms, house; มุมสัมพันธ์ต้องกรองทั้งหมดที่ `body1 === 'Sun' || body2 === 'Sun'` พร้อมอีกดวง, ชนิดมุม, orb, applying ไม่คัดเฉพาะมุมสวยหรือสร้างค่าทดแทน
- `backend/engine/thaksa.py:219`: `years_map` มี 109 entries อายุ 0–108 ให้ slider/ปุ่ม/กรอกตรงเลือก entry ตาม age จริง พร้อม major_planet/sub_planet/reading
- `backend/engine/transits.py:218`: transits คำนวณ snapshot ตรงวันเกิดของแต่ละปี ให้แสดง target_date จริง ห้ามเรียกว่า forecast ทั้งปีหรือ daily transit ปัจจุบัน
- `/api/profiles` ต้อง Bearer token; GET อาจ migrate legacy profile; การเปลี่ยน profile ต้อง bind result กับ request snapshot/ID ป้องกัน response เก่ามาแสดงใต้ชื่อใหม่
- Backend ยังไม่มี contract รองรับ unknown birth time; ห้ามใส่ 12:00 เองแล้วแสดงลัคนา/เรือนว่าแม่นยำ

## ข้อจำกัด backend ที่ต้องไม่ปกปิดด้วย UI

1. Preset cities ใช้ tz offset คงที่ ไม่ตรวจ DST ตามวันเกิด ควรให้ตรวจ/แก้ UTC offset และอย่าอ้าง timezone auto ถูกต้องทุกวันทั่วโลก
2. Calculation เรียก Bazi ด้วย gender='m' โดยไม่รับ gender จาก ChartRequest ต้องไม่อ้างผลปรับตาม gender จริง
3. BirthProfile.get_data() มี fallback DOB2000/time12 เมื่อ field หาย อาจทำให้ข้อมูล legacy ดูเหมือนยืนยันแล้ว จึงต้องให้ผู้ใช้ตรวจข้อมูลที่โหลดมาได้ชัดเจน
4. Transits สร้างวันที่เดือน/วันเกิดซ้ำทุกปี ต้องตรวจกรณีเกิด 29 ก.พ. กับปีไม่ leap ก่อนอ้างครอบคลุมข้อมูลเกิดทุกกรณี

## Review log

1. อ่าน API/models/types/timeline/transits แล้ว ส่งข้อกำหนดให้ journey_v2 และความเสี่ยงให้ root รอ source และ screenshots ของ connected implementation

## Connected source รอบ 1

อ่าน `frontend/src/components/SolarianJourney.tsx` แล้ว: เริ่ม guest ด้วย birth fields ว่าง, request calculation มี AbortController/request ID, Sun aspect filter ครบทั้ง body1/body2 และ timeline เลือก entry ด้วย age จริง 0–108 เป็นการเชื่อมข้อมูลที่ถูกทิศทาง ยังไม่ให้ design score จนเห็น CSS/ภาพจริง

ข้อแก้ที่ส่ง implementation agent (เลขบรรทัดอ้างเวอร์ชันที่ตรวจ อาจเลื่อนหลังแก้):

- **P1 auth race:** auth effect catch แถว 473–477 ไม่มี generation guard ทำให้ error ของ session เก่า remove token/currentUser ของ session ใหม่ได้ อีกทั้ง profile fetch 500 ถูกตีความเป็น logout ต้องแยก 401 จาก network/service error
- **P1 save profile race:** `saveProfile` แถว 540 ไม่มี saving lock และ session/subject snapshot guard กดซ้ำสร้างหลายรายการ และ response หลัง logout/profile switch อาจเติมข้อมูลบัญชีเก่ากลับ UI
- **P1 pending intent:** guest กดบันทึกผ่านบัญชีแล้ว login โหลด default profile ด้วย autoCalculate=true จึงแทนที่ chart ที่ตั้งใจบันทึก ต้องรักษา pending-save chart ก่อน login แล้วดำเนินต่อกับชุดเดิม
- **P2 recovery:** `/api/cities` ล้มเหลวทำให้ select และ submit disabled รวมถึงทางเลือก manual location ต้องให้ระบุพิกัดเองหรือลองโหลดใหม่ได้
- **P2 precision/validation:** พิกัด input step=0.0001 ไม่รองรับ saved longitude 100.516667 จาก backend default อาจเกิด native stepMismatch ให้ใช้ step=any หรือแปลงค่าด้วยเหตุผลที่ชัดเจน

Root รายงาน backend tests 17 ผ่านและทดสอบวันเกิด 2000-02-29 ได้ 109 ปีหลังแก้วันที่ snapshot เป็น 28 ก.พ. ในปีไม่ leap ข้อจำกัด leap-day ก่อนหน้านี้จึงปิดตามผล root ไม่ถือเป็น blocker ที่ยังเปิดอยู่ ผู้ตรวจไม่ได้รันทดสอบนั้นซ้ำ

## Connected ภาพรอบ 1

เปิดดู `connected-desktop-home.png`, `connected-desktop-plan.png`, `connected-mobile-plan.png`, `connected-mobile-slider.png` ด้วยตนเอง ภาพ Material และความสมดุลของ hero ดี ส่วนแผนใช้ surfaces แบ่ง macro/slider/rulers ชัด มือถือจัดชื่อโปรไฟล์/ข้อมูลเกิดและปุ่มครบ ไม่มีการชนกันในภาพที่ตรวจ ชื่อ Local QA เป็นข้อมูลที่ root กรอกทดสอบเอง ไม่ใช่ข้อมูลเริ่มต้นที่แอปสมมติ

**ยังไม่ผ่านรอบสุดท้าย:** native date calendar ในภาพ home สีดำและยังไม่พบ rule แก้ indicator ใน CSS ที่ตรวจ; header sticky บัง kicker ด้านบนของ profile ในภาพ desktop-plan ควรใช้ scroll-margin-top กับปลายทางผลคำนวณ/ข้อมูลเกิดให้สัมพันธ์กับความสูง header ส่งข้อแก้ให้ journey_v2 แล้ว

Source รอบใหม่ปิดประเด็น auth generation catch, pending guest save, saving lock/session+subject guard, manual city recovery และ precision input step=any แล้ว มี birth_data_complete guard สำหรับ profile ข้อมูลไม่ครบ พร้อม section แสดง reading จริงของปีที่เลือกเพิ่มเข้ามา รอ native date/time form revision ที่ implementation agent กำลังทำ

คะแนนชั่วคราวจากภาพที่เห็น: aesthetic 8.5, hierarchy 8 (ติด header offset), readability 8.5, mobile 8.5, macro-to-micro 8.5 ส่วน no-black และ connected profile journey ยังไม่รับรองจนแก้และตรวจหลักฐานเพิ่ม

Root รายงาน browser calculation จริงของ 2000-02-29 เวลา12:00 กรุงเทพฯ ได้ Sun Pisces9°54′47″ house10 และ natal Sun aspects ครบ7, timeline อายุ26/2026 พร้อม rulers จริง, next27/direct108 เลือกเฉพาะMoon/current26 ทำงาน; journal noteบริบทinvestment/save/deleteundo ทำงาน; mobile390 scrollWidth390 ผู้ตรวจรับข้อมูลนี้เป็นผลทดสอบจาก root ไม่ใช่การทดสอบ browser ซ้ำโดย reviewer รอภาพ Sun/reading/advanced และ actual account create/save/select/reload ก่อนสรุป integrated score

## Frozen build — ตรวจภาพ final ชุดแรก

เปิดภาพ home/desktop-plan/mobile-plan ที่อัปเดต และ `connected-mobile-advanced.png` แล้ว ยืนยัน date indicator ในภาพเป็น jade ไม่ใช่ดำ, profile heading ไม่ถูก header ทับ, mobile advanced แสดงแผงวงล้อและ controls โดยไม่มีเนื้อหาล้นขอบที่เห็น ตรวจ CSS มี calendar filter, scroll-margin desktop110px และ header mobile position relative พร้อม scroll-margin18px จึงปิดข้อแก้จากรอบภาพก่อน

Source ปรับ birth name/date/time เป็น uncontrolled inputs รับค่าจาก FormData แล้ว จึงไม่อาศัย React change event ของ native picker เพียงอย่างเดียว ตรวจ profile birth_data_complete guard, saved session state และ Sun filter ต่อเนื่อง ไม่พบ blocker ใหม่ในส่วนที่ตรวจ

Root รายงานทดสอบบัญชีจริงบนฐานข้อมูลแยก localhost8001: create/save A → reload คืน A และอายุ27 → กรอก DOB B คำนวณใหม่อายุ25 → save B → เลือก A กลับอายุ26 ตามวันเกิด A; mobile plan/advanced viewport390 มี scrollWidth390 และ natal SVG328px square; backend tests20 ผ่าน ผลเหล่านี้เป็นหลักฐานจาก root ไม่ใช่ผลที่ reviewer รันซ้ำ

รอภาพ Sun และ rule reading เพื่อปิดการตรวจภาพทั้งหมดก่อนลงคะแนน final เกณฑ์การรับรองจะจำกัดเฉพาะ connected local app ที่ตรวจ ไม่ใช่ production deployment/security audit หรือการรับรองความแม่นยำทุกศาสตร์

## Final scored verdict — connected local PASS

เปิดดู `connected-mobile-sun.png` และ `connected-mobile-reading.png` ชุดสมบูรณ์แล้ว รูป Sun แสดงราศีมีน 9°54′47″ เรือน10 ลองจิจูด339.9130° พร้อมหัวข้อครบ7มุม การ์ดมุมแสดงชื่อคู่มุม ชนิดมุม orb และ applying/separating ส่วนรายการที่อยู่พ้น viewport ตรวจครบผ่าน source filter ทั้ง body1/body2 โดยไม่ได้กล่าวว่า screenshotเดียวแสดงทั้ง7รายการพร้อมกัน

บทอ่านแสดงค่าจริงจาก `selectedYear.reading` แยกในกล่อง "แนวทางตีความจากกฎของระบบ" และป้ายแยกจากข้อมูลตำแหน่งดาว ไม่สวม generic planning prompts เป็นผลคำนวณส่วนบุคคล Source ล่าสุดมี `cleanInterpretation` ครอบข้อความจาก engine จึงไม่แสดง raw ** หรือ backtick ในภาพที่ตรวจ ข้อสงสัย raw markdown จากการอ่านเวอร์ชันก่อนหน้าถูกปิดหลังตรวจ source/image ล่าสุดแล้ว

| หมวด | คะแนน /10 | หลักฐาน/ข้อจำกัด |
|---|---:|---|
| Brief fidelity | 8.5 | Material surfaces/elevation และภาพพิเภก painterly โทนอุ่น; ไม่มีสีดำใน controls หลักที่เห็น |
| Aesthetic craft | 8.5 | ภาพประกอบร่วมกับแผง cream/jade/terracotta และน้ำหนักหัวข้อสม่ำเสมอ |
| Hierarchy | 8.5 | ข้อมูลบุคคล → วงรอบ/ปี → Sun → evidence/interpretation → action; header overlap แก้แล้ว |
| Macro-to-micro และ108ปี | 9 | เลือกข้อมูลจริง0–108, rulers/subperiod เปลี่ยนตามปี, กลับอายุปัจจุบันได้ |
| Readability | 8 | Sun/controls อ่านชัดและไม่ล้น; narrative ยาวยังมีโอกาสแบ่งย่อหน้าและขยายขนาด |
| Color/accessibility | 8 | Date icon เป็นjade, named native inputs, focus/disabled states และการเลือกอายุไม่พึ่งลากอย่างเดียว |
| Mobile | 8.5 | 390px plan/slider/advanced อยู่ในกรอบ; wheel328pxsquare; ภาพSunและreadingไม่ทับกัน |
| Connected interaction | 8.5 | Root ทดสอบ account create/save/reload/select, calculation, age, journal/deleteundo, PDF จริง |
| Audience/tone | 8.5 | เน้นวางแผนจริง แยกข้อเท็จจริงการคำนวณจากคำตีความและการลงทุน; ยังมีศัพท์เฉพาะในข้อมูลเชิงลึก |
| Consistency/data identity | 8.5 | ชื่อ/ข้อมูลเกิดผูกผลคำนวณ, guards ป้องกัน stale session/subject, journalเก็บบริบทจริง |

**Verdict: PASS เฉพาะ connected local UI และ flows ที่มีหลักฐานนี้ ไม่ใช่การรับรอง production ทั้งระบบ** ไม่พบ critical ที่ยังเปิดอยู่หลังแก้ตามรอบ review ไม่ได้นำคะแนน static prototype มาใช้แทนการตรวจรอบนี้

### หลักฐานที่ reviewer ตรวจเอง

- Source `SolarianJourney.tsx`, `App.tsx`, `solarian-journey.css` และ API contract ที่ระบุด้านบน
- ภาพ desktop home/plan, mobile plan/slider/advanced/Sun/reading
- Guest input เริ่มว่างเมื่อไม่มี current profile; ผู้ใช้สามารถแก้พิกัด/UTC; unknown time ไม่ถูกแทนด้วยข้อมูลสมมติ
- Sun filter ครบ, selectedYear/Transit เลือกด้วย age, explicit snapshot date, guard profileข้อมูลไม่ครบ, auth generation, pending save, saving lock, subject guard, native FormData และ UI state จริง

### หลักฐานที่ root ทดสอบและรายงาน

- Backend tests20 ผ่าน; real leap-day calculation ให้109years
- บัญชี create/save A บน isolated8001 → reload A/age27 → คำนวณB/age25 → saveB → เลือกA/age26
- Slider/next/direct108/currentage และ selected period ทำงาน, journalบริบทจริง/save/deleteundo
- Mobile390 plan/advanced scrollWidth390; wheel328square
- PDF endpoint ปัจจุบัน localhost8000 ตอบ200 ขนาด36603bytes; 500 ที่เคยพบจาก8001เป็น process importเก่าก่อนsourcefix จึงปิด blocker PDF ตามผลล่าสุด ไม่ได้อ้างว่าผู้ตรวจเปิดอ่าน layout PDF ทุกหน้าเอง

### ขอบเขตที่ยังไม่รับรองและข้อปรับละเอียด

Production deployment/security, account recovery, payment, live AI, Bazi/relationship/company calculations, ความถูกต้องโหราศาสตร์ทุกกรณี, DSTอัตโนมัติทุกเมือง, native pickerทุกระบบ และ screen readerเต็มรูปแบบอยู่นอกผลPASSนี้ สมุดแผนยังเก็บในbrowserเครื่องนี้ตามข้อความUI

Narrative บนมือถือยังยาวและค่อนข้างแน่น ควรใช้16pxและแยกย่อหน้าตามประเด็นเพื่ออ่านต่อเนื่องได้นาน Root ส่งการปรับfont16pxให้implementation agentแล้ว หากยังไม่เข้ารอบfinal ให้ถือเป็นข้อปรับละเอียด ไม่ใช่อ้างว่าปรับแล้วในภาพที่ตรวจ การ์ด ruler/metadataขนาดเล็กและวงล้อเชิงเทคนิคยังควรทดสอบกับผู้ใช้สายตาเลือนรางและdeviceจริงเพิ่มเติม
