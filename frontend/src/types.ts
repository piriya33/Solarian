export interface PlanetData {
  id: number;
  name: string;
  thai: string;
  symbol: string;
  thaksa_num: number;
  is_core: boolean;
  longitude: number;
  latitude: number;
  latitude_str: string;
  declination: number;
  declination_str: string;
  distance_au: number;
  speed_lon: number;
  speed_str: string;
  is_retrograde: boolean;
  sign: string;
  sign_thai: string;
  sign_symbol: string;
  sign_index: number;
  degrees: number;
  minutes: number;
  seconds: number;
  formatted_dms: string;
  full_formatted: string;
  house: number;
}

export interface HouseData {
  house: number;
  name_thai: string;
  longitude: number;
  sign: string;
  sign_thai: string;
  sign_symbol: string;
  sign_index: number;
  degrees: number;
  minutes: number;
  seconds: number;
  formatted_dms: string;
  declination: number;
  declination_str: string;
}

export interface AngleData {
  name: string;
  thai: string;
  symbol: string;
  longitude: number;
  sign: string;
  sign_thai: string;
  sign_symbol: string;
  sign_index: number;
  degrees: number;
  minutes: number;
  seconds: number;
  formatted_dms: string;
  declination: number;
  declination_str: string;
}

export interface AspectData {
  body1: string;
  body1_thai: string;
  body1_symbol: string;
  body2: string;
  body2_thai: string;
  body2_symbol: string;
  aspect_name: string;
  aspect_thai: string;
  aspect_symbol: string;
  aspect_angle: number;
  orb: number;
  orb_str: string;
  is_applying: boolean;
  color: string;
}

export interface Metadata {
  name?: string;
  birth_date: string;
  birth_time: string;
  latitude: number;
  longitude: number;
  tz_offset: number;
  julian_day_ut: number;
  julian_day_tt: number;
  delta_t_sec: number;
  sidereal_time: string;
  sunrise_local: string;
  sunset_local: string;
  is_after_sunrise: boolean;
}

export interface ChartResult {
  metadata: Metadata;
  planets: PlanetData[];
  planets_dict: Record<string, PlanetData>;
  houses: HouseData[];
  angles: Record<string, AngleData>;
  aspects: AspectData[];
}

export interface ThaksaRole {
  role_key: string;
  role_thai: string;
  role_desc: string;
  planet_num: number;
  planet_name: string;
  planet_thai: string;
  planet_symbol: string;
  planet_color: string;
  period_years: number;
}

export interface SubPeriod {
  sub_index: number;
  planet_num: number;
  planet_name: string;
  planet_thai: string;
  planet_symbol: string;
  planet_color: string;
  duration_years: number;
  duration_str: string;
  start_age: number;
  end_age: number;
  start_date: string;
  end_date: string;
}

export interface MajorPeriod {
  period_index: number;
  planet_num: number;
  planet_name: string;
  planet_thai: string;
  planet_symbol: string;
  planet_color: string;
  duration_years: number;
  start_age: number;
  end_age: number;
  start_date: string;
  end_date: string;
  sub_periods: SubPeriod[];
}

export interface MacroDetail {
  epoch_title: string;
  epoch_theme: string;
  strategic_focus: string;
  entropy_risk: string;
  house_sign_label: string;
  dignity_label: string;
}

export interface SubDetail {
  catalyst_title: string;
  catalyst_role: string;
  synergy_dynamic: string;
  window_opportunity: string;
  immediate_caution: string;
  pair_type: string;
  pair_desc: string;
}

export interface ActionPlan {
  strategic_moves: string[];
  risk_mitigation: string[];
  decision_framework: string;
}

export interface DegreeTriggerHit {
  planet_name: string;
  planet_thai: string;
  planet_symbol: string;
  planet_color: string;
  distance_deg: number;
  exact_age: number;
  cycle_num: number;
  timing_str: string;
  sun_speed?: number;
}

export interface DegreeTriggerDetail {
  planet_name: string;
  planet_thai: string;
  planet_symbol: string;
  planet_color: string;
  exact_age: number;
  distance_deg: number;
  cycle_num: number;
  timing_str: string;
  sun_speed?: number;
  house_name: string;
  house_area: string;
  pair_type: string;
  pair_desc: string;
  dignity_label: string;
  trigger_narrative: string;
  planning_question?: string;
  practical_actions?: string[];
  decision_check?: string;
  sun_in_sign_degree?: number | null;
  planet_in_sign_degree?: number | null;
  natal_sign?: string | null;
  natal_degree?: string | null;
}

export interface HarmonicMethod {
  formula: string;
  cycle_years: number;
  zero_distance: string;
  year_assignment: string;
  timing_note: string;
}

export interface PlanetTriggerCatalogItem {
  planet_name: string;
  planet_thai: string;
  planet_symbol: string;
  planet_color: string;
  sign_thai: string;
  formatted_dms: string;
  in_sign_degree: number;
  distance_deg: number;
  timing_detail: string;
  impact_ages: Array<{
    exact_age: number;
    rounded_age: number;
    cycle_num: number;
    age_desc: string;
  }>;
}

export interface YearReading {
  age: number;
  calendar_year: number;
  macro_narrative: string;
  sub_narrative: string;
  macro_detail?: MacroDetail;
  sub_detail?: SubDetail;
  degree_triggers?: DegreeTriggerHit[];
  degree_trigger_details?: DegreeTriggerDetail[];
  degree_trigger_detail?: DegreeTriggerDetail | null;
  harmonic_method?: HarmonicMethod;
  action_plan?: ActionPlan;
  annual_thaksa_highlight: string;
  milestones: Array<{ title: string; category?: string; desc?: string; description?: string }>;
  transit_highlights: string[];
  tone: 'positive' | 'caution' | 'neutral';
  overall_advice: string;
}

export interface YearEntry {
  age: number;
  age_yang: number;
  calendar_year: number;
  major_planet: {
    num: number;
    name: string;
    thai: string;
    symbol: string;
    color: string;
  };
  sub_planet: {
    num: number;
    name: string;
    thai: string;
    symbol: string;
    color: string;
  };
  annual_thaksa: {
    num: number;
    name: string;
    thai: string;
    symbol: string;
  };
  sub_duration_str: string;
  major_duration_years?: number;
  degree_triggers?: DegreeTriggerHit[];
  reading?: YearReading;
}

export interface TimelineData {
  birth_day_ruler: {
    name: string;
    thai: string;
    symbol: string;
    period_years: number;
    element: string;
    color: string;
    day_name: string;
  };
  total_cycle_years: number;
  major_periods: MajorPeriod[];
  degree_triggers_catalog?: PlanetTriggerCatalogItem[];
  sun_in_sign_deg?: number;
  years_map: YearEntry[];
}

export interface TrinityItem {
  title: string;
  subtitle: string;
  dignity?: string;
  dignity_desc?: string;
  core_nature?: string;
  outward_persona?: string;
  emotional_instinct?: string;
  house_theme?: string;
  ruler_placement?: string;
  ruler_theme?: string;
}

export interface TrinityData {
  personality_trinity: {
    sun: TrinityItem;
    ascendant: TrinityItem;
    moon: TrinityItem;
  };
}

export interface ThaiPairInfo {
  type: string;
  desc: string;
  nature: 'positive' | 'negative' | 'neutral';
}

export interface AspectDynamic {
  body1: string;
  body1_thai: string;
  body1_symbol: string;
  body2: string;
  body2_thai: string;
  body2_symbol: string;
  aspect_name: string;
  aspect_thai: string;
  aspect_symbol: string;
  aspect_angle: number;
  orb: number;
  orb_str: string;
  is_applying: boolean;
  color: string;
  potency_score: number;
  potency_level: string;
  potency_badge: 'exact' | 'close' | 'moderate' | 'wide';
  applying_text: string;
  thai_pair_info?: ThaiPairInfo | null;
  pair_title: string;
  core_dynamic: string;
  psychology: string;
  career: string;
  relationships: string;
  challenges: string;
  empowerment: string;
}

export interface BirthProfile {
  id: number;
  name: string;
  relationship: string;
  is_default: boolean;
  birth_date: string;
  birth_time: string;
  latitude: number;
  longitude: number;
  tz_offset: number;
  location_name: string;
  gender?: string;
  notes?: string;
  created_at?: string;
  birth_data_complete?: boolean;
}

export interface BaziPillar {
  label: string;
  stem: {
    chinese: string;
    pinyin: string;
    thai: string;
    element: string;
    polarity: string;
    color: string;
  };
  branch: {
    chinese: string;
    pinyin: string;
    thai: string;
    animal: string;
    element: string;
    polarity: string;
    hidden: string[];
  };
  ten_god: {
    chinese: string;
    name_thai: string;
  };
  representation: string;
  is_day_master?: boolean;
}

export interface BaziResult {
  true_solar_time: string;
  eot_minutes: number;
  four_pillars: {
    year: BaziPillar;
    month: BaziPillar;
    day: BaziPillar;
    hour: BaziPillar;
  };
  day_master: {
    stem: {
      chinese: string;
      pinyin: string;
      thai: string;
      element: string;
      polarity: string;
      color: string;
    };
    strength: string;
    support_score: number;
    favorable_elements: string[];
  };
  five_elements_percent: {
    Wood: number;
    Fire: number;
    Earth: number;
    Metal: number;
    Water: number;
  };
  da_yun: Array<{
    step: number;
    start_age: number;
    end_age: number;
    stem: any;
    branch: any;
    ten_god: any;
  }>;
  interpretation?: BaziInterpretation;
}

export interface BaziPillarMeaning {
  title: string;
  pillars_str: string;
  meaning: string;
  stage: string;
}

export interface BaziInterpretation {
  macro_summary: {
    day_master_title: string;
    core_essence: string;
    strength_status: string;
    strength_score: number;
    strength_explanation: string;
    favorable_elements_thai: string[];
    useful_god_summary: string;
    talents: string[];
    shadow: string;
    action_advice: string;
  };
  four_pillars_meaning: {
    year_pillar: BaziPillarMeaning;
    month_pillar: BaziPillarMeaning;
    day_pillar: BaziPillarMeaning;
    hour_pillar: BaziPillarMeaning;
  };
  career_wealth: {
    wealth_strategy: string;
    favorable_industries: string[];
    operational_role: string;
  };
  feng_shui: {
    lucky_colors: string[];
    auspicious_directions: string[];
    lifestyle_habits: string[];
    desk_placement_tip: string;
  };
  da_yun_guidance: {
    current_cycle: string;
    pillars_str: string;
    ten_god: string;
    element_theme: string;
    tactical_advice: string;
  };
}


export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  subscription_tier: 'free' | 'premium' | 'pro';
  ai_queries_count: number;
  subscription_expires_at?: string | null;
  has_ai_access?: boolean;
}

export type GuidancePeriodKey = 'today' | 'period' | 'year' | 'identity';

export interface GuidanceSource {
  kind: string;
  label: string;
  [key: string]: unknown;
}

export interface GuidancePlanetRef {
  name: string;
  thai: string;
}

export interface GuidanceContext {
  major_planet?: GuidancePlanetRef | null;
  sub_planet?: GuidancePlanetRef | null;
  annual_planet?: GuidancePlanetRef | null;
  age?: number;
  calendar_year?: number;
}

export interface GuidanceCard {
  title: string;
  summary: string;
  do: string[];
  avoid: string[];
  sources: GuidanceSource[];
  time_scope?: string;
  date_label?: string;
  start_date?: string;
  end_date?: string;
  age?: number;
  calendar_year?: number;
  context?: GuidanceContext;
  [key: string]: unknown;
}

export interface PracticalGuidance {
  reference_date: string;
  time_scope?: string;
  periods: Record<GuidancePeriodKey, GuidanceCard>;
}

export interface ZodiacSignRef {
  id: number;
  sign_en: string;
  sign_thai: string;
  symbol: string;
  element: string;
  element_color: string;
  modality: string;
  modality_desc: string;
  traditional_ruler: {
    num: number;
    name: string;
    thai: string;
    symbol: string;
  };
  modern_ruler?: {
    name: string;
    thai: string;
    symbol: string;
  } | null;
  exaltation?: {
    num: number;
    name: string;
    thai: string;
    degree?: string;
    level: string;
  } | null;
  detriment?: {
    num: number;
    name: string;
    thai: string;
    level: string;
  } | null;
  fall?: {
    num: number;
    name: string;
    thai: string;
    level: string;
  } | null;
  keywords: string;
}

export interface PlanetaryPairRef {
  planets: number[];
  names_thai: string;
  type: string;
  meaning: string;
  action: string;
}

export interface PlanetaryPairGroup {
  title: string;
  theme: string;
  verse: string;
  pairs: PlanetaryPairRef[];
}

export interface PlanetaryPairsCatalog {
  friends: PlanetaryPairGroup;
  enemies: PlanetaryPairGroup;
  sompol: PlanetaryPairGroup;
  elements: PlanetaryPairGroup;
}

export interface ThaksaRoleRef {
  index: number;
  key: string;
  thai: string;
  desc: string;
  detail: string;
}

export interface ReferenceTablesData {
  zodiac_signs: ZodiacSignRef[];
  planetary_pairs: PlanetaryPairsCatalog;
  thaksa_roles: ThaksaRoleRef[];
}

export interface ApiResponse {
  success: boolean;
  profile: {
    name: string;
    location_name: string;
  };
  chart: ChartResult;
  day_result: {
    thaksa_num: number;
    planet_name: string;
    planet_thai: string;
    day_name: string;
    period_years: number;
    is_before_sunrise: boolean;
    is_rahu_night?: boolean;
    civil_weekday_thai?: string;
    astro_day_thai?: string;
    civil_date?: string;
    effective_date?: string;
    sunrise_time?: string;
    sunset_time?: string;
    reason: string;
  };
  thaksa_matrix: ThaksaRole[];
  timeline: TimelineData;
  transits_map: any[];
  trinity: TrinityData;
  aspect_dynamics: AspectDynamic[];
  guidance?: PracticalGuidance;
  bazi?: BaziResult;
  reference_tables?: ReferenceTablesData;
}

export interface CrossAspect {
  p1_planet: string;
  p1_thai: string;
  p1_symbol: string;
  p1_sign: string;
  p2_planet: string;
  p2_thai: string;
  p2_symbol: string;
  p2_sign: string;
  aspect_name: string;
  aspect_thai: string;
  aspect_symbol: string;
  angle: number;
  orb: number;
  color: string;
  is_harmonious: boolean;
  is_challenging: boolean;
  summary: string;
}

export interface SynastryResult {
  success: boolean;
  person1: {
    name: string;
    sun: string;
    moon: string;
    ascendant: string;
    day_master: any;
  };
  person2: {
    name: string;
    sun: string;
    moon: string;
    ascendant: string;
    day_master: any;
  };
  cross_aspects: CrossAspect[];
  bazi_synergy: {
    p1_element: string;
    p2_element: string;
    synergy_type: string;
    synergy_desc: string;
  };
}
