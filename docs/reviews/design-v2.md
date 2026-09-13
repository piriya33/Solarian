# Independent UI review — Solarian design v2

สถานะ: **ผ่านการตรวจต้นแบบ Material + painterly mythical ตามขอบเขตท้ายเอกสาร ทุกหมวด ≥8/10 ไม่มี critical ที่ยังเปิดอยู่ในหลักฐานที่ตรวจ**

ขอบเขต: independent aesthetic/UI review เท่านั้น ไม่แก้ prototype และพักเรื่อง payment ตาม brief ใหม่

## Brief ที่ใช้ตรวจ

- Modern mythical หมายถึง UI แบบ Material ที่มี surfaces/elevation ร่วมกับภาพ mythical แบบ painterly และสัมผัสรอยพู่กัน ไม่ใช่ antique parchment หรือภาพลายเส้นเอกสารโบราณ
- ภาพประกอบต้นฉบับได้แรงบันดาลใจจากพิเภกในบทบาทผู้ให้คำปรึกษาพระราม ใช้ภาพเล่าแนวคิดเรื่องที่ปรึกษาและการวางแผน ไม่ทำให้ interface กลายเป็นหนังสือนิทานสำหรับเด็ก
- อ้างอิงเชิงทิศทางจากภาพที่ผู้ใช้ให้: pastel brushwork, impasto strokes และประติมากรรมเทพโทนอุ่น cream/gold ใช้ texture กับภาพประกอบและรายละเอียดอย่างพอดี ไม่ใช้สีมืดจากภาพอ้างอิง ผู้ตรวจรอบนี้ได้รับคำอธิบายภาพจาก root แต่ยังไม่ได้เปิดดูภาพอ้างอิงต้นฉบับเอง
- ห้ามใช้สีดำทั้งพื้น ตัวอักษร เส้น และเงา ใช้น้ำตาล/terracotta ที่อ่านง่าย
- Sun-first และข้อมูลไล่จาก macro ไป micro
- เหมาะกับผู้วางแผนระยะยาวและชั้นเรียน Astrology for investment planning
- ไม่มีภาพลักษณ์ signal trading หรือคำรับประกันผลลงทุน

## ความขัดแย้งกับ CI เดิม

`design-system/solarian/CI_BRAND_GUIDELINES.md` กำหนด dual-theme, navy/slate และ glassmorphism ซึ่งไม่ตรง brief ใหม่ ส่วน `design-system/solarian/MASTER.md` ระบุประเภท Smart Home/IoT Dashboard, dark tech และเงาดำ rgba(0,0,0) จึงไม่ควรนำมาใช้เป็นเกณฑ์รอบนี้ ข้อกำหนดผู้ใช้ล่าสุดมีลำดับเหนือไฟล์เหล่านี้ ไม่ได้แก้ทับ CI เดิม

## แนวทางก่อนรับภาพ

Palette เดิมสามารถปรับเป็น warm cream canvas `#F6EBDD`, elevated surface `#FFF8EE`, brown ink `#55372B`, secondary `#765443`, terracotta CTA `#A14E36` และเงาน้ำตาลโปร่งใส แต่ไม่ใช้ความเก่าของกระดาษเป็นอัตลักษณ์หลัก ต้องตรวจ contrast ของคู่ที่ใช้จริงก่อนรับรอง

ใช้ภาพพิเภกแบบ painterly เป็น focal point ในพื้นที่แนะนำผลิตภัณฑ์ มีรอยพู่กัน/มิติสัมผัสให้เห็นจริงเมื่อย่อบนมือถือ พื้นที่ใช้งานใช้ Material surfaces ที่แยกชั้นชัด มี radius, elevation และ interaction feedback สม่ำเสมอ ภาพประกอบต้องไม่ทับข้อความหรือกลบ CTA รักษา Sun-first ในโครงสร้างการอ่านและภาษา ไม่จำเป็นต้องบังคับภาพ Sun เดิมมาแข่งกับภาพพิเภก ตัวอักษรไทยเนื้อหา 16–18px ระยะบรรทัดประมาณ 1.7 ใช้หัวข้อสมัยใหม่อ่านชัด หลีกเลี่ยง monospace headline และศัพท์ technical ใน CTA

ลำดับข้อมูลแนะนำ: ภาพใหญ่ชีวิต → วงจรระยะยาว → ปีนี้ → แผน 90 วัน ควรบอกได้เสมอว่าผู้ใช้กำลังดูช่วงเวลาใด

## Rubric และเกณฑ์ผ่าน

ทุกหมวดต้องได้อย่างน้อย 8/10 และไม่มี critical issue คะแนนยังไม่กำหนดจนเห็นภาพ desktop/mobile จริง คะแนน aesthetic ไม่แทนการทดสอบ interaction/accessibility หากยังไม่มีหลักฐานให้ระบุว่ายังไม่ตรวจ

| หมวด | สิ่งที่ตรวจ | คะแนน |
|---|---|---|
| Brief fidelity | Material surfaces/elevation + painterly mythical และไม่มีสีดำ | รอหลักฐานใหม่ |
| Aesthetic craft | พิเภก/ภาพเทพ รอยพู่กัน มิติสัมผัส และ composition เหมาะกับผู้ใหญ่ | รอหลักฐานใหม่ |
| Hierarchy | Sun-first และ CTA/หัวข้อที่เข้าใจได้ทันที | รอหลักฐาน |
| Macro-to-micro | ภาพใหญ่ก่อนรายละเอียด ลำดับช่วงเวลาชัด | รอหลักฐาน |
| Readability | ไทยอ่านง่าย ไม่ตัดวรรณยุกต์ ไม่แน่นเกินไป | รอหลักฐาน |
| Color/accessibility | Contrast, focus, semantic และไม่ใช้สีอย่างเดียว | รอหลักฐาน |
| Mobile | ไม่มี overflow, tap targets, ลำดับข้อมูลจอเล็ก | รอหลักฐาน |
| Interaction affordance | เห็นว่าส่วนใดคลิกได้และมี feedback | รอหลักฐาน |
| Audience/tone | long-term planner/classroom ไม่เหมือน trading signal | รอหลักฐาน |
| Consistency | tokens, type, Material surfaces/elevation, illustration treatment และ spacing สม่ำเสมอทั้งหน้า | รอหลักฐานใหม่ |

Critical examples: พบสีดำ, ข้อความสำคัญอ่านไม่ได้, CTA หลักใช้งานไม่ได้, ข้อมูล/ปุ่มหลุดจอมือถือ, สื่อว่ารับประกันผลการลงทุน

## Review log

1. อ่าน brief และ CI เดิมแล้ว ส่ง guidance ให้ผู้สร้าง prototype; รอภาพ desktop/mobile และหลักฐานตรวจพฤติกรรม

### รอบ 1 — ตรวจภาพและโค้ด prototype

**หมายเหตุหลังผู้ใช้แก้ brief:** รอบนี้ตรวจแนว antique parchment เดิม คะแนนและคำแนะนำเชิง aesthetic ด้านล่างเป็นบันทึกประวัติเท่านั้น ไม่นำมารับรองงานตาม brief ใหม่ การแก้ mobile/readability ยังใช้เป็นข้อมูลประกอบได้ แต่ข้อกำหนดให้ Sun illustration อยู่เหนือ fold ถูกแทนที่ด้วยลำดับชั้นภาพพิเภกและเนื้อหา Sun-first ตาม brief ปัจจุบัน

**ผล: ยังไม่ผ่าน ต้องแก้และส่งภาพใหม่**

เปิดดูภาพทั้งหกไฟล์ใน `docs/reviews/screenshots/` แล้ว ภาพ `desktop-connections.png`, `mobile-home.png`, `mobile-atlas.png` ใช้ตรวจได้ ส่วน `desktop-home.png` ถูกตัดขวาเป็นภาพแคบ, `desktop-atlas.png` มี render ซ้ำและพื้นที่ว่างผิดสัดส่วน, `mobile-reading.png` ถูกตัดจบเนื้อหาตรงกลาง viewport จึงไม่ใช้ภาพสามไฟล์หลังตัดสิน layout ว่าผ่านหรือเสีย ขอภาพ viewport ใหม่ fullPage:false

จุดที่ผ่านเชิงทิศทาง: parchment/terracotta และ brown ink ดูอบอุ่นโดยไม่สูญเสียความน่าเชื่อถือ ภาพผู้ร่วมทางมีจังหวะหัวข้อ/ข้อความ/การ์ดชัดเจน รูปแบบกรอบเส้นบางและเลข serif ทำงานร่วมกับไทยได้ดี ภาพ Sun มีลายเส้นและบุคลิกที่เหมาะกับ modern mythical

ข้อแก้จำเป็น:

1. **Hierarchy / Sun-first 7/10:** mobile-home แสดง Sun หลักเกือบพ้น viewport แรก เห็นเพียงครึ่งหนึ่งหลังข้อความทั้งหมด ควรจัด Sun แบบ compact ให้เห็นเด่นก่อน CTA เช่นเคียง eyebrow/ก่อน intro หรือย่อระยะ hero โดยรักษาขนาด CTA และความชัดของ headline
2. **Readability 7/10:** `.reading-summary` มือถือ 14px และ narrative ของหลายส่วน 14px เหมาะเพิ่มเป็นอย่างน้อย 16px สำหรับข้อความบทอ่าน/คำถาม/การลงมือทำ ส่วนป้าย metadata ใช้ขนาดเล็กได้
3. **Mobile evidence:** ขอ viewport กลาง/ท้าย reading และ home/atlas desktop ใหม่เพื่อแยกปัญหา compositor ออกจาก layout ก่อนให้คะแนนสุดท้าย

คะแนนชั่วคราวจากหลักฐานที่อ่านได้: brief fidelity 8.5; aesthetic craft 8.5; hierarchy 7; macro-to-micro 8.5; readability 7; color/accessibility 8 (ด้าน color + markup เท่านั้น); mobile 7.5 (ยังต้องภาพ reading); interaction affordance 8 (ยังไม่ทดสอบพฤติกรรมเอง); audience/tone 9; consistency 8.5 ไม่ใช่คะแนนรับรองรอบสุดท้าย

ตรวจ token contrast ด้วยสูตร relative luminance: ink/paper 9.07:1, muted/paper 5.72:1, rust/surface 5.44:1, muted/surface 6.38:1 จึงใช้กับข้อความปกติได้ ส่วน gold/paper 3.33:1 และ line/surface 1.93:1 ควรสงวนให้ภาพ/เส้นตกแต่ง ไม่ใช้เป็นข้อความเล็ก ตรวจ source พบ focus-visible, reduced-motion, native dialog, named brand และ brown shadow/backdrop ไม่พบ black literal ใน prototype ที่ตรวจ ทั้งนี้ยังไม่เท่ากับทดสอบ keyboard/screen reader จริง

### รอบใหม่ — Material + painterly mythical

Root แจ้งว่ากำลังสร้างภาพพิเภกต้นฉบับและปรับ prototype ผู้ตรวจอัปเดต brief/rubric แล้ว ไม่แก้ application หรือ prototype และรอภาพ desktop/mobile ชุดสุดท้ายก่อนให้คะแนน ทุกหมวดยังคงต้องได้อย่างน้อย 8/10 และไม่มี critical issue คะแนนเดิมไม่ยกมาผ่านอัตโนมัติ

### Material รอบ 1 — ภาพ hero และ atlas mobile

เปิดดู `material-desktop-home.png` (1440×1000), `material-mobile-home.png` (390×844), `material-mobile-atlas.png` พร้อมตรวจ HTML/CSS ปัจจุบันด้วยตนเอง ภาพชุดนี้ไม่มีอาการ compositor แบบชุดแรก

**ผลชั่วคราว: ทิศทางผ่านเชิงภาพ แต่ยังไม่ผ่าน gate ทั้งหมด รอแก้ date icon และหลักฐาน reading/desktop atlas**

ภาพพิเภกมีมิติแบบประติมากรรมและ painterly พื้นผิวโทน cream/gold/sage/terracotta มีรายละเอียดเนื้อวัสดุ ไม่ใช่ antique linework UI แยกผิวและระดับด้วยแผงมนและเงาสีน้ำตาลชัดเจน Desktop แบ่งภาพกับ copy สมดุล มือถือให้ CTA เข้าถึงก่อนภาพและยังเห็นตัวละครหลักใน viewport เดียว จึงไม่ถือว่าต้องย้ายภาพขึ้นแข่ง headline อีก Body hero และ reading ปรับเป็น 16px แล้ว

**ข้อแก้จำเป็น:** native calendar indicator ในภาพ mobile-atlas ยังแสดงเป็นสีดำ ขัดเงื่อนไข no-black ที่ใช้กับ UI ทั้งหมด ควรเปลี่ยนเป็น SVG น้ำตาล/terracotta โดยรักษาการเลือกวันที่ผ่าน keyboard และพื้นที่กด หรือใช้วิธีเปลี่ยนสี indicator ที่ตรวจภาพยืนยันได้ ไม่ปิดการใช้งาน date input เพื่อแก้สี

คะแนนชั่วคราว: brief fidelity 7.5 (date icon ยังดำ); aesthetic craft 8.5; hierarchy 8.5; macro-to-micro 8.5; readability 8.5; color/accessibility 7.5 (รอ icon และพฤติกรรม date); mobile 8; interaction affordance 8 จากภาพ/markup; audience/tone 9; consistency 8.5 ยังไม่ใช่คะแนนรับรองรอบสุดท้าย

ขอบเขตการรับรอง: ผู้ตรวจเห็นภาพหลักและอ่าน source แล้ว แต่ยังไม่ได้เปิดปุ่ม/modal จริง ต้องแนบผลทดสอบ interaction จาก root และตรวจภาพ reading/desktop atlas เพิ่มก่อนปิดรอบ ส่วน artwork ไม่มีการใช้พื้นดำหรือโทนดำเด่นในภาพที่ตรวจ ไม่ได้อ้างว่าตรวจสีทุกพิกเซลของภาพ raster

### Material รอบสุดท้าย — scoped prototype PASS

เปิดดูภาพ `material-desktop-atlas.png`, `material-desktop-slider.png`, `material-mobile-slider.png`, `material-mobile-reading.png` ด้วยตนเอง และตรวจ source ล่าสุดของ HTML/CSS/JS เพิ่มเติม ร่วมกับภาพ hero ที่ตรวจรอบก่อน การจัดหน้า reading บนมือถืออ่านง่าย มีพื้นที่ระหว่างคำถาม สิ่งที่ลงมือทำ และ CTA ไม่ทับกัน Desktop แยกพื้นที่ explorer, Solar Core และ action อย่างชัดเจน สี sage/cream ช่วยแยกหน้าที่ของ surfaces โดยยังอยู่ในระบบเดียวกัน

เก็บ 108-year slider ตามคำขอล่าสุดแล้ว: native range 0–108 step 1, มีปุ่มปีก่อน/ถัดไป, กรอกอายุโดยตรง และแสดงปีที่เลือกตลอดเวลา กลไกนี้ช่วยให้ทั้งการสำรวจภาพกว้างและการเลือกค่าที่แม่นยำทำได้ ไม่บังคับลากอย่างเดียว ป้ายระบุว่าข้อมูลยังเป็นตัวอย่างและไม่ได้ปลอมผลคำนวณจริง

| หมวด | คะแนนสุดท้าย /10 | หลักฐานและเหตุผล |
|---|---:|---|
| Brief fidelity | 8.5 | Material elevation/surfaces และภาพ mythical painterly ตรง brief ใหม่ ใช้ warm palette |
| Aesthetic craft | 8.5 | พิเภกมี texture/มิติและบทบาทที่ปรึกษา ภาพกับ UI ไม่แย่งกัน |
| Hierarchy | 8.5 | Hero มี CTA ชัด บทอ่านแยก explorer → Solar Core → reflection/action |
| Macro-to-micro | 9 | มีลำดับชีวิต/บทชีวิต/ปี/90วัน/วันนี้ และกลับมาเลือกอายุทีละปีได้ |
| Readability | 8.5 | Narrative 16px พร้อม leading และระยะห่างที่เหมาะ ไม่มีการชนวรรณยุกต์ในภาพที่ตรวจ |
| Color/accessibility | 8 | Ink/CTA ชัด, focus-visible เห็นในภาพ, native controls มี labels และการใช้งานไม่พึ่งลากอย่างเดียว |
| Mobile | 8.5 | 390px แสดง slider/ปุ่ม/ช่องอายุและบทอ่านครบ ไม่มีเนื้อหาทับกัน |
| Interaction affordance | 8.5 | ปุ่มเลือกปี/next/prev/direct entry ชัด มี selected/disabled/focus และผลทดสอบจาก root |
| Audience/tone | 9 | วางแผนระยะยาว ใช้ข้อมูลจริงประกอบ ไม่อ้างเป็นสัญญาณซื้อขาย |
| Consistency | 8.5 | Rounded surfaces, brown shadows, terracotta CTA และลำดับ typography สม่ำเสมอ |

**ผล: PASS เฉพาะต้นแบบที่ตรวจ ทุกหมวด ≥8 และไม่มี critical issue ที่ยังเปิดอยู่ตามหลักฐานนี้** คะแนนเป็น professional review judgment ไม่ใช่ผลทดลองผู้ใช้หรือคะแนนมาตรฐานอัตโนมัติ

สิ่งที่แก้จากรอบก่อน: source เพิ่มสี terracotta ให้ native calendar indicator; ไม่ตัดการใช้งาน date input; number spinner สีเทาถูกนำออกด้วย CSS หลังถ่ายภาพ mobile-slider ผู้ตรวจยืนยันการแก้สองรายการจาก source ส่วนภาพ mobile-slider ที่แนบยังเป็นก่อนลบ spinner ไม่อ้างว่าเป็นภาพหลังแก้แล้ว CSS ของ controls/surfaces/shadows ใช้สีในระบบน้ำตาล/terracotta/sage ไม่พบ black literal ในส่วนที่ตรวจ ขอบเขตนี้ไม่รับรองสีของ system picker/browser chrome ทุกระบบหรือทุกพิกเซลของ artwork

**หลักฐานพฤติกรรมที่ root ทดสอบและรายงานให้ผู้ตรวจ** (ผู้ตรวจไม่ได้ควบคุม browser tab ซ้ำ): ArrowRight 40→41; Next→42; direct entry 108 ทำให้ Next disabled; 0 ทำให้ Prev disabled; viewport 390 มี scrollWidth 390; horizon/focus คงอยู่หลัง reload ผ่าน URL; date change และกลับสู่วันนี้ทำงาน; journal กันเพิ่มซ้ำและ delete/undo กู้คืน 1 รายการได้; unknown time ปิดช่องเวลาและนำ required ออก; Escape ปิด dialog แล้วคืน focus ไป opener; JS syntax ผ่าน Source ที่ตรวจสอดคล้องกับพฤติกรรมที่รายงาน

**ขอบเขตที่ยังไม่รับรอง:** live AI, ความถูกต้องของโหราศาสตร์, บัญชี/การบันทึกโปรไฟล์, payment, การเก็บข้อมูลข้ามอุปกรณ์, screen reader เต็มรูปแบบ, Safari/Firefox/native pickers ทุกระบบ, ขนาดจออื่นนอกภาพที่ตรวจ และผล conversion จริง สิ่งเหล่านี้ไม่ใช่ฟังก์ชันที่ต้นแบบนี้สัญญาว่าพร้อม production

ข้อสังเกตปรับละเอียดภายหลังที่ไม่บล็อกรอบนี้: slider track สีอ่อนและ metadata บางส่วนขนาดเล็กควรตรวจเพิ่มกับผู้ใช้สายตาเลือนราง; ตอนนำไปใช้จริงควรลดข้อความอธิบายข้อจำกัดของ prototype และแทนด้วยสถานะ/ที่มาข้อมูลจริง รวมถึงทดสอบ browser date picker แยกตามแพลตฟอร์ม

**หลักฐานเพิ่มเติมก่อนปิดรอบ:** เปิดดู `material-mobile-slider-360.png` แล้ว ยืนยัน spinner ถูกนำออกจริงในภาพ 360px ปุ่มก่อน/ถัดไปและช่องอายุยังอยู่ครบ ไม่มีการชนหรือหลุดขอบในภาพ Root ตรวจ DOM ได้ width=scrollWidth=360 เพิ่มเติมจาก 390px ตรวจ source พบ `contextLabel()` เก็บอายุที่เลือกและวันที่อ้างอิงไว้กับแผน/ร่างคำถามแล้ว จึงรักษาบริบทของ slider เมื่อทำงานต่อได้ ข้อมูลนี้ขยายขอบเขต mobile ที่ตรวจเป็น 360px และ 390px คะแนนและ scoped PASS ข้างต้นยังคงเดิม
