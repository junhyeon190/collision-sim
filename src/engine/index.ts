export interface CartState {
  t: number;
  F: number;
  v: number;
  a: number;
  x: number;
  [key: string]: number; // TimeSeriesChart가 timeKey로 동적 접근할 수 있게 하는 인덱스 시그니처
}

export function simulateCart(mu: number = 0, dt: number = 0.02, totalTime: number = 3.0): CartState[] {
  const m = 1.0; // kg
  const g = 9.8; // m/s^2
  const pushForce = 2.0; // N
  const pushDuration = 1.0; // s
  
  const history: CartState[] = [];
  let x = 0;
  let v = 0;
  
  for (let t = 0; t <= totalTime + 1e-9; t += dt) {
    let F = 0;
    let netForce = 0;
    const friction = mu * m * g;
    
    if (t < pushDuration - 1e-9) {
      // 0 ~ 1.0s: 미는 힘을 마찰력만큼 키워서 항상 알짜힘이 pushForce(2.0N)이 되게 함
      F = pushForce * m + friction;
      netForce = F - friction;
    } else {
      // 1.0초 이후: 마찰력만 작용
      if (v > 0) {
        F = -friction;
        netForce = F;
      } else {
        F = 0; 
        netForce = 0;
      }
    }
    
    // 가속도는 알짜힘으로 계산
    let a = netForce / m;
    
    history.push({ t, F, v, a, x });
    
    // Euler integration for next step
    v = v + a * dt;
    // 속도가 0 미만으로 떨어지지 않게 clamp
    if (v < 0) {
      v = 0;
    }
    x = x + v * dt;
  }
  
  return history;
}

export interface CollisionParams {
  m: number; // kg
  h: number; // m
  n: number; // count
  d: number; // m
  c: number; // ratio
  s0: number; // m
}

export interface CollisionResult {
  v: number;
  s: number;
  dt: number;
  F_avg: number;
  F_peak: number;
  J: number;
  history: { t: number, F: number }[];
}

export function simulateCollision(params: Partial<CollisionParams> = {}): CollisionResult {
  const m = params.m ?? 0.2; // 스마트폰 모형 0.2kg
  const h = params.h ?? 1.0; // 1.0m 낙하
  const n = params.n ?? 0;   // 완충재 0~5장
  const d = params.d ?? 0.005; // 5mm
  const c = params.c ?? 0.7;   // 압축 한계율 70%
  const s0 = params.s0 ?? 0.0005; // 0.5mm 맨바닥 변형
  const g = 9.8;
  
  const v = Math.sqrt(2 * g * h);
  
  // s = s0 + d * c * n^0.85
  const s = s0 + (d * c * Math.pow(n, 0.85));
  
  const dt_col = (2 * s) / v;
  const F_avg = (m * v) / dt_col;
  const F_peak = 1.57 * F_avg;
  const J = m * v;
  
  const history: { t: number, F: number }[] = [];
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * dt_col;
    const F = F_peak * Math.sin((Math.PI * t) / dt_col);
    history.push({ t, F });
  }
  
  return { v, s, dt: dt_col, F_avg, F_peak, J, history };
}

export interface StudioCollisionResult extends CollisionResult {
  bottomingOut: boolean;
}

export function simulateStudioCollision(params: Partial<CollisionParams> = {}): StudioCollisionResult {
  const m = params.m ?? 0.2;
  const h = params.h ?? 1.0;
  const n = params.n ?? 0;
  const d = params.d ?? 0.005;
  const c = params.c ?? 0.7;
  const s0 = params.s0 ?? 0.0005;
  const g = 9.8;
  const F_crush = 300; // 발포폼 기준 상수 (N)
  
  const E = m * g * h;
  const s_max = n * d * c;
  const E_cap = F_crush * s_max;
  
  if (n > 0 && E > E_cap) {
    const E_res = E - E_cap;
    const F_peak = E_res / s0;
    const v = Math.sqrt(2 * g * h);
    // Since F_peak = 1.57 * F_avg = 1.57 * (m*v / dt_col), we can deduce dt_col or just provide F_peak
    // But we just need to return F_peak and bottomingOut as requested. 
    // Wait, let's also compute the other values roughly or just return them.
    // For consistency with CollisionResult interface:
    const J = m * v;
    const F_avg = F_peak / 1.57;
    const dt_col = (m * v) / F_avg;
    const s = (dt_col * v) / 2;
    return { v, s, dt: dt_col, F_avg, F_peak, J, history: [], bottomingOut: true };
  } else {
    // 정상, 기존 공식대로 계산
    const result = simulateCollision(params);
    return { ...result, bottomingOut: false };
  }
}

// ---- 3차시 설계 스튜디오: 연속값(두께/재질/면적) 기반 설계 판정 ----
// 1차시 엔진의 s = s0 + d*c*n^0.85 공식은 "완충재 장수(n)"라는 이산값 전제다.
// 스튜디오는 학생이 두께를 연속값(mm)으로 직접 조절하므로, 같은 물리 법칙
// (dt = 2s/v, F_avg = mv/dt, F_peak = 1.57*F_avg, J = mv)을 그대로 쓰되
// s만 "두께 × 재질 압축률"로 다시 정의한다. 지수 0.85·계수 1.57은 손대지 않는다.
export interface StudioMaterial {
  id: string;
  label: string;
  compressionRatio: number; // 두께 대비 실제 압축되는 비율
  density: number; // g/cm^3 근사 (무게 계산용)
}

export const STUDIO_MATERIALS: StudioMaterial[] = [
  { id: 'silicone', label: '실리콘', compressionRatio: 0.5, density: 1.1 },
  { id: 'aircap', label: '에어캡(뽁뽁이)', compressionRatio: 0.65, density: 0.2 },
  { id: 'foam', label: '발포폼', compressionRatio: 0.75, density: 0.4 },
];

export interface StudioDesignParams {
  m: number; // kg
  v: number; // m/s
  thicknessMm: number; // 완충재 두께
  materialId: string;
  areaCm2: number; // 접촉 면적
  // 보호 장치가 전혀 없을 때 접촉면 자체가 변형되는 양(맨몸 기준, mm). 상황마다 다르다
  // (예: 유리 액정은 거의 안 눌리지만 맨손은 조금 눌린다). 기본값 0.5mm는 1차시 스마트폰 모델과 동일.
  bareContactMm?: number;
}

export interface StudioDesignResult {
  dt: number;
  F_avg: number;
  F_peak: number;
  J: number;
  weightG: number;
  history: { t: number; F: number }[];
}

export function evaluateStudioDesign(params: StudioDesignParams): StudioDesignResult {
  const s0 = (params.bareContactMm ?? 0.5) / 1000; // 맨몸 접촉 변형량 (상황별로 다름, 기본 0.5mm)
  const material = STUDIO_MATERIALS.find((mm) => mm.id === params.materialId) ?? STUDIO_MATERIALS[0];
  const thicknessM = Math.max(0, params.thicknessMm) / 1000;
  const s = s0 + thicknessM * material.compressionRatio;

  const dt = (2 * s) / params.v;
  const F_avg = (params.m * params.v) / dt;
  const F_peak = 1.57 * F_avg; // 1차시와 동일한 최대/평균힘 비율 상수
  const J = params.m * params.v;

  const thicknessCm = params.thicknessMm / 10;
  const weightG = thicknessCm * Math.max(0, params.areaCm2) * material.density;

  const history: { t: number; F: number }[] = [];
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * dt;
    const F = F_peak * Math.sin((Math.PI * t) / dt);
    history.push({ t, F });
  }

  return { dt, F_avg, F_peak, J, weightG, history };
}

export function reverseCalculateFromRealWorld(a_peak_g: number, m: number = 0.2, h: number = 1.0) {
  const g = 9.8;
  const a_peak = a_peak_g * g;
  const a_avg = a_peak / 1.57;
  
  const v = Math.sqrt(2 * g * h);
  const dt = (1.57 * v) / a_peak;
  
  const F_avg = m * a_avg;
  const J = m * v;
  
  return { a_peak, a_avg, dt, F_avg, J };
}
