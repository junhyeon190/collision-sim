// 결과 코드를 디코딩한 값에서 오개념 태그를 뽑아낸다 (spec.md §4).
// 학생 화면에는 태그를 절대 보여주지 않는다. 교사 화면 전용 집계 로직이다.
// 순수 함수만 둔다. React에 의존하지 않는다.

import type { DecodedResultCode } from './resultCode';
import { VARIABLE_CARDS } from '../components/screens/screen3/variableCards';

export type TagId = 'IMP-1' | 'IMP-2' | 'IMP-3' | 'COL-1' | 'COL-2' | 'VAR-1' | 'SCI-1';

export const TAG_LABELS: Record<TagId, string> = {
  'IMP-1': '운동 방향으로 힘이 계속 필요하다',
  'IMP-2': '처음 받은 힘이 저장·소모된다',
  'IMP-3': '힘이 없으면 자연히 정지한다',
  'COL-1': '완충재가 충격량 자체를 줄인다',
  'COL-2': '충격량과 충격력을 동일시한다',
  'VAR-1': '변인 통제가 필요 없다고 본다',
  'SCI-1': '과학적으로 타당한 응답',
};

// GR-1("그래프 높이 = 면적")은 화면2의 그래프 인터랙션(면적 비교 보기 클릭 여부)에 관한 것이라
// 18자 결과 코드에 들어가지 않는다. 그래서 이 집계에는 포함하지 못한다.
export const UNTRACKABLE_NOTE = 'GR-1은 그래프 조작 기록이라 결과 코드에 담기지 않아 이 집계에서는 빠집니다.';

export function classifyTags(decoded: DecodedResultCode): TagId[] {
  const tags: TagId[] = [];

  // 화면0: 입력2 선택지 (Screen0Expected.tsx 실제 문구 기준. spec.md 원안과 문구가 달라 확인받은 매핑)
  if (decoded.screen0.choice === 5) tags.push('COL-1'); // 충격량 자체를 없애준다
  if (decoded.screen0.choice === 2) tags.push('SCI-1'); // 충돌하는 시간을 길게 늘려준다 (정답)

  // 화면1: 그렇게 생각한 이유
  const screen1ReasonTag: Partial<Record<number, TagId>> = {
    1: 'IMP-1',
    2: 'IMP-2',
    3: 'IMP-3',
    4: 'SCI-1',
  };
  const tag1 = screen1ReasonTag[decoded.screen1.reasonChoice];
  if (tag1) tags.push(tag1);

  // 화면2: 예측 2. 그렇게 예측한 이유
  if (decoded.screen2.reasonChoice === 1) tags.push('COL-1');
  if (decoded.screen2.reasonChoice === 2) tags.push('SCI-1');

  // 화면2: 예측표 4행 (운동량 변화량·충격량에 "맨바닥이 큼" -> COL-1 / 충돌시간·평균힘 방향 반대 -> COL-2)
  const { momentum, impulse, time, avgForce } = decoded.screen2.predictions;
  if (momentum === '맨바닥이 큼' || impulse === '맨바닥이 큼') tags.push('COL-1');
  if (time === '맨바닥이 큼' || avgForce === '완충재가 큼') tags.push('COL-2');

  // 화면3: 조작 변인 칸에 카드가 2장 이상(완충재 개수 외에 다른 변인도 같이 바꿈) -> VAR-1
  const manipulatedCount = Object.values(decoded.screen3.final).filter((c) => c === 'manipulated').length;
  if (manipulatedCount > 1) tags.push('VAR-1');

  return tags;
}

// ---- 학급 전체 집계 ----
export interface TagAggregate {
  tag: TagId;
  label: string;
  count: number;
  ratio: number; // 0~1
}

export function aggregateTags(decodedList: DecodedResultCode[]): TagAggregate[] {
  const counts: Record<TagId, number> = {
    'IMP-1': 0,
    'IMP-2': 0,
    'IMP-3': 0,
    'COL-1': 0,
    'COL-2': 0,
    'VAR-1': 0,
    'SCI-1': 0,
  };
  for (const decoded of decodedList) {
    // 한 학생이 같은 태그를 여러 화면에서 반복해도 1명으로만 센다(학생 비율이 100%를 넘지 않도록).
    const uniqueTags = new Set(classifyTags(decoded));
    for (const tag of uniqueTags) counts[tag] += 1;
  }
  const total = decodedList.length || 1;
  return (Object.keys(counts) as TagId[]).map((tag) => ({
    tag,
    label: TAG_LABELS[tag],
    count: counts[tag],
    ratio: counts[tag] / total,
  }));
}

// ---- 변인 분류 정확도 (첫 시도 vs 최종) ----
export interface ClassificationAccuracy {
  firstAttemptAccuracy: number; // 0~1, 학급 평균
  finalAccuracy: number;
  studentCount: number;
}

export function computeClassificationAccuracy(decodedList: DecodedResultCode[]): ClassificationAccuracy {
  if (decodedList.length === 0) {
    return { firstAttemptAccuracy: 0, finalAccuracy: 0, studentCount: 0 };
  }
  let firstSum = 0;
  let finalSum = 0;
  for (const decoded of decodedList) {
    let firstCorrect = 0;
    let finalCorrect = 0;
    for (const card of VARIABLE_CARDS) {
      if (decoded.screen3.firstAttempt[card.id] === card.correctCategory) firstCorrect += 1;
      if (decoded.screen3.final[card.id] === card.correctCategory) finalCorrect += 1;
    }
    firstSum += firstCorrect / VARIABLE_CARDS.length;
    finalSum += finalCorrect / VARIABLE_CARDS.length;
  }
  return {
    firstAttemptAccuracy: firstSum / decodedList.length,
    finalAccuracy: finalSum / decodedList.length,
    studentCount: decodedList.length,
  };
}

// ---- 확신도 변화 분포 (화면0 최초 vs 화면5 최종) ----
export interface ConfidenceShift {
  increased: number;
  decreased: number;
  same: number;
}

export function computeConfidenceShift(decodedList: DecodedResultCode[]): ConfidenceShift {
  const result: ConfidenceShift = { increased: 0, decreased: 0, same: 0 };
  for (const decoded of decodedList) {
    const before = decoded.screen0.confidence;
    const after = decoded.screen5.finalConfidence;
    if (after > before) result.increased += 1;
    else if (after < before) result.decreased += 1;
    else result.same += 1;
  }
  return result;
}
