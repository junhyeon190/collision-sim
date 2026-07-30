// 3차시 프롬프트 조립기(8-4)와 산출물 출력(8-7)이 똑같은 프롬프트 문장을 써야 하므로
// 한 곳에서만 조립한다 (계산·문구를 두 번 만들지 않는다).
// 순수 함수만 둔다. React에 의존하지 않는다.

import type { StudioState } from '../store/useStore';
import { evaluateStudioDesign, type StudioDesignResult } from '../engine';

export const STUDIO_PROMPT_FIXED_TAIL =
  '구조와 과학적 원리를 나누어 설명하고, 이 설계의 한계 세 가지도 함께 알려 줘.';

// "현재(보호 장치 없음)" 기준값: 두께 0mm로 설계 판정과 동일한 엔진 함수를 재사용해 계산한다.
// bareContactMm은 상황별 "맨몸 접촉 변형량"(STUDIO_SITUATIONS 참고)이며, 지정하지 않으면 0.5mm.
export function buildStudioBaseline(mass: number, velocity: number, bareContactMm: number = 0.5): StudioDesignResult {
  return evaluateStudioDesign({ m: mass, v: velocity, thicknessMm: 0, materialId: 'foam', areaCm2: 1, bareContactMm });
}

export function buildStudioPrompt(studio: StudioState, mass: number, velocity: number, baseline: StudioDesignResult): string {
  const lines = [
    `질량 ${mass} kg인 [${studio.collidingObject || '물체'}]이(가) ${velocity} m/s로 충돌한다.`,
    `현재 충돌 시간은 약 ${baseline.dt.toFixed(4)}초, 평균힘은 약 ${baseline.F_avg.toFixed(0)} N이다.`,
    `충돌 시간을 늘려 평균힘을 ${studio.targetForce ?? '?'} N 이하로 줄이는 보호 장치를 고안해 줘.`,
    `제약 조건: 두께 ${studio.thicknessLimitMm ?? '?'} mm 이하, 무게 ${studio.weightLimitG ?? '?'} g 이하, 재료 [${studio.material || '?'}].`,
    STUDIO_PROMPT_FIXED_TAIL,
  ];
  return lines.join('\n');
}
