import React from 'react';

interface StudioLayoutProps {
  step: number; // 1~7
  title: string;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
}

const STEP_LABELS = ['코드 복원', '상황 선택', '문제 정의', '프롬프트', 'AI 검증', '설계·판정', '출력'];

export default function StudioLayout({
  step, title, onPrev, onNext, nextLabel = '다음', nextDisabled = false, children,
}: StudioLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between gap-4 shrink-0 print:hidden">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-indigo-600 font-bold shrink-0 whitespace-nowrap">설계 스튜디오</span>
          <div className="flex gap-1 shrink-0">
            {STEP_LABELS.map((label, idx) => (
              <div
                key={label}
                title={label}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${idx + 1 === step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
          <h2 className="text-lg font-bold text-gray-800 truncate ml-2" title={title}>{title}</h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onPrev && (
            <button
              onClick={onPrev}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-bold text-sm hover:bg-gray-300 transition-colors"
            >
              이전
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                nextDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              }`}
            >
              {nextLabel}
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto pb-10">{children}</div>
      </main>
    </div>
  );
}
