import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { decodeClassSettings } from '../lib/classSettings';

interface LayoutProps {
  step: number;
  question: string;
  expectedArea: React.ReactNode;
  simulationArea: React.ReactNode;
  observedArea: React.ReactNode;
  bottomArea: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export default function Layout({
  step, question, expectedArea, simulationArea, observedArea, bottomArea,
  onPrev, onNext, prevLabel = '이전', nextLabel = '다음', nextDisabled = false,
}: LayoutProps) {
  const studentId = useStore((state) => state.studentId);
  const openScreenLimit = useStore((state) => state.openScreenLimit);
  const classSettingsCode = useStore((state) => state.classSettingsCode);
  const applyClassSettings = useStore((state) => state.applyClassSettings);
  const [activeTab, setActiveTab] = useState<'expected' | 'observed' | 'bottom'>('expected');
  const [showSettingsInput, setShowSettingsInput] = useState(false);
  const [settingsInput, setSettingsInput] = useState('');
  const [settingsError, setSettingsError] = useState(false);

  const handleApplySettings = () => {
    const decoded = decodeClassSettings(settingsInput);
    if (!decoded) {
      setSettingsError(true);
      return;
    }
    applyClassSettings(settingsInput.toUpperCase(), decoded);
    setSettingsError(false);
    setShowSettingsInput(false);
    setSettingsInput('');
  };

  const steps = [0, 1, 2, 3, 5]; // 4차시는 시뮬레이터 미사용

  // 교사가 "현재 개방 화면"을 지정하면, 학생은 그 화면에서 더 진행할 수 없다.
  const limitIndex = openScreenLimit === null ? Infinity : steps.indexOf(openScreenLimit);
  const teacherBlocksNext = steps.indexOf(step) >= limitIndex;
  const effectiveNextDisabled = nextDisabled || teacherBlocksNext;

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Top Bar. 휴대폰처럼 폭·높이가 모두 좁은 화면에서는 두 줄로 접히고(flex-wrap),
          글자·아이콘 크기가 줄어든다(sm: 이상에서는 기존 데스크톱/태블릿 모습 그대로). */}
      <header className="flex-none bg-white border-b shrink-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-3 py-1.5 sm:h-16 sm:px-6 sm:py-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex gap-1 sm:gap-2 shrink-0">
            {steps.map((s, idx) => (
              <div
                key={s}
                className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full font-bold text-xs sm:text-base
                  ${s === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
          <h2 className="text-sm sm:text-xl font-bold text-gray-800 sm:ml-4 truncate max-w-[40vw] sm:max-w-none" title={question}>{question}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 sm:shrink-0">
          {(onPrev || onNext) && (
            <div className="flex items-center gap-2 sm:pr-4 sm:border-r whitespace-nowrap">
              {onPrev && (
                <button
                  onClick={onPrev}
                  className="px-2.5 py-1 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded font-bold text-xs sm:text-sm hover:bg-gray-300 transition-colors"
                >
                  {prevLabel}
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  disabled={effectiveNextDisabled}
                  title={teacherBlocksNext ? '선생님이 아직 다음 화면을 열지 않았습니다' : undefined}
                  className={`px-2.5 py-1 sm:px-4 sm:py-2 rounded font-bold text-xs sm:text-sm transition-colors ${
                    effectiveNextDisabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  }`}
                >
                  {nextLabel}
                </button>
              )}
            </div>
          )}
          <span className="hidden sm:inline text-gray-600 font-medium text-sm">학번: {studentId || '입력 안 됨'}</span>
          <button
            onClick={() => {
              if (window.confirm('모든 기록을 지우고 처음부터 다시 시작하시겠습니까?')) {
                localStorage.clear();
                // '/'로 고정하면 GitHub Pages처럼 하위 경로(/collision-sim/)에 배포됐을 때
                // 사이트 자체가 없는 도메인 루트로 가버린다. 실제 배포 경로(BASE_URL)로 이동해야 한다.
                window.location.href = import.meta.env.BASE_URL;
              }
            }}
            className="px-2 py-1 sm:px-3 bg-red-50 text-red-600 border border-red-200 rounded text-xs sm:text-sm font-bold hover:bg-red-100 whitespace-nowrap"
          >
            처음부터
          </button>
          <button className="hidden sm:flex w-8 h-8 bg-gray-200 rounded-full items-center justify-center font-bold text-gray-600 hover:bg-gray-300">
            ?
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSettingsInput((v) => !v)}
              className="px-1.5 py-1 text-[11px] sm:text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
            >
              수업 코드{classSettingsCode ? `: ${classSettingsCode}` : ''}
            </button>
            {showSettingsInput && (
              <div className="absolute right-0 top-full mt-2 bg-white border rounded shadow-lg p-3 z-50 w-56">
                <p className="text-xs text-gray-500 mb-2">선생님이 칠판에 적은 6자리 코드를 입력하세요</p>
                <input
                  type="text"
                  value={settingsInput}
                  onChange={(e) => {
                    setSettingsInput(e.target.value);
                    setSettingsError(false);
                  }}
                  placeholder="예: A2NW93"
                  className="w-full p-2 border rounded text-sm font-mono outline-none focus:border-blue-500 mb-2"
                />
                {settingsError && <p className="text-xs text-red-600 mb-2">코드를 다시 확인해 주세요.</p>}
                <button
                  onClick={handleApplySettings}
                  className="w-full py-1.5 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700"
                >
                  적용
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - Desktop (>1024px) */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden p-4 gap-4">
          {/* 나의 예상 */}
          <div className={`${observedArea ? 'w-[26%]' : 'w-[40%]'} bg-white rounded-lg shadow border p-4 flex flex-col overflow-y-auto`}>
            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex-none">나의 예상</h3>
            <div className="flex-1 min-h-0">
              {expectedArea}
            </div>
          </div>
          
          {/* 시뮬레이션 */}
          <div className={`${observedArea ? 'w-[44%]' : 'w-[60%]'} bg-white rounded-lg shadow border p-4 flex flex-col overflow-hidden relative`}>
            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex-none">시뮬레이션</h3>
            <div className="flex-1 overflow-hidden">
              {simulationArea}
            </div>
          </div>
          
          {/* 관찰 결과 */}
          {observedArea && (
            <div className="w-[30%] bg-white rounded-lg shadow border p-4 flex flex-col overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex-none">관찰 결과</h3>
              <div className="flex-1 min-h-0">
                {observedArea}
              </div>
            </div>
          )}
        </div>

        {/* 하단 기록 영역 */}
        {bottomArea && (
          <div className="h-48 bg-white border-t p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] overflow-y-auto">
            {bottomArea}
          </div>
        )}
      </div>

      {/* Main Content Area - Mobile/Tablet (<1024px). 휴대폰 가로처럼 세로 폭 자체가 짧은 화면도
          있어서, 시뮬레이션 영역은 vh 비율에 min/max 상한을 같이 둬 너무 커지거나 작아지지 않게 한다. */}
      <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
        {/* 시뮬레이션 상단 고정 */}
        <div className="h-[38vh] min-h-[130px] max-h-[260px] bg-white border-b flex flex-col shrink-0 p-2 sm:p-4">
          {simulationArea}
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex bg-gray-100 border-b shrink-0">
          <button
            className={`flex-1 py-2 sm:py-3 text-sm sm:text-base font-bold ${activeTab === 'expected' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('expected')}
          >
            나의 예상
          </button>
          {observedArea && (
            <button
              className={`flex-1 py-2 sm:py-3 text-sm sm:text-base font-bold ${activeTab === 'observed' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('observed')}
            >
              관찰 결과
            </button>
          )}
          {bottomArea && (
            <button
              className={`flex-1 py-2 sm:py-3 text-sm sm:text-base font-bold ${activeTab === 'bottom' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('bottom')}
            >
              최종 기록
            </button>
          )}
        </div>

        {/* 탭 내용 영역 */}
        <div className="flex-1 overflow-y-auto bg-white p-3 sm:p-4">
          {activeTab === 'expected' && expectedArea}
          {activeTab === 'observed' && observedArea}
          {activeTab === 'bottom' && bottomArea}
        </div>
      </div>
    </div>
  );
}
