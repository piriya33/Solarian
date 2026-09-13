# CI proposal: Modern Tactile Mythical

สถานะ: ทิศทางภาพล่าสุดสำหรับ `design-preview/` ตาม brief 13 กันยายน 2026 เอกสารนี้แทนที่แนว parchment/editorial line-art เดิม แต่ยังรักษา product architecture, journey แบบ macro-to-micro, ลำดับ Sun-first, ขอบเขต pilot และข้อกำหนด accessibility เดิม

## ชื่อยังไม่สรุป

ชื่อที่ใช้ทดสอบได้ในรอบนี้คือ **Phiphek · พิเภก**, **Phiphek Atlas**, **สุริยวิถี · Solar Atlas** และ **Solarian Atlas** ทุกชื่อเป็น provisional option ไม่มีชื่อใดเป็นชื่อแบรนด์สุดท้าย และยังไม่ได้ตรวจโดเมน เครื่องหมายการค้า หรือความพร้อมใช้เชิงพาณิชย์

## Creative idea

**A celestial adviser you can think with.**

เรื่องเล่าได้แรงบันดาลใจจากพิเภกในฐานะผู้รู้ดูดาวและที่ปรึกษาของพระราม: มองเห็นจังหวะจากภาพใหญ่, อธิบายเหตุผล และช่วยเปลี่ยนข้อมูลเป็นแผนที่ทบทวนได้ บุคลิกจึงเป็นผู้ให้มุมมองและปัญญา ไม่ใช่ผู้รับประกันอนาคต ผู้ตัดสินชะตา หรือผู้ส่งสัญญาณซื้อขาย

ภาษาภาพเป็น **Thai-celestial mythical painting** ที่มีผิวสีหนาแบบ impasto: ผิว jade, เครื่องทรง antique gold, ดอกไม้และผ้าสี coral, เมฆ ivory, สถาปัตยกรรมลอยฟ้า และเครื่องมือวงโคจร องค์ประกอบเหล่านี้สร้างความทรงจำทางแบรนด์ ขณะที่ข้อมูลและการตัดสินใจยังอยู่บน UI ที่สะอาด

## ทิศทางเดิมที่ถูกแทนที่

ไม่ใช้ texture กระดาษเก่า, hero แบบภาพเส้น, card กระดาษแบน, serif editorial ใน control หรือองค์ประกอบที่ทำให้ interface ดูเหมือนหน้าหนังสือโบราณเป็นภาษาหลัก และไม่ใช้สีดำ สีเกือบดำ black overlay หรือ black drop shadow

การเปลี่ยนนี้เป็น visual reskin จึงไม่เปลี่ยน navigation หลักสามส่วน, time horizons, Solar core, supporting signals, reading, journal, connections, Bazi หรือข้อกำหนดเรื่องข้อมูลและหลักฐาน

## Visual reference

ภาพอ้างอิงหลักของรอบนี้คือ `design-preview/assets/phiphek-material.png`

- ใช้ mood ของพิเภกถือดวงอาทิตย์และอ่านแผนที่ฟ้าเป็นภาพแทนบทบาท celestial adviser
- ใช้ texture สีวาดหนาและคู่สี ivory/jade/gold/coral เป็นจุดตั้งต้น ไม่คัดลอก composition เดียวกันทุกหน้า
- ทำ art-directed crop แยก desktop และ mobile พร้อมกำหนด `width`, `height` หรือ `aspect-ratio` เพื่อกัน layout shift
- ภาพเป็น generated concept asset และไม่ใช่หลักฐานทางประวัติศาสตร์ ก่อนเผยแพร่กว้างต้องตรวจความเหมาะสมทางวัฒนธรรม รายละเอียดเครื่องแต่งกาย และสิทธิ์การใช้งานตาม workflow จริง

## บุคลิก

| คุณลักษณะ | การแสดงออกใน interface |
|---|---|
| Modern | ลำดับข้อมูลชัด, spacing โปร่ง, typography อ่านง่าย, control ตรงไปตรงมา |
| Tactile | surface ยกตัว, มุมมน, เงาสีอ่อน, top highlight และ pressed/selected state ที่เห็นได้ |
| Mythical | ภาพ impasto ของเทพ ที่ปรึกษา ดวงอาทิตย์ และจักรวาลในจุดหลัก ไม่แทรกทุก card |
| Wise | อธิบายเหตุผล ที่มา ข้อจำกัด และทางเลือกก่อนข้อเสนอให้ลงมือ |
| Calm | ใช้สีอ่อน จังหวะพื้นที่นิ่ง และ motion สั้นที่มีหน้าที่ ไม่สร้างความเร่งด่วนเทียม |

## สี: no black

| Token | สี | หน้าที่ |
|---|---|---|
| canvas | `#F7F1E5` | พื้นหลักสี warm ivory |
| surface | `#FFF9EF` | card และพื้นที่อ่าน |
| surface-raised | `#FFFDF8` | surface ที่ยกขึ้นหรือ interactive |
| surface-jade | `#E3E9DF` | พื้นรอง section และ selected wash |
| ink | `#38483F` | ข้อความหลัก deep jade |
| ink-muted | `#665C50` | ข้อความรอง warm umber |
| primary-jade | `#5F795F` | CTA, focus, active |
| primary-on | `#FFFDF8` | ข้อความบน primary |
| coral | `#B45F47` | จุดเน้นและ state รอง |
| gold | `#B48743` | accent ตกแต่ง ไม่ใช้เป็นข้อความ body |
| outline | `#D8C8AE` | เส้นแบ่งและขอบ surface |
| success | `#4F745B` | สถานะสำเร็จพร้อม label |
| caution | `#9A613E` | คำเตือนพร้อม label |

เงาใช้สีจาก jade/umber เช่น `rgba(75, 89, 73, 0.16)` และใช้ border/top highlight ช่วยบอกระดับ ห้ามมี `#000`, black alpha, สีเกือบดำ, black overlay หรือ black drop shadow ใน background, text, icon, illustration treatment และ component states ทุกสีข้อความต้องผ่าน contrast ตามขนาดจริง

## Typography

- ใช้ **Noto Sans Thai** สำหรับ interface และบทอ่าน เพื่อความชัดบนไทยและจอเล็ก
- Body เริ่มที่ 16px และ line-height 1.6–1.8; ข้อมูลสำคัญและข้อจำกัดไม่ใช้ micro text
- Heading ใช้น้ำหนัก 600–700 และลดจำนวนระดับเพื่อให้ hierarchy ชัด
- ค่าตัวเลข เวลา และองศาใช้ tabular numerals เมื่อเทียบแถวต่อแถว
- ฟอนต์ display เชิง mythical ใช้ได้เฉพาะชื่อหรือ hero สั้น ๆ หลังตรวจวรรณยุกต์ ห้ามใช้กับ control และบทอ่านยาว

## Material surfaces และ elevation

| ระดับ | รูปแบบ | การใช้งาน |
|---|---|---|
| Canvas | พื้นเรียบ ไม่มี texture รบกวน | ฉากหลังและพื้นที่เลื่อน |
| Raised surface | radius 20–24px, border อ่อน, เงาสี jade/umber และ top highlight | card, time horizon, journal item |
| Focused surface | radius 24–28px, elevation ชัดขึ้น | reading panel, dialog, selected decision |

ปุ่มและ segmented control ใช้ radius 14–18px, target อย่างน้อย 44×44px และความสูงหลักราว 48px ทุก control ต้องมี default, hover, focus-visible, pressed, selected และ disabled state ที่แยกได้ด้วยรูปร่าง/ข้อความร่วมกับสี กดแล้วให้การเคลื่อนที่สั้นและสุภาพ พร้อมเคารพ `prefers-reduced-motion`

## Illustration system

- ใช้ภาพหลักเป็น hero หรือ section anchor โดยทั่วไปไม่เกินหนึ่งภาพเด่นต่อ viewport
- เตรียม crop สำหรับ 16:10 หรือ 4:3 บน desktop และ 4:5 หรือ 1:1 บน mobile โดยรักษาใบหน้า มือ ดวงอาทิตย์ และแผนที่ฟ้า
- Alt text อธิบายหน้าที่ตามบริบท เช่น “พิเภกถือดวงอาทิตย์และอ่านแผนที่ฟ้า ภาพแทนการให้คำปรึกษาจากภาพใหญ่” ไม่บรรยายทุกสีเมื่อไม่จำเป็น
- แยก illustration ออกจาก chart และ evidence panel อย่างชัดเจน ภาพไม่แสดงองศาหรือเหตุการณ์ที่อ้างว่าเป็นข้อมูลจริง
- หลีกเลี่ยงภาพล้อเลียน ภาพปีศาจน่ากลัว stereotype ทางชาติพันธุ์ และ battle pose เพราะขัดกับบทบาทผู้ให้คำปรึกษา

## Component direction

- **App shell:** navigation สามส่วนชัดเจน มี active state แบบ raised/filled และกลับจุดเดิมได้
- **Hero:** ให้คุณค่าของเครื่องมือก่อนภาพ; ใช้ภาพพิเภกช่วยจำแบรนด์โดยไม่ดัน CTA หลุดจอ
- **Time horizon:** เรียง 108 ปี → บทชีวิต → ปี → 90 วัน → วันนี้ พร้อมความสัมพันธ์กับภาพใหญ่และ selected state ที่ screen reader อ่านได้
- **Solar core:** surface เด่นก่อน supporting signals แสดง Sun และ aspects-to-Sun ที่ผ่านเกณฑ์พร้อมที่มา
- **Supporting signals:** ลด elevation และ visual weight เพื่อไม่แย่งแกนอาทิตย์
- **Reading and actions:** จำกัดความกว้างบรรทัด, แยกทางเลือก/เงื่อนไข/หนึ่งก้าว, เปิดหลักฐานได้
- **Journal:** แสดงผลตอบรับหลังบันทึก, undo, local-only label และเปิดกลับได้
- **Connections:** แยกคู่ครอง หุ้นส่วนธุรกิจ บริษัท และคนกับบริษัท ไม่ใช้ template เดียวกัน
- **Bazi:** อยู่ในพื้นที่ opt-in experimental แยกจาก Solar core และระบุว่าไม่ผสานผลอัตโนมัติ
- **Forms:** label จริง, error ใกล้ field, uncertainty control สำหรับเวลาเกิด และคำยืนยันว่า prototype ไม่บันทึกข้อมูล

## Responsive web และ mobile future

ตรวจอย่างน้อยที่ 375, 768, 1024 และ 1440px โดยไม่มี horizontal scroll เนื้อหาหลักต้องทำงานด้วยคอลัมน์เดียวก่อน ภาพ hero บน mobile ใช้ crop ที่เตรียมไว้ ไม่ย่อภาพ desktop ทั้งผืนจนตัวละครเล็ก การวางระบบ token, component states และ information architecture ต้องนำไปใช้กับ mobile app ภายหลังได้ โดยรอบ pilot ยังเป็น responsive web

## Accessibility และความไว้วางใจ

- รองรับ keyboard ทั้ง journey, focus-visible ที่ตัดกับทุก surface, Escape/focus return สำหรับ dialog และ live region สำหรับผลบันทึกหรือเปลี่ยนบทอ่าน
- ห้ามใช้สีอย่างเดียวบอก selected, success, caution หรือ experimental
- ภาพตกแต่งใช้ alt ว่าง ภาพที่สื่อ brand story ใช้ alt แบบกระชับ และ control icon ต้องมี accessible name
- แสดง Demo/pilot, local-only, ไม่มี live calculation, Bazi experimental และข้อจำกัดเรื่องการลงทุนในจุดที่ผู้ใช้ตัดสินใจ
- ไม่ใช้ภาพหรือภาษาให้ความรู้สึกว่าเทพรับรองความถูกต้องของคำคำนวณหรือผลลัพธ์ทางการเงิน

## Reskin acceptance gate

- ไม่มีสีดำ สีเกือบดำ black alpha, black overlay หรือ black shadow ใน interface และ asset treatment
- Surface ยกตัว มุมมน และ state ของ component สอดคล้องกันทั้งหน้า
- ภาพ `phiphek-material.png` มี crop ที่เหมาะกับ breakpoint, ขนาดกัน layout shift และ alt text ตามหน้าที่
- Solar core ยังเด่นก่อน supporting signals และ journey macro-to-micro ยังครบ
- ป้าย Demo/pilot, local-only, no live calculation, Bazi experimental และขอบเขต connection ยังอยู่ครบ
- Keyboard, focus, screen reader state, contrast และ viewport 375/768/1024/1440 ผ่านการตรวจ
- คะแนน UX/UI ในขอบเขต prototype ต้องอย่างน้อย 8/10 และไม่มี critical issue

หลัง reskin ให้สร้าง screenshot ชุดใหม่และบันทึกผลใน `docs/reviews/design-v2.md` คะแนน visual นี้ไม่แทนการตรวจความถูกต้องของ engine หรือ production readiness
