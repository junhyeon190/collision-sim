import type { CardCategory } from '../../../store/useStore';

export interface VariableCard {
  id: string;
  label: string;
  correctCategory: CardCategory; // 학생 화면에는 절대 노출하지 않는다. 되묻기 로직 계산에만 사용.
}

// spec.md §5 화면3 — 카드 9장 (12장에서 축소)
export const VARIABLE_CARDS: VariableCard[] = [
  { id: 'cushion_count', label: '완충재 개수', correctCategory: 'manipulated' },
  { id: 'accel_peak', label: '가속도 피크값', correctCategory: 'dependent' },
  { id: 'collision_time', label: '충돌 시간', correctCategory: 'dependent' },
  { id: 'avg_force', label: '평균힘', correctCategory: 'dependent' },
  { id: 'mass', label: '물체 질량', correctCategory: 'controlled' },
  { id: 'drop_height', label: '낙하 높이', correctCategory: 'controlled' },
  { id: 'cushion_material', label: '완충재 재질', correctCategory: 'controlled' },
  { id: 'cushion_thickness', label: '완충재 한 장의 두께', correctCategory: 'controlled' },
  { id: 'bounce', label: '충돌 후 튕김 여부', correctCategory: 'controlled' },
];
