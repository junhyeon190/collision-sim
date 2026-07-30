import { useEffect, useMemo, useState } from 'react';
import { decodeResultCode, DecodedResultCode } from '../lib/resultCode';
import {
  aggregateTags,
  computeClassificationAccuracy,
  computeConfidenceShift,
  UNTRACKABLE_NOTE,
} from '../lib/misconceptionTags';
import { ClassSettings, DEFAULT_CLASS_SETTINGS, encodeClassSettings } from '../lib/classSettings';

const SCREEN_LABELS: { value: string; label: string }[] = [
  { value: 'all', label: '제한 없음(전체 개방)' },
  { value: '0', label: '화면0까지' },
  { value: '1', label: '화면1까지' },
  { value: '2', label: '화면2까지' },
  { value: '3', label: '화면3까지' },
  { value: '5', label: '화면5까지' },
];

const TEACHER_SETTINGS_KEY = 'collision-sim-teacher-settings';

function loadTeacherSettings(): ClassSettings {
  try {
    const raw = localStorage.getItem(TEACHER_SETTINGS_KEY);
    if (!raw) return DEFAULT_CLASS_SETTINGS;
    return { ...DEFAULT_CLASS_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CLASS_SETTINGS;
  }
}

function Bar({ label, ratio, count }: { label: string; ratio: number; count: number }) {
  const pct = Math.min(100, Math.round(ratio * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span>{label}</span>
        <span>
          {count}명 ({pct}%)
        </span>
      </div>
      <div className="w-full h-3 bg-gray-700 rounded overflow-hidden">
        <div className="h-full bg-teal-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Teacher() {
  const [rawInput, setRawInput] = useState('');
  const [decodedList, setDecodedList] = useState<DecodedResultCode[]>([]);
  const [invalidCount, setInvalidCount] = useState(0);
  const [hasRun, setHasRun] = useState(false);

  const [settings, setSettings] = useState<ClassSettings>(loadTeacherSettings);

  useEffect(() => {
    localStorage.setItem(TEACHER_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const settingsCode = useMemo(() => encodeClassSettings(settings), [settings]);

  const screenSelectValue = settings.openScreenLimit === null ? 'all' : String(settings.openScreenLimit);

  const handleAggregate = () => {
    const lines = rawInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const decoded: DecodedResultCode[] = [];
    let invalid = 0;
    for (const line of lines) {
      const d = decodeResultCode(line);
      if (d) decoded.push(d);
      else invalid += 1;
    }
    setDecodedList(decoded);
    setInvalidCount(invalid);
    setHasRun(true);
  };

  const tagAgg = useMemo(() => aggregateTags(decodedList), [decodedList]);
  const accuracy = useMemo(() => computeClassificationAccuracy(decodedList), [decodedList]);
  const confidence = useMemo(() => computeConfidenceShift(decodedList), [decodedList]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-teal-400 mb-2">교사 대시보드</h1>
          <p className="text-gray-400 text-sm">
            학생들이 학습지에 적어 낸 결과 코드를 한 줄에 하나씩 붙여넣고 집계하세요. 서버 없이 이
            브라우저 안에서만 계산됩니다.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h2 className="font-bold text-lg">교사 설정</h2>
          <p className="text-xs text-gray-400 -mt-2">
            이 설정은 이 기기(선생님 컴퓨터)에만 저장됩니다. 아래 코드를 칠판에 적어 주면 학생이
            화면 상단 "수업 코드"에 입력해 동기화합니다.
          </p>

          <div>
            <label className="block text-sm text-gray-300 mb-1">화면 개방 범위</label>
            <select
              value={screenSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                setSettings((s) => ({
                  ...s,
                  openScreenLimit: v === 'all' ? null : (Number(v) as ClassSettings['openScreenLimit']),
                }));
              }}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm outline-none focus:border-teal-500"
            >
              {SCREEN_LABELS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">피드백(정답) 공개</label>
            <button
              onClick={() => setSettings((s) => ({ ...s, feedbackUnlocked: !s.feedbackUnlocked }))}
              className={`px-3 py-1 rounded text-sm font-bold ${
                settings.feedbackUnlocked ? 'bg-teal-500 text-gray-900' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {settings.feedbackUnlocked ? '공개' : '잠김'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">그래프 수치 표시(화면2)</label>
            <button
              onClick={() => setSettings((s) => ({ ...s, showNumbers: !s.showNumbers }))}
              className={`px-3 py-1 rounded text-sm font-bold ${
                settings.showNumbers ? 'bg-teal-500 text-gray-900' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {settings.showNumbers ? '표시' : '숨김'}
            </button>
          </div>

          <div className="pt-2 border-t border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-400">수업 설정 코드</span>
            <span className="text-2xl font-mono font-bold text-teal-300 tracking-widest">{settingsCode}</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h2 className="font-bold text-lg">결과 코드 집계</h2>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={6}
            placeholder={'K7QM-3XB9-PW2F-HR5T-8J\nA4Z7-91XB-ZXNF-ZKE9-7G\n...'}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded font-mono text-sm text-teal-200 outline-none focus:border-teal-500"
          />
          <button
            onClick={handleAggregate}
            className="px-5 py-2 bg-teal-500 text-gray-900 font-bold rounded hover:bg-teal-400"
          >
            집계하기
          </button>
          {hasRun && (
            <p className="text-xs text-gray-400">
              총 {decodedList.length + invalidCount}줄 중 유효한 코드 {decodedList.length}개
              {invalidCount > 0 && (
                <span className="text-red-400"> · 인식 실패 {invalidCount}개(체크섬 불일치 또는 형식 오류)</span>
              )}
            </p>
          )}
        </div>

        {hasRun && decodedList.length > 0 && (
          <>
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-3">오개념 태그별 비율</h2>
              {tagAgg.map((t) => (
                <Bar key={t.tag} label={`${t.tag} · ${t.label}`} ratio={t.ratio} count={t.count} />
              ))}
              <p className="text-xs text-gray-500 mt-2">{UNTRACKABLE_NOTE}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-3">변인 분류 정확도 (화면3, 9장 중 평균)</h2>
              <Bar
                label="첫 시도"
                ratio={accuracy.firstAttemptAccuracy}
                count={Math.round(accuracy.firstAttemptAccuracy * 9)}
              />
              <Bar
                label="최종"
                ratio={accuracy.finalAccuracy}
                count={Math.round(accuracy.finalAccuracy * 9)}
              />
              <p className="text-xs text-gray-500 mt-1">
                (막대 옆 숫자는 9장 중 평균적으로 맞춘 카드 수입니다)
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="font-bold text-lg mb-3">확신도 변화 (화면0 → 화면5)</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-teal-400">{confidence.increased}</div>
                  <div className="text-xs text-gray-400">높아짐</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-300">{confidence.same}</div>
                  <div className="text-xs text-gray-400">그대로</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{confidence.decreased}</div>
                  <div className="text-xs text-gray-400">낮아짐</div>
                </div>
              </div>
            </div>
          </>
        )}

        {hasRun && decodedList.length === 0 && (
          <p className="text-sm text-red-400">유효한 코드가 없습니다. 코드를 다시 확인해 주세요.</p>
        )}
      </div>
    </div>
  );
}
