// 3차시 설계 캔버스의 통과/미통과 판정 (spec.md §8-6).
// "점수화하지 않는다. 통과/미통과 + 사유 문구로만 표시한다. 미통과 사유는 답을 주지 않고 되묻는다."
// 순수 함수만 둔다. React에 의존하지 않는다.

import type { StudioDesignResult } from '../engine';

export type JudgeStatus = 'pass' | 'fail' | 'warn';

export interface JudgeRow {
  key: 'force' | 'thickness' | 'weight';
  status: JudgeStatus;
  label: string;
  valueText: string;
  limitText: string;
  hint?: string;
}

export interface StudioConstraints {
  targetForce: number;
  thicknessLimitMm: number;
  weightLimitG: number;
}

export function judgeStudioDesign(result: StudioDesignResult, thicknessMm: number, constraints: StudioConstraints): JudgeRow[] {
  const rows: JudgeRow[] = [];

  const forcePass = result.F_avg <= constraints.targetForce;
  rows.push({
    key: 'force',
    status: forcePass ? 'pass' : 'fail',
    label: forcePass ? '평균힘 목표 달성' : '평균힘 목표 미달성',
    valueText: `${result.F_avg.toFixed(0)} N`,
    limitText: `목표 ${constraints.targetForce} N 이하`,
    hint: forcePass ? undefined : '두께를 늘리거나 더 부드러운 재질로 바꾸면 평균힘이 줄어듭니다. 그렇게 하면 두께나 무게 제한은 괜찮을까요?',
  });

  const thicknessPass = thicknessMm <= constraints.thicknessLimitMm;
  rows.push({
    key: 'thickness',
    status: thicknessPass ? 'pass' : 'fail',
    label: thicknessPass ? '두께 제한 통과' : '두께 제한 초과',
    valueText: `${thicknessMm.toFixed(0)} mm`,
    limitText: `제한 ${constraints.thicknessLimitMm} mm`,
    hint: thicknessPass ? undefined : '두께를 줄이면 충돌 시간이 짧아져 평균힘이 다시 커집니다. 어떻게 해결할까요?',
  });

  const weightOver = result.weightG > constraints.weightLimitG;
  rows.push({
    key: 'weight',
    status: weightOver ? 'warn' : 'pass',
    label: weightOver ? '무게 증가' : '무게 제한 통과',
    valueText: `${result.weightG.toFixed(0)} g`,
    limitText: `제한 ${constraints.weightLimitG} g`,
    hint: weightOver ? '접촉 면적을 줄이거나 더 가벼운 재질로 바꾸면 무게가 줄어듭니다.' : undefined,
  });

  return rows;
}

export function isDesignPassing(rows: JudgeRow[]): boolean {
  return rows.every((r) => r.status !== 'fail');
}
