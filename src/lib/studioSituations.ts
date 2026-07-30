// 3차시 설계 스튜디오 8-2 "상황 선택"의 프리셋 목록 (spec.md §8-2).
// 질량·속도는 실제 통계값이 아니라 수업용 근사치이며, 학생이 자유롭게 수정할 수 있다.
// 순수 데이터만 둔다. React에 의존하지 않는다.

export interface StudioSituation {
  id: string;
  label: string; // 카드에 표시될 상황 이름
  collidingObject: string; // 충돌하는 물체
  protectedTarget: string; // 보호 대상
  defaultMass: number; // kg
  defaultVelocity: number; // m/s (충돌 순간 속도)
  defaultTargetForce: number; // N, 목표 평균힘 기본값
  defaultThicknessLimitMm: number; // mm
  defaultWeightLimitG: number; // g
  bareContactMm: number; // 보호장치가 전혀 없을 때 접촉면(맨몸) 자체의 변형량 근사치, mm
  note: string; // 질량·속도 근사 방식에 대한 짧은 설명 (학생에게 투명하게 안내)
}

export const STUDIO_SITUATIONS: StudioSituation[] = [
  {
    id: 'baseball',
    label: '야구 포구',
    collidingObject: '야구공',
    protectedTarget: "포수의 손",
    defaultMass: 0.145,
    defaultVelocity: 35,
    defaultTargetForce: 400,
    defaultThicknessLimitMm: 20,
    defaultWeightLimitG: 150,
    bareContactMm: 4,
    note: '빠른 공(약 시속 126km)을 포수 미트로 받는 상황',
  },
  {
    id: 'goalkeeper',
    label: '골키퍼 장갑',
    collidingObject: '축구공',
    protectedTarget: '골키퍼의 손',
    defaultMass: 0.45,
    defaultVelocity: 25,
    defaultTargetForce: 500,
    defaultThicknessLimitMm: 15,
    defaultWeightLimitG: 120,
    bareContactMm: 5,
    note: '강한 슛(약 시속 90km)을 손으로 막는 상황',
  },
  {
    id: 'bike-helmet',
    label: '자전거 헬멧',
    collidingObject: '머리(자전거에서 넘어짐)',
    protectedTarget: '머리',
    defaultMass: 5,
    defaultVelocity: 6,
    defaultTargetForce: 1000,
    defaultThicknessLimitMm: 25,
    defaultWeightLimitG: 300,
    bareContactMm: 1,
    note: '머리 질량은 5kg으로 근사, 낙차 속도는 자전거 전도 상황을 가정',
  },
  {
    id: 'airbag',
    label: '자동차 에어백',
    collidingObject: '운전자의 머리',
    protectedTarget: '운전자의 머리',
    defaultMass: 4.5,
    defaultVelocity: 13.9,
    defaultTargetForce: 1500,
    defaultThicknessLimitMm: 200,
    defaultWeightLimitG: 2000,
    bareContactMm: 2,
    note: '머리 질량 4.5kg 근사, 속도는 시속 50km 정면 충돌 가정',
  },
  {
    id: 'seatbelt',
    label: '안전벨트',
    collidingObject: '탑승자 상체',
    protectedTarget: '탑승자의 상체',
    defaultMass: 40,
    defaultVelocity: 13.9,
    defaultTargetForce: 3000,
    defaultThicknessLimitMm: 300,
    defaultWeightLimitG: 3000,
    bareContactMm: 8,
    note: '상체 질량 40kg 근사, 속도는 시속 50km 정면 충돌 가정',
  },
  {
    id: 'highjump-mat',
    label: '높이뛰기 매트',
    collidingObject: '선수의 몸',
    protectedTarget: '선수의 등·허리',
    defaultMass: 55,
    defaultVelocity: 6.3,
    defaultTargetForce: 2500,
    defaultThicknessLimitMm: 500,
    defaultWeightLimitG: 30000,
    bareContactMm: 3,
    note: '약 2m 높이의 바를 넘은 뒤 떨어지는 상황(v=√(2gh), h=2m)',
  },
  {
    id: 'knee-pad',
    label: '무릎 보호대',
    collidingObject: '무릎',
    protectedTarget: '무릎 관절',
    defaultMass: 8,
    defaultVelocity: 3,
    defaultTargetForce: 800,
    defaultThicknessLimitMm: 15,
    defaultWeightLimitG: 200,
    bareContactMm: 2,
    note: '무릎에 실리는 충격 질량을 8kg으로 근사한 낙상 상황',
  },
  {
    id: 'phone-case',
    label: '휴대전화 케이스',
    collidingObject: '스마트폰',
    protectedTarget: '휴대전화 액정',
    defaultMass: 0.2,
    defaultVelocity: 4.43,
    defaultTargetForce: 100,
    defaultThicknessLimitMm: 15,
    defaultWeightLimitG: 50,
    bareContactMm: 0.5,
    note: '1차시와 동일한 조건: 1.0m 높이에서 떨어지는 스마트폰(v=√(2gh))',
  },
];

export function findStudioSituation(id: string | null): StudioSituation | null {
  if (!id) return null;
  return STUDIO_SITUATIONS.find((s) => s.id === id) ?? null;
}
