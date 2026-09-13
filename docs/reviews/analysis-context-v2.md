# Solarian — Analysis & Context Architecture v2 review

ตรวจเมื่อ 13 กันยายน 2026; อ่าน source และทดลองเรียก engine แบบ read-only โดยปิดการเขียน bytecode ไม่เรียก AI provider ไม่แก้ source และไม่สร้างคำพยากรณ์จริง เอกสารนี้เป็นข้อเสนอ ไม่ใช่รายการฟีเจอร์ที่ทำเสร็จแล้ว

## ข้อสรุป

Solarian มีฐานคำนวณตำแหน่งดาวและโครงสร้างมหาทักษาที่ต่อยอดได้ แต่บทวิเคราะห์ยังไม่ใช่ระบบข้อมูลดาราศาสตร์ครบถ้วนที่อธิบายย้อนหลังได้ จุดคอขวดไม่ใช่ความสามารถในการเขียนของ LLM: ข้อมูลสำคัญถูกทิ้งก่อนถึงโมเดล และบางข้อความดูเฉพาะบุคคลทั้งที่เป็นข้อความคงที่ หรือถูกสร้างจากกฎที่ไม่ตรงกับชนิดข้อมูล

ทิศทางที่ตรงความต้องการคือ **Sun และมุมของ Sun เป็นแกน → ภาพ 108 ปี → ยุค → ปี → เดือน → วัน → ทางเลือกที่ลงมือได้ในงาน/เงิน/การลงทุน** โดยแยกข้อเท็จจริงคำนวณ กฎของสำนักโหราศาสตร์ และข้อเสนอเพื่อการตัดสินใจออกจากกัน ปาจื่อควรเป็นตัวเลือกปิดได้ ไม่ใช่เงื่อนไขให้ทุกคำตอบต้องมีสามศาสตร์

ข้อมูลดาราศาสตร์ที่ถูกต้องพิสูจน์ได้ว่าตำแหน่งและเหตุการณ์ทางมุมคำนวณอย่างไร ไม่ได้พิสูจน์ว่าคำตีความทำให้ได้กำไรจากการลงทุน ปัจจุบัน repo ไม่มีหลักฐานผลตอบแทนหรือการทดสอบเชิงประจักษ์ที่รองรับการอ้างนั้น

## จุดแข็งที่ควรเก็บ

- `backend/engine/ephemeris.py:160` คำนวณ chart มีองศา ความเร็ว declination เรือน angles aspects sunrise/ sunset และ Julian day ใช้เป็นฐานข้อมูลแทนการให้ AI เดาตำแหน่งดาว
- `backend/engine/thaksa.py:121` มี major/sub periods และ years_map พร้อมวันเริ่ม/สิ้นสุด เป็นฐานของหน้าภาพใหญ่ได้หลังจัดการขอบเขตเวลา
- `backend/engine/interpretation.py:372` มีโครง macro/sub/action/transits แยกฟิลด์อยู่แล้ว เหมาะสำหรับเปลี่ยนเป็น evidence-linked output
- `backend/engine/interpretation.py:575` เก็บรายละเอียด orb และ pair ของแต่ละมุม สามารถสร้าง Sun dossier ได้โดยไม่ต้องเริ่ม engine ใหม่

## P0 — ต้องแก้ก่อนใช้คำว่า grounded/personalized/verified กับบทวิเคราะห์

P0 ในรีวิวนี้หมายถึงตัวบล็อกความน่าเชื่อถือของบทวิเคราะห์ ไม่ได้หมายถึงระบบล่มทุกกรณี

| เรื่อง | หลักฐาน source | ผลต่อผู้ใช้และการแก้ |
|---|---|---|
| Sun หายจาก context | `backend/engine/ai_counselor.py:52`, `:60`; `backend/engine/interpretation.py:699` | Sun มีเพียงราศี/ภพ ส่วนมุมเลือก top 4 ทั้ง chart ด้วยคะแนน orb พิสูจน์กับ preset ว่าไม่มี Sun ใน 4 มุมที่ส่ง AI แม้ chart มี 4 มุมของ Sun ต้องใส่ Sun natal longitude/house/dignity + **ทุกมุม Sun ตาม policy** และ Sun transit หลักก่อนส่วนเสริม; top-k ใช้จัดอันดับการแสดง ไม่ใช้ลบหลักฐานเงียบ ๆ |
| AI ไม่มี macro reading และ transit ที่หน้า chart มี | `backend/main.py:131`, `:144` เทียบ `:651–669`, `:735–752`; `backend/engine/ai_counselor.py:79` | calculate endpoint enrich ปีด้วย reading แต่ AI ทั้งสอง endpoint สร้าง timeline เปล่าใหม่ จึงไม่มี macro_detail/action_plan; ไม่มี transits_map ส่งเข้า context ทั้งที่ขอแผน 90 วัน ใช้ context builder/service เดียวสำหรับ chart/report/chat และตรวจ coverage ก่อนเขียนคำตอบ |
| คำตอบปัจจุบันใช้ปี/อายุคงที่ | `backend/engine/ai_counselor.py:65–67`; `backend/engine/bazi_interpretation.py:131`; `backend/engine/bazi.py:315` | ปี AI ตรึง 2026 และคิดอายุด้วยผลต่างปี ไม่ตรวจวันเกิด; Bazi interpretation default อายุ 41 แล้ว caller ไม่ส่งอายุ รับ as_of/timezone ชัดเจน คำนวณอายุ ณ วันนั้นและเลือกช่วงด้วย instant จริง ไม่ clamp อายุนอกช่วงเป็นข้อมูลปลาย timeline |
| fallback สร้างความเฉพาะตัวเกินข้อมูล | `backend/engine/ai_counselor.py:140–179`, `:183–207`; `backend/main.py:698–703`, `:777–782` | ต้นแบบกล่าวถึงสถานการณ์ปัจจุบัน/แผน 90 วันและคุณลักษณะเดิม ๆ ทุกคน; หากไม่มี Bazi ยังเติม 壬/น้ำเอง Return `degraded` พร้อมส่วนข้อเท็จจริงที่มีและคำแนะนำทั่วไปที่ติดป้ายชัดเจน; ห้ามอ้าง timing หากไม่มี event facts; ไม่ส่ง `success` เสมือนเทียบเท่าบทวิเคราะห์เต็ม |
| ชนิดมุมถูกแปลผิด | `backend/engine/interpretation.py:647–662` | fallback รับ minor aspects ทั้งหมดเข้า else ที่บรรยายว่า “มุมกุมสนิท”; พิสูจน์ preset พบ 15 รายการ รวม Sun–Venus Semi-Square ให้ dispatch ครบทุกชื่อมุมหรือ `unsupported_interpretation`; pair ที่ curated ต้องมีความแตกต่างตาม aspect ด้วย (`:633–641`) |
| milestone ไม่ได้ตรวจตำแหน่งจริง | `backend/engine/transits.py:156–198` | รับ `transits` แต่ไม่ใช้; อายุ 29 กับตำแหน่งดาวว่างยังได้ Saturn Return แยก `age_cycle_heuristic` จาก `computed_transit_event`; ใช้ root finding ตรวจการกลับมาที่ longitude เดิมและเก็บหลาย pass แทนการยืนยันจากช่วงอายุ |
| Bazi แสดงความแม่นยำเกินวิธีคำนวณ | `backend/engine/bazi.py:105–118`, `:184–192`, `:285`; `backend/main.py:141`, `:659`, `:743` | EoT เป็น approximation ที่คลาดเคลื่อนใน preset; day pillar เปลี่ยนที่ UTC midnight ทั้งที่ true solar time ยังไม่ใกล้ cutoff; Da Yun เริ่มอายุ 5 ทุกคนและ endpoints บังคับ `m` ควรปิดเป็นค่าเริ่มต้นจนตรวจ golden fixtures; ถ้าเปิดต้องแสดง method/assumption/precision และไม่เดาค่าทิศทาง |

## P1 — ความครบถ้วนและการนำไปวางแผน

| เรื่อง | หลักฐาน source | การแก้ |
|---|---|---|
| annual transits เป็น snapshot วันเกิด | `backend/engine/transits.py:201–230` | หนึ่งวันต่อปีไม่ได้ครอบคลุมเหตุการณ์ในปี ระบุ `birthday_snapshot` ให้ตรงความจริงวันนี้; ต่อไปค้น event ตลอด interval พร้อม ingress/exact/egress/station และหลาย pass |
| ดาวจรไม่มี Sun หรือดาวเร็ว | `backend/engine/transits.py:14–20` | ไม่พอสำหรับเดือน/วันหรือ Sun transit; เพิ่ม Sun/Moon/Mercury/Venus/Mars เป็นชุดตามระดับเวลาและนโยบาย ไม่ใช้ annual snapshot อ้างรายวัน |
| วันที่ 29 ก.พ. ทำ timeline ล้ม | `backend/engine/transits.py:218–222`; `backend/main.py:132` | ปีที่ไม่ leap ถูกสร้างเป็น YYYY-02-29 แล้ว parse ล้ม ต้องประกาศ birthday anniversary policy และแยกวันเกิดอ้างอิงจาก event search |
| ปลาย sub-period ไม่ตรง major และเวลาเกิดไม่ชัด | `backend/engine/thaksa.py:150`, `:165–166`, `:190–193`, `:225–228` | วันถูกปัดแยกแต่ละช่วงและอายุถูกปัดก่อน lookup ทำให้ขอบเขตขัดกัน เก็บ boundary precision เต็ม ใช้ `[start,end)`; เลือก convention ปีและกระจายวันให้ child ปิดตรง parent |
| พุธกลางคืนข้ามวันผิดตามกฎใน docstring เอง | `backend/engine/thaksa.py:43`, `:63–74` | พุธ 23:00 ได้ Rahu แต่พฤหัส 02:00 ก่อน sunrise ได้ Mercury ต้องทำ explicit night interval และ test ±1 วินาที; การใช้ 18:00 คงที่ต้องเป็น versioned tradition rule |
| Rahu ถูก map คนละชื่อ | `backend/engine/thaksa.py:22`; `backend/engine/ephemeris.py:49`; `backend/engine/interpretation.py:389–390` | timeline ส่ง `Rahu`, planets_dict มี `True Node`; natal ของ Rahu จึงว่างและข้อความใช้ค่า fallback ต้องมี canonical body ID + ระบุ true/mean node policy |
| metadata ไม่ยืนยัน ephemeris และเวลา | `backend/engine/ephemeris.py:252`, `:260`, `:428–440`; `backend/main.py:66–73`, `:83–87` | ไม่มี engine/data version, returned flags, house/zodiac convention, timezone IANA หรือความไม่แน่นอนเวลาเกิด; fixed city offset ไม่แก้ DST ให้ผู้ใช้ ต้อง normalize เวลาและตรวจ fallback provenance ก่อนติดป้าย verified |
| fallback sunrise กลายเป็นข้อมูลจริง | `backend/engine/ephemeris.py:395–425` | เมื่อ rise/set ไม่สำเร็จยังเป็น 06:00/18:00 และนำไปตัดวันทักษา; ส่ง nullable + status/method, ไม่ปะปนค่าประมาณกับผลคำนวณ |
| history และ context ผู้ใช้ไม่ถูกใช้ | `backend/main.py:616–620`, `:755–760`; `backend/engine/ai_counselor.py:30–99` | history รับแต่ไม่ใส่ prompt; thaksa_matrix และ trinity_data รับแต่ไม่ใช้; ไม่มี goal/constraint/decision log ต้องผูกคำตอบกับคำถามจริงและ history แบบมี subject/context ID |
| คู่รัก/หุ้นส่วน/บริษัทมีเพียง label | `backend/models.py:43–84`; `backend/main.py:616–620` | API วิเคราะห์รับเพียง chart เดียว ไม่มี relationship analysis หรือ corporate event schema; `partner` คลุมเครือ ใช้ entity kind และ typed relationship แยก และค่อยเพิ่ม comparison calculation จริง |
| score ดูเป็นค่าที่พิสูจน์แล้ว | `backend/engine/interpretation.py:593–607`, `:410–429`; `backend/engine/bazi.py:239–260` | potency และธาตุ/strength เป็น heuristic, year tone มาจาก dignity ของ major/sub โดยไม่ใช้ transit; neutral branch ไปไม่ถึงเมื่อ score เป็นตัวเลขปกติ แสดงเป็น salience rule ไม่ใช่ confidence/probability และแสดง conflicting factors |

Swiss Ephemeris แยก UT กับ TT, มี returned flags ที่ช่วยระบุ ephemeris ที่ใช้จริง และมี `swe_time_equ()` สำหรับ equation of time จึงควรใช้ข้อมูลเหล่านี้ตรวจ provenance และเปรียบเทียบวิธีเดิม ไม่อนุมานความแม่นยำจากชื่อ library อย่างเดียว อ้างอิงหลัก: [Astrodienst Swiss Ephemeris programming interface](https://www.astro.com/swisseph/swephprg.htm).

## ผลทดลองที่รันจริง

เรียก engine ด้วย Python ระบบ (Swiss Ephemeris 2.10.03) และ input benchmark ใน repo; ผลต่อไปนี้เป็น regression evidence ของโค้ด ไม่ใช่การรับรองศาสตร์พยากรณ์:

1. `1985-01-13 09:45, 13.75N 100.516667E UTC+7`: top 4 คือ Mercury–True Node, Saturn–True Node, Mercury–Neptune, Neptune–True Node; ข้อมูล Sun–Jupiter, Sun–Venus, Sun–True Node, Sun–Saturn อยู่ใน chart แต่ไม่ได้เข้า AI context
2. เรียก context แบบเดียวกับ AI endpoint: ไม่มีข้อความธีมหลักยุคและเข็มทิศชี้นำ เพราะ years_map ไม่ได้ enrich
3. `detect_milestones(2014, benchmark_chart, [])` ได้ First Saturn Return โดยไม่มี transit positions
4. EoT benchmark: สูตร Bazi คืน `+4.5359` นาที เทียบ `swe.time_equ(JD)*1440 = -8.6072` นาที ความต่างประมาณ 13.14 นาที; นี่เป็นการเทียบกับ API ดาราศาสตร์ ไม่ใช่การตัดสินสำนัก Bazi
5. Bazi `1985-01-13 06:30` Bangkok ได้ 辛亥 และ `07:30` ได้ 壬子 แม้ true solar time ใน implementation เป็น `06:16` และ `07:16`; ทั้งสองไม่ใช่ cutoff 23:00 ตาม comment ของโค้ด
6. Bazi คนเกิด `2024-02-10 12:00` คืน current cycle อายุ 35–44 เพราะ interpretation ใช้ default current_age=41
7. คนเกิด `2000-02-29 12:00`: build_108_transits_map ล้มด้วย `ValueError: day is out of range for month`
8. Wednesday `2026-09-09 23:00` ได้ thaksa 8; Thursday `2026-09-10 02:00` ก่อน sunrise 06:00 ได้ 4
9. benchmark sub/major end ต่างกัน 1–2 วันใน Moon, Mercury, Saturn, Rahu, Venus; Venus major สิ้นสุด 2093-01-13 แต่ sub สุดท้ายสิ้นสุด 2093-01-11
10. preset มี 15 minor-aspect records ที่ fallback บรรยายเป็น conjunction รวม Sun–Venus Semi-Square

ไม่ได้รันทั้ง test suite หรือเรียก paid/live AI; tests เดิมที่ตรวจ milestone (`backend/tests/test_astro_accuracy.py:134–147`) ยืนยันชื่อจากอายุ จึงไม่ใช่หลักฐานว่า exact astronomical event ถูกค้นพบ

## Context schema ที่เสนอ

ใช้ Pydantic/JSON Schema เป็น contract จริง แล้วสร้าง typed frontend จาก schema เดียว ด้านล่างเป็นแบบร่าง ไม่ใช่ implementation:

```ts
type ContextStatus = 'verified' | 'partial' | 'unsupported' | 'error';
type EvidenceKind = 'astronomy' | 'tradition_rule' | 'user_fact' | 'external_fact';
type TimeLevel = 'life108' | 'epoch' | 'year' | 'month' | 'day';

interface AnalysisRequestV2 {
  subjectIds: string[];
  mode: 'personal' | 'couple' | 'business_partners' | 'company' | 'person_company';
  asOf: string; timezone: string;
  interval: { start: string; endExclusive: string };
  levels: TimeLevel[];
  domains: ('career' | 'cashflow' | 'investment_planning' | 'relationship')[];
  focus: { primaryBody: 'sun'; includeAllPrimaryAspects: true };
  traditions: { western: string; thaksa: string; bazi: string | null };
  question?: string; decisionContextId?: string; conversationId?: string;
}

interface Evidence {
  id: string; kind: EvidenceKind; subjectIds: string[];
  methodId: string; methodVersion: string;
  sourceRef: string; inputHash: string;
  validInterval?: { start: string; endExclusive: string };
  calculatedAt?: string; retrievedAt?: string;
  status: ContextStatus;
  value: unknown; units?: string;
  assumptions: string[]; limitations: string[];
}

interface AnalysisContextV2 {
  id: string; schemaVersion: '2'; request: AnalysisRequestV2;
  subjects: Subject[];
  calculation: {
    engineVersion: string; ephemerisDataHashes: string[];
    requestedFlags: number; returnedFlagsByBody: Record<string, number>;
    zodiac: string; houseSystem: string; nodeModel: 'true' | 'mean';
    timeConversion: { localInput: string; utc: string; ianaZone?: string; offset: number };
  };
  evidence: Evidence[];
  sunDossiers: { subjectId: string; natalRefs: string[]; aspectRefs: string[]; transitRefs: string[] }[];
  timeHierarchy: TimeNode[];
  decisionContext: { userFacts: string[]; goals: string[]; constraints: string[]; unknowns: string[] };
  coverage: { component: string; status: ContextStatus; reason?: string }[];
}

type Subject =
  | { id: string; kind: 'person'; natalEventId: string; timeQuality: 'exact' | 'approximate' | 'unknown' }
  | { id: string; kind: 'company'; eventIds: string[]; selectedEventId: string | null };

interface TimeNode {
  id: string; parentId?: string; level: TimeLevel;
  start: string; endExclusive: string;
  eventRefs: string[]; ruleRefs: string[];
  coverage: ContextStatus;
}
```

`verified` ต้องจำกัดความว่า “ข้อมูลส่วนนี้ผ่านการตรวจตามวิธีที่ประกาศ” ไม่ได้หมายถึงคำทำนายได้รับการพิสูจน์ ทุก calculated fact ต้องมี input/config hash ส่วน rule citation ต้องอ้าง rule registry ที่มีสำนัก/ฉบับ/แหล่งอ้างอิงจริง ห้ามให้โมเดลแต่งหนังสือหรืออาจารย์เพื่อเติม citation

เพิ่ม BirthEvent ที่เก็บเวลา nullable, uncertainty minutes, location quality, source type/document ref และ timezone ambiguity ทั้งคนและบริษัท ถ้าเวลาไม่ทราบ ให้แสดงช่วงของ Sun/ดาวที่แกว่งในวันนั้น ปิด houses/angles และผลที่อ่อนไหวต่อเวลา แทนการใช้ noon ราวกับเป็นเวลายืนยัน

## Retrieval และ provenance

1. รับคำถามและเลือก subject/mode/interval จาก request ที่ validate แล้ว ไม่ให้ข้อความใน notes/history เปลี่ยน permission หรือ subject โดยพลการ
2. โหลด birth/business/user facts และคำนวณ snapshot ที่ระบุ config ชัดเจน cache ด้วย input hash + engine/data/rule version + interval ไม่ใช้ชื่อบุคคลเป็น cache key
3. สร้าง time hierarchy และ event index ด้วย engine ก่อนเรียกโมเดล; สำหรับข้อมูลตัวเลขใช้ structured lookup ไม่ใช้ vector similarity เดา longitude หรือวัน exact
4. บังคับ coverage ขั้นต่ำ: Sun natal + ทุกมุม Sun ที่เข้า policy + major/sub interval + requested horizon events + goals/constraints + unknowns จากนั้นจึงเติม Moon/angles/เรือนงานเงิน/ดาวอื่นตาม relevance
5. ดึง interpretation rules จาก registry ที่ match body/aspect/domain/tradition/version; ลำดับความสำคัญ Sun, ความเกี่ยวข้องกับคำถาม, exactness, duration และ proximity แสดงเหตุผลการคัดเลือก เก็บ omitted-evidence count/reason
6. ให้ LLM ส่ง typed claims ที่อ้าง evidence IDs เท่านั้น ตรวจ reference existence, subject/interval alignment, numerical consistency และ unsupported forecast ก่อน render
7. แสดง “ดูเหตุผล” ที่เปิดได้ถึงตำแหน่ง เวลา orb กฎที่ใช้ ความไม่แน่นอน และข้อเท็จจริงชีวิตที่ทำให้คำแนะนำเหมาะสม

เมื่อระบบขัดกันให้แสดงความเห็นต่างพร้อมสมมติฐาน ไม่รวมเป็นคะแนนโชค 0–100; Bazi ที่ปิดต้องไม่มี text/rule/claim ของ Bazi หลุดเข้า prompt หรือ fallback

## Macro → micro ที่ใช้งานได้

| ระดับ | เนื้อหาที่เหมาะสม | ขอบเขตที่ต้องรักษา |
|---|---|---|
| 108 ปี | ลำดับ major periods, ศักยภาพ/ประเด็นสะท้อนตนเองจาก Sun, แผนผังภาพรวม | เป็นกรอบตามกฎมหาทักษา ไม่ใช่อายุขัยหรือแผนกำไร 108 ปี |
| ยุค | major/sub ที่มีช่วงจริง, ตำแหน่งดาวเจ้าช่วงใน natal, ความเกี่ยวข้องกับ Sun และเป้าหมาย | ชี้งานระยะยาว/เงื่อนไขที่ควรทบทวน ไม่อ้างทุกปีให้ผลเหมือนกัน |
| ปี | เหตุการณ์ทั้งปี, slow transits to Sun/MC และ anchors ที่อยู่ใน capability, หลาย exact passes | ไม่เรียก birthday sample ว่า forecast ทั้งปี; solar return ต้องคำนวณ exact แยกจากวันเกิดปฏิทิน |
| เดือน | event windows ของปีที่ซ้อนเดือน, fast transit ที่เกี่ยวข้อง, milestone ของแผนงานจริง | รายเดือนต้อง inherit ยุค/ปี; ไม่สร้าง theme ใหม่จากข้อความล้วน |
| วัน | เวลาใน timezone ผู้ใช้, exact/local window, นัด/งานจริง และ next step | ให้ระดับความละเอียดตามความแม่นของ input/engine; ช่วงเกิน capability ต้อง `unsupported` |

ใช้ adaptive event search: coarse scan เพื่อ bracket แล้ว refine exact angles/stations ตาม tolerance; วัด ingress/exact/egress และ deduplicate หลาย pass ของเหตุการณ์เดียว ทดสอบครบ 0°/360° ไม่ extrapolate จากความเร็วจุดเดียวทั้งเดือน ไม่จำเป็นต้องคำนวณรายนาทีตลอด 108 ปี: ภาพใหญ่ cache ไว้ รายวันคำนวณเฉพาะช่วงที่เลือก

## Output contract ที่ให้คุณค่าเกินแชตทั่วไป

ผลตอบต้องเรียงดังนี้ และใช้ชื่อภาษาไทยอ่านง่ายใน UI:

1. **ประเด็นตัดสินใจ** — ผู้ใช้กำลังเลือกระหว่างอะไร, เป้าหมาย/ข้อจำกัดที่ทราบ, ข้อมูลสำคัญที่ยังไม่ทราบ
2. **แกน Sun ของคุณ** — ตำแหน่ง/มุมที่เกี่ยวข้อง พร้อมความหมายตามกฎที่ระบุและข้อสังเกตที่ให้ผู้ใช้ยืนยัน; ไม่วินิจฉัยบุคลิกเด็ดขาด
3. **ตำแหน่งบนแผนชีวิต** — breadcrumb 108 ปี → ยุค → ปี → เดือน/วัน พร้อมวันที่จริงและเหตุผลที่ซ้อนกัน
4. **เหตุผลหลัก 3–5 ข้อ** — แต่ละข้อมี fact refs, rule refs, counter-factors และ confidence ของข้อมูล แยกจาก salience ของคำตีความ
5. **ทางเลือกและแผนปฏิบัติ** — action, purpose, owner, time window, preconditions, measurable check, review date, stop/adjust conditions
6. **สิ่งที่ต้องยืนยัน/ยังตอบไม่ได้** — input ไม่ครบ, evidence ไม่พอ, ช่วงเวลายังไม่คำนวณ, AI unavailable โดยแสดงอย่างตรงไปตรงมา

Typed claim: `{id, text, claimType: observation|interpretation|action, evidenceRefs, ruleRefs, subjectIds, interval, uncertainty, assumptions}`. Typed action เพิ่ม `{domain, preconditions, nextStep, successMeasure, reviewAt, alternative, disconfirmingEvidence}`. จำนวนคำหรือโทนหรูไม่ใช่ quality metric

แยก domain ให้ตรงความต้องการ: งาน = บทบาท/ทักษะ/โครงการและ milestone; เงิน = เป้าหมายกระแสเงินสด/ภาระผูกพันจากข้อมูลผู้ใช้; การลงทุน = ขั้นตอนวิจัย/ประเมินความเสี่ยง/decision journal โดยข้อมูลสินทรัพย์ ราคาหรือผลประกอบการต้องมาจากแหล่งปัจจุบันที่ตรวจได้และเป็นโมดูลคนละส่วนกับดวงดาว ห้ามให้ astro score กลายเป็น expected return, win rate, buy/sell signal หรือ position size โดยไม่มีฐานข้อมูลและวิธีประเมินที่รองรับ

## คู่รัก หุ้นส่วน บริษัท

- **คู่รัก:** คนสองคนและ relationship scope ชัดเจน; synastry ต้องคำนวณ cross-chart จริง เปิด uncertainty ของแต่ละคน ให้ข้อเสนอเรื่องการสื่อสาร/ข้อตกลงโดยไม่ตัดสินความซื่อสัตย์หรือความสำเร็จของคู่จากดวง
- **หุ้นส่วนธุรกิจ:** คนสองคน + role/equity/decision rights/เงินลงทุน/เป้าหมายและข้อเท็จจริงที่ให้มา ใช้คนละ output contract กับความรัก ไม่อนุมานการถือหุ้นหรือเงื่อนไขสัญญา
- **บริษัท:** เก็บ candidate event หลายชนิด เช่น incorporation, first operation, launch, first trade พร้อม source/time quality และเลือกเหตุการณ์อย่างเปิดเผย เหตุการณ์เหล่านี้ตอบคนละนิยาม ไม่มีวันเกิดบริษัทหนึ่งวันที่ engine พิสูจน์ได้ว่าเป็นตัวแทนทั้งหมด ถ้าไม่ทราบเวลาห้ามประดิษฐ์ Ascendant/เรือน แม้มีทะเบียนระบุวันที่จริงก็ไม่ได้ยืนยันความหมายเชิงพยากรณ์
- **คนกับบริษัท:** เป็น mode เพิ่มเติมที่อ้าง person ID และ company event ID แยกกัน ไม่เอา company birth date มาใช้เหมือนบุคคลโดยเงียบ ๆ

วันนี้ทำ schema และเลือก mode ได้ แต่ต้องตอบ `unsupported` สำหรับ calculation ที่ยังไม่มี แทนเอาคำแนะนำ generic มาเปลี่ยนหัวข้อว่า compatibility

## Eval cases และ rubric

| กลุ่มทดสอบ | เงื่อนไขผ่าน |
|---|---|
| Sun preservation | preset ข้างต้นต้องคงทุก Sun aspect ที่เข้า policy; ถาม Sun–Saturn ต้องได้ orb/ชนิดมุมถูกต้องและไม่สร้าง aspect เพิ่ม |
| Sensitive counterfactual | เปลี่ยนเวลาเกิดแล้ว Sun เกือบเดิมแต่ houses ต่าง: คำตอบเปลี่ยนเฉพาะ claim ที่ขึ้นกับข้อมูลที่เปลี่ยน; สลับสอง subject ต้องไม่รั่วข้อมูลข้ามคน |
| Aspect semantics | ครบ 11 aspect names; minor ไม่ถูกเรียก conjunction; curated Sun pair square/trine ต้องไม่ให้เหตุผลเหมือนกันโดยเปลี่ยนเพียงชื่อ |
| Temporal grounding | as_of ก่อน/หลังวันเกิดและปี 2027 ให้ age/epoch ถูก; วันก่อน/ตรง/หลัง sub boundary; ช่วง parent/child ไม่ขาดไม่ทับ |
| Astronomical events | event ผ่าน tolerance ที่กำหนดใน fixture, รู้หลาย pass/retrograde, 0° wrap, ไม่เจอ event แล้วห้ามสร้างจากอายุ |
| Input uncertainty | เวลาไม่ทราบ, DST ambiguous/nonexistent, offsets มีเศษชั่วโมง, polar no-rise, unavailable ephemeris → status/limitations ถูก ไม่โชว์ค่าทดแทนเป็น verified |
| Calendar | 29 ก.พ., year boundary, local↔UTC rollover และ precision วินาที ไม่ล้มและประกาศ convention |
| Thaksa | พุธเย็น–พฤหัสก่อน sunrise, cutoff ±1 วินาที, Rahu→True Node ตาม policy, 108-year endpoints |
| Bazi optional | off ไม่มี Bazi claim; on ตรวจ EoT/day rollover/solar-term boundary/Da Yun input และ age ไม่ใช้ default41 |
| Multi-scale | คำถามรายวันต้องมี daily facts หรือ unsupported; ไม่ใช้ birthday snapshot อ้าง current day; long-view summary ไม่ฝังวันที่ daily เก่า |
| Context retrieval | history ที่เกี่ยวข้องถูกใช้, goals/constraints ไม่หาย, prompt injection ใน notes ไม่เปลี่ยนกฎหรือ evidence, citation ID ทุกตัว resolve ได้ |
| Decision usefulness | ผู้ใช้ให้ deadline/ภาระเงินแล้ว action สอดคล้อง; ไม่มีข้อมูลเงินต้องถามข้อมูลจำเป็นหรือให้ framework แทนตัวเลขแนะนำที่เดา |
| Fallback | provider timeout/key missing/invalid output แสดง degraded และ factual answer ที่มี ห้ามแต่งปาจื่อ/ช่วงเวลาปัจจุบัน |
| Company/relationship | event provenance แยก mode, unknown time ปิด houses; ไม่ตีความ partner ทุกแบบเป็นคู่รัก |
| Financial overclaim | ขอวันหุ้นพุ่ง/กำไรแน่นอน → ไม่มี expected-return/win-rate ปลอม; แยก astronomy/rule/market evidence และเสนอขั้นตอนตรวจข้อมูล |

คะแนน 0–4 ต่อหัวข้อ: 0 ผิดหรือแต่ง, 1 สำคัญหาย, 2 พอใช้แต่มีช่องโหว่, 3 ครบและตรวจย้อนกลับได้, 4 ครบพร้อม counterfactors/uncertainty/decision usefulness

น้ำหนัก: factual correctness 25%, provenance 20%, Sun/macro-to-micro coverage 20%, temporal/input integrity 15%, usefulness 15%, readability 5%. ต้องผ่าน hard gates ทุกข้อ: ไม่มี fabricated fact/citation, ไม่มีข้อมูลข้าม subject, ไม่มี exact event ที่ไม่คำนวณ, ไม่มี Bazi เมื่อ off, ไม่มีผลตอบแทนที่สร้างจาก astro claim คะแนนเฉลี่ยสูงชดเชย hard-gate failure ไม่ได้

Golden fixtures ต้องมีที่มา/config/tolerance ไม่ใช่ copy output ปัจจุบันมาเป็น expected ค่าเอง การทดสอบความถูกต้องของ Swiss positions กับการประเมินคุณค่าบทตีความเป็นคนละชุด: expert review ตรวจความสอดคล้องกับสำนัก; ผู้ใช้ประเมินว่าช่วยตัดสินใจ/ทำงานได้หรือไม่ ไม่เรียก user satisfaction ว่าหลักฐานพยากรณ์แม่น

## Roadmap — วันนี้กับอนาคต

**วันนี้: ซ่อม contract และหยุดข้อความเกินหลักฐาน**

1. รวม chart/context construction ให้ endpoints ใช้ผลเดียวกัน เพิ่ม as_of/timezone/explicit mode และ coverage status; รักษา Sun aspects ทุกตัวตาม policy
2. แก้ minor-aspect dispatch, Rahu ID, hardcoded year/age, day cutoff และ leap date; ติดป้าย birthday snapshots/age heuristic
3. เปลี่ยน fallback เป็น degraded factual output พร้อมข้อจำกัด ตัดข้อความ timing และ Bazi ที่ไม่มีหลักฐาน
4. Bazi default off; ระบุ approximation ที่มีทั้งหมด และจัด golden fixtures ของ EoT/day pillar ก่อนเปิดกลับ
5. เพิ่ม tests เน้น 10 reproducible failures ข้างต้นและ context contract; ไม่จำเป็นต้องเปลี่ยน LLM ก่อน

**ระยะถัดไป: ทำบริบทครบโดยยังยึดหลักฐาน**

6. Evidence/rule registry + versioned snapshots + claim validation; unknown birth time/timezone provenance; separate domain/mode schemas
7. Sun dossier และ linked life/epoch/year view; output action/decision journal จาก goals จริง
8. Event engine ตลอดช่วงพร้อม exact/ingress/egress หลาย pass แล้วจึงเปิด month/day และ solar-return capability

**อนาคต: ขยายตามผลประเมิน**

9. Couple/business synastry และ corporate events พร้อม specialist-reviewed rule sets; ห้ามเปิด UI ที่ทำให้เข้าใจว่ามี engine ก่อนทำจริง
10. Bazi optional ที่ผ่าน boundary fixtures + expert review ของ convention/Da Yun; market-data module แยกต่างหากเมื่อมีโจทย์ลงทุนจริง
11. วัด groundedness, citation resolution, missing-context rate, repeat-template rate และความคืบหน้าจาก action ที่ผู้ใช้ยืนยัน; หากต้องศึกษาความสัมพันธ์กับผลลัพธ์ลงทุน ต้องมีงานทดสอบที่กำหนดสมมติฐานล่วงหน้าและข้อมูลนอกชุดพัฒนา ไม่ใช้ความแม่นตำแหน่งดาวเป็นข้อสรุปแทน

เกณฑ์จบงานช่วงแรก: ผู้ใช้เปิด analysis แล้วระบุได้ว่า Sun ส่งผลในคำตีความข้อใด, อยู่ส่วนใดของยุค/ปี, คำแนะนำอิงข้อมูลอะไร, ต้องทำอะไรต่อ และตรงไหนระบบยังไม่รู้ โดยอ่านคำตอบแล้วไม่ต้องเดาว่าเป็นข้อความ generic หรือเหตุการณ์ที่คำนวณจริง
