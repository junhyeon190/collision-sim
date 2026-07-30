import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 상태 인터페이스 정의
export interface Screen0State {
  reason: string;
  choice: number | null; // 1~5
  confidence: number | null; // 1~5
  isLocked: boolean;
}

export interface Screen1State {
  forcePrediction: number | null;
  motionPrediction: number | null;
  reasonChoice: number | null;
  reasonCustom: string;
  interpretationAnswer: number | null;
  isLocked: boolean;
}

export interface Screen2State {
  predictions: {
    momentum: string | null; // '맨바닥이 큼' | '완충재가 큼' | '같음' | '모르겠음'
    impulse: string | null;
    time: string | null;
    avgForce: string | null;
  };
  reasonChoice: number | null;
  progress: number;
  isPlaying: boolean;
  isSlowMotion: boolean;
  hasComparedArea: boolean;
  bottomAnswers: { b1: string; b2: string; b3: string; };
  isLocked: boolean;
}

export type CardCategory = 'manipulated' | 'dependent' | 'controlled';

export interface Screen3State {
  placements: Record<string, CardCategory | null>; // 카드 id -> 분류된 상자 (미분류면 null)
  firstAttempt: Record<string, CardCategory | null> | null; // 9장이 모두 처음 분류된 시점의 스냅샷
  moveCount: number; // 이미 분류된 카드를 다시 옮긴 횟수(수정 횟수)
  reason: string;
  isLocked: boolean;
}

export interface Screen5State {
  modifiedChoice: number | null; // 화면 0의 수정된 선택
  finalConfidence: number | null;
  reflectionReason: string;
}

export interface ExitQuestionsState {
  q1: number | null;
  q2: number | null;
  q3: string;
  q4: string;
}

// 3차시 설계 스튜디오 (spec.md §8). /lab의 학생 응답과는 별개의 활동이라 별도 슬라이스로 둔다.
export interface StudioState {
  // 8-1 코드 복원 / 실측값 입력
  resultCodeInput: string;
  restoredStudentCode: number | null; // 코드 복원 성공 시 표시용 (null = 미복원)
  measuredAccelN0: number | null; // g, 완충재 0장일 때 실측 최대가속도
  measuredAccelN3: number | null; // g, 완충재 3장일 때 실측 최대가속도

  // 8-2 상황 선택
  situationId: string | null;
  mass: number | null; // kg (프리셋을 학생이 수정 가능)
  velocity: number | null; // m/s

  // 8-3 문제 정의
  collidingObject: string;
  protectedTarget: string;
  currentProblem: string;
  targetForce: number | null; // N
  material: string;
  thicknessLimitMm: number | null;
  weightLimitG: number | null;

  // 8-4 프롬프트 조립기
  promptCopied: boolean;

  // 8-5 AI 답변 자기 검증
  aiAnswer: string;
  checkImpulseTime: boolean;
  checkDistinguished: boolean;
  checkCalcThicknessMm: number | null;
  checkCalcMaterialId: string;
  checkWithinConstraints: boolean;
  checkDiscardedReason: string;

  // 8-6 설계 캔버스 (최종 설계값, 8-7 산출물에 그대로 사용)
  designThicknessMm: number;
  designMaterialId: string;
  designAreaCm2: number;
}

export interface AppState {
  studentId: string;
  
  // 최초 응답
  screen0: Screen0State;
  screen1: Screen1State;
  screen2: Screen2State;
  screen3: Screen3State;
  
  // 5번 화면 (수정 응답)
  screen5: Screen5State;
  
  // 출구 문항
  exitQuestions: ExitQuestionsState;

  // 3차시 설계 스튜디오
  studio: StudioState;

  // 교사 설정 플래그 (기본값은 학생에게 불리하지 않은 쪽: 잠금/숨김)
  feedbackUnlocked: boolean;
  showNumbers: boolean; // 화면2까지 수치 표시 여부 (교사 토글, 기본 false)
  openScreenLimit: number | null; // 학생이 진행 가능한 마지막 화면. null이면 제한 없음
  classSettingsCode: string; // 학생이 마지막으로 입력해 적용한 수업 설정 코드(표시용)

  // Actions
  setStudentId: (id: string) => void;
  updateScreen0: (data: Partial<Screen0State>) => void;
  updateScreen1: (data: Partial<Screen1State>) => void;
  updateScreen2: (data: Partial<Screen2State>) => void;
  updateScreen3: (data: Partial<Screen3State>) => void;
  updateScreen5: (data: Partial<Screen5State>) => void;
  updateExitQuestions: (data: Partial<ExitQuestionsState>) => void;
  updateStudio: (data: Partial<StudioState>) => void;
  setFeedbackUnlocked: (unlocked: boolean) => void;
  applyClassSettings: (code: string, settings: { openScreenLimit: number | null; feedbackUnlocked: boolean; showNumbers: boolean }) => void;
}

const defaultScreen0: Screen0State = { reason: '', choice: null, confidence: null, isLocked: false };
const defaultScreen1: Screen1State = { forcePrediction: null, motionPrediction: null, reasonChoice: null, reasonCustom: '', interpretationAnswer: null, isLocked: false };
const defaultScreen2: Screen2State = { 
  predictions: {
    momentum: null,
    impulse: null,
    time: null,
    avgForce: null
  },
  reasonChoice: null,
  progress: 0,
  isPlaying: false,
  isSlowMotion: false,
  hasComparedArea: false,
  bottomAnswers: { b1: '', b2: '', b3: '' },
  isLocked: false
};
const defaultScreen3: Screen3State = { placements: {}, firstAttempt: null, moveCount: 0, reason: '', isLocked: false };
const defaultScreen5: Screen5State = { modifiedChoice: null, finalConfidence: null, reflectionReason: '' };
const defaultExitQuestions: ExitQuestionsState = { q1: null, q2: null, q3: '', q4: '' };
const defaultStudio: StudioState = {
  resultCodeInput: '',
  restoredStudentCode: null,
  measuredAccelN0: null,
  measuredAccelN3: null,
  situationId: null,
  mass: null,
  velocity: null,
  collidingObject: '',
  protectedTarget: '',
  currentProblem: '',
  targetForce: null,
  material: '',
  thicknessLimitMm: null,
  weightLimitG: null,
  promptCopied: false,
  aiAnswer: '',
  checkImpulseTime: false,
  checkDistinguished: false,
  checkCalcThicknessMm: null,
  checkCalcMaterialId: 'foam',
  checkWithinConstraints: false,
  checkDiscardedReason: '',
  designThicknessMm: 10,
  designMaterialId: 'foam',
  designAreaCm2: 30,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      studentId: '',
      screen0: defaultScreen0,
      screen1: defaultScreen1,
      screen2: defaultScreen2,
      screen3: defaultScreen3,
      screen5: defaultScreen5,
      exitQuestions: defaultExitQuestions,
      studio: defaultStudio,
      feedbackUnlocked: false,
      showNumbers: false,
      openScreenLimit: null,
      classSettingsCode: '',

      setStudentId: (id) => set({ studentId: id }),

      applyClassSettings: (code, settings) => set({
        classSettingsCode: code,
        openScreenLimit: settings.openScreenLimit,
        feedbackUnlocked: settings.feedbackUnlocked,
        showNumbers: settings.showNumbers,
      }),
      
      updateScreen0: (data) => set((state) => {
        if (state.screen0.isLocked && !data.isLocked) return state; // 잠금 해제 요청이 아니면 무시 (필요시)
        return { screen0: { ...state.screen0, ...data } };
      }),
      
      updateScreen1: (data) => set((state) => {
        if (state.screen1.isLocked && data.interpretationAnswer === undefined && !data.isLocked) {
          return state;
        }
        return { screen1: { ...state.screen1, ...data } };
      }),
      
      updateScreen2: (data) => set((state) => {
        if (state.screen2.isLocked && !data.isLocked) {
          // progress, isPlaying, isSlowMotion 등은 업데이트 허용해야 함
          if (data.progress !== undefined || data.isPlaying !== undefined || data.isSlowMotion !== undefined || data.hasComparedArea !== undefined || data.bottomAnswers !== undefined) {
             return { screen2: { ...state.screen2, ...data } };
          }
          return state;
        }
        return { screen2: { ...state.screen2, ...data } };
      }),
      
      updateScreen3: (data) => set((state) => {
        if (state.screen3.isLocked && !data.isLocked) return state;
        return { screen3: { ...state.screen3, ...data } };
      }),
      
      updateScreen5: (data) => set((state) => ({
        screen5: { ...state.screen5, ...data }
      })),
      
      updateExitQuestions: (data) => set((state) => ({
        exitQuestions: { ...state.exitQuestions, ...data }
      })),

      updateStudio: (data) => set((state) => ({
        studio: { ...state.studio, ...data }
      })),

      setFeedbackUnlocked: (unlocked) => set({ feedbackUnlocked: unlocked })
    }),
    {
      name: 'collision-sim-storage', // localStorage key
      version: 1, // 버전 번호 (향후 구조 변경 시 증가)
      merge: (persistedState: unknown, currentState: AppState) => {
        // 객체를 깊은 병합(Deep Merge)하여 기존 데이터에 누락된 새 필드가 기본값으로 채워지도록 함
        const deepMerge = (target: unknown, source: unknown): unknown => {
          if (typeof target !== 'object' || target === null) return source;
          if (typeof source !== 'object' || source === null) return target;

          const targetObj = target as Record<string, unknown>;
          const sourceObj = source as Record<string, unknown>;
          const result: Record<string, unknown> = { ...targetObj };
          for (const key in sourceObj) {
            if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
              const sVal = sourceObj[key];
              const tVal = targetObj[key];
              if (
                typeof sVal === 'object' && sVal !== null &&
                !Array.isArray(sVal) &&
                typeof tVal === 'object' && tVal !== null &&
                !Array.isArray(tVal)
              ) {
                result[key] = deepMerge(tVal, sVal);
              } else {
                result[key] = sVal;
              }
            }
          }
          return result;
        };
        
        return deepMerge(currentState, persistedState) as AppState;
      },
    }
  )
);
