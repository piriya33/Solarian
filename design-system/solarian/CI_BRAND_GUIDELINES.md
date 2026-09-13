# Solarian Corporate Identity (CI) & Brand Guidelines Reference

> **Brand Core:** "Entropy & Celestial Order — การวางแผนชีวิตด้วยพลวัตดวงดาวและเอนโทรปีของเอกภพ"  
> **Version:** 2.0 (Dual-Theme & High-Precision Astrological Engine)  
> **Target Platforms:** Responsive Web (Mobile 375px+ → Desktop 4K) & Native Mobile App

---

## 1. Brand Philosophy & Core Identity

Solarian ไม่ใช่แค่แอปดูดวงแบบดั้งเดิม แต่เป็น **Life-Planning & Celestial Decision Engine** ที่ผสาน:
1. **Mathematical Precision (ความแม่นยำดาราศาสตร์สูงสุด):** Swiss Ephemeris JPL DE431 แม่นยำระดับฟิลิปดา (0.0001°)
2. **Cosmic Entropy & Time Dynamics (กาลเวลาและเอนโทรปี):** แผนที่วงจรชีวิตมหาทักษา 108 ปี (Maha Thaksa) ที่มองชีวิตเป็นกระบวนการคลี่คลายของพลังงานจากภาพใหญ่ (Macro Climate) สู่เหตุการณ์ย่อย (Micro Trigger)
3. **Psychological & Actionable Clarity (ความชัดเจนทางจิตวิทยาและการลงมือทำ):** สังเคราะห์บุคลิกภาพสามมิติ (อาทิตย์-ลัคนา-จันทร์) และคู่มุมดาวเพื่อมอบ "คานงัดแห่งชีวิต" ที่นำไปใช้ได้จริง

---

## 2. Color Palette & Semantic Tokens (Dual-Theme Matrix)

การออกแบบใช้ระบบ **Dual-Theme** ที่สะท้อนสองมิติของจักรวาล:
* **Dark Mode ("Cosmic Deep Space"):** ดำดิ่งสู่ห้วงอวกาศลึก ลึกลับ สงบ มีสมาธิ ไร้แสงสะท้อนรบกวนสายตา
* **Light Mode ("Celestial Dawn / Solar Parchment"):** สว่างนวลตา ดุจแสงอรุณแรกของสุริยคติ สะอาดตาแบบเอกสารวิชาการดาราศาสตร์ชั้นสูง

| Role / Element | Dark Mode Token | Dark Hex | Light Mode Token | Light Hex | Usage & Purpose |
|:---|:---|:---:|:---|:---:|:---|
| **App Canvas / Background** | `--color-background` | `#080c18` | `--color-background` | `#f8fafc` | พื้นหลังหลักของระบบ |
| **Card / Surface Canvas** | `--color-card` | `#0f172a` (85%) | `--color-card` | `#ffffff` (95%) | แผงการ์ด Glassmorphic |
| **Card Surface Border** | `--color-card-border` | `rgba(51, 65, 85, 0.6)` | `--color-card-border` | `rgba(226, 232, 240, 0.9)` | เส้นขอบการ์ดบาง 1px |
| **Primary Text / Heading** | `--color-text-primary` | `#f8fafc` | `--color-text-primary` | `#0f172a` | หัวข้อและข้อความหลัก (Contrast > 7:1) |
| **Secondary Text** | `--color-text-secondary` | `#94a3b8` | `--color-text-secondary` | `#475569` | คำอธิบายรองและ Subtitle |
| **Muted / Caption Text** | `--color-text-muted` | `#64748b` | `--color-text-muted` | `#64748b` | หน่วยวัดและตัวเลขประกอบ |
| **Solar Accent (Primary)** | `--color-accent-gold` | `#f59e0b` | `--color-accent-gold` | `#d97706` | สุริยะทองคำ, ปุ่ม Active, จุดเน้นหลัก |
| **Stellar Blue (Angles)** | `--color-accent-cyan` | `#38bdf8` | `--color-accent-cyan` | `#0284c7` | ลัคนา (AC), เมอริเดียน (MC), เรือนชะตา |
| **Harmonious Aspects** | `--color-aspect-soft` | `#3b82f6` | `--color-aspect-soft` | `#2563eb` | มุมเกื้อหนุน (ตรีโกณ 120° / โยค 60°) |
| **Challenging Aspects** | `--color-aspect-hard` | `#f43f5e` | `--color-aspect-hard` | `#e11d48` | มุมท้าทาย (ฉาก 90° / เล็ง 180°) |

### The 4 Elements Semantic Colors (ธาตุทั้งสี่)
* **Fire (ธาตุไฟ - เมษ, สิงห์, ธนู):** Crimson `#ef4444` | Soft Background `rgba(239, 68, 68, 0.14)`
* **Earth (ธาตุดิน - พฤษภ, กันย์, มังกร):** Emerald `#10b981` | Soft Background `rgba(16, 185, 129, 0.14)`
* **Air (ธาตุลม - เมถุน, ตุลย์, กุมภ์):** Solar Amber `#f59e0b` | Soft Background `rgba(245, 158, 11, 0.14)`
* **Water (ธาตุน้ำ - กรกฎ, พิจิก, มีน):** Starlight Sky `#38bdf8` | Soft Background `rgba(56, 189, 248, 0.14)`

---

## 3. Typography & Hierarchy

ฟอนต์จับคู่มาตรฐานสากล:
1. **Body & Narrative Typography: `Fira Sans` / `Prompt` / System UI**
   * ใช้สำหรับข้อความบทวิเคราะห์ ภาษาไทยและอังกฤษ
   * น้ำหนัก: Regular (400), Medium (500), Bold (700)
   * Leading (Line-height): 1.6 เพื่อการอ่านที่สบายตา
2. **Astronomical & Precision Data Typography: `Fira Code` (Monospace)**
   * ใช้สำหรับตัวเลของศา, ลิปดา, ฟิลิปดา (DMS), เวลา Julian Day, Delta T, และค่าพิกัด
   * ป้องกันตัวเลขสั่นไหวและเรียงคอลัมน์ได้ตรงกันในทุกตาราง

---

## 4. Iconography Standards: Zero Emoji Policy

> [!IMPORTANT]
> **กฎเหล็กด้าน Iconography:** ห้ามใช้อิโมจิระบบ (System Emojis เช่น ♈, ♉, ♊) ในองค์ประกอบหลักของ UI  
> **เหตุผล:** อิโมจิแสดงผลสีสันและสไตล์ไม่เหมือนกันในแต่ละ OS (iOS vs Android vs Windows) ทำให้แอปดูขาดความเป็นมืออาชีพ

* สัญลักษณ์จักรราศีทั้ง 12 ราศี ต้องใช้ **Bespoke Vector SVG Paths (`ZodiacIcon.tsx`)**
* สัญลักษณ์ระบบทั่วไป ใช้ **Lucide React SVG Icons** (เช่น `<Compass />`, `<Network />`, `<Zap />`, `<Brain />`)

---

## 5. Responsive Layout & Anti-Overflow Guidelines

1. **Breakpoints Matrix:**
   * Mobile Portrait: `< 640px` (`sm`) — คอลัมน์เดี่ยว, ป้ายตัวย่อ, ทัชทาร์เก็ต $\ge 44\text{px}$
   * Tablet: `640px – 1024px` (`md`, `lg`) — กริด 2 คอลัมน์แบบยืดหยุ่น
   * Desktop Hero: `> 1024px` (`xl`, `2xl`) — วงล้อ Placidus กว้างขวาง 7 คอลัมน์ ควบคู่การ์ดวิเคราะห์ 5 คอลัมน์
2. **Defensive Layout Design (ป้องกันการหลุดช่อง):**
   * องค์ประกอบที่มีช่วงเวลาน้อย (เช่น แถบมหาทักษา 6 ปีในจอมือถือ) ต้องมีกลยุทธ์ย่อเป็นสัญลักษณ์หรือเปลี่ยนเป็น Card Scrubber แทนการพยายามยัดข้อความในกรอบแคบ
   * ข้อความสำคัญต้องมี `truncate` หรือ `break-words` ร่วมกับ `min-w-0` ใน Flex/Grid Container เสมอ

---

## 6. Voice & Tone (การสื่อสารและบทวิเคราะห์)

* **น้ำเสียง:** สุขุม, ลึกซึ้ง, ปราศจากความงมงาย, ชี้แนะแนวทางพัฒนาตนเอง (Self-Empowerment)
* **ตรงประเด็น (Direct & Punchy):** ไม่อ้อมค้อม ชี้ให้เห็น:
  1. *พลวัตคืออะไร*
  2. *จุดแข็งและโอกาส*
  3. *จุดควรระวังที่ต้องบริหารจัดการ*
  4. *กลยุทธ์การลงมือทำเพื่อดึงศักยภาพสูงสุด*
