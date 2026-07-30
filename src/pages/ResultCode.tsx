import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { encodeResultCode, decodeResultCode } from '../lib/resultCode';

export default function ResultCode() {
  const navigate = useNavigate();
  const state = useStore((s) => s);
  const [checkInput, setCheckInput] = useState('');
  const [checkResult, setCheckResult] = useState<'idle' | 'ok' | 'fail'>('idle');

  const code = useMemo(
    () =>
      encodeResultCode({
        studentId: state.studentId,
        screen0: { choice: state.screen0.choice, confidence: state.screen0.confidence },
        screen1: {
          forcePrediction: state.screen1.forcePrediction,
          motionPrediction: state.screen1.motionPrediction,
          reasonChoice: state.screen1.reasonChoice,
        },
        screen2: { predictions: state.screen2.predictions, reasonChoice: state.screen2.reasonChoice },
        screen3: {
          placements: state.screen3.placements,
          firstAttempt: state.screen3.firstAttempt,
          moveCount: state.screen3.moveCount,
        },
        screen5: { modifiedChoice: state.screen5.modifiedChoice, finalConfidence: state.screen5.finalConfidence },
        exitQuestions: { q1: state.exitQuestions.q1, q2: state.exitQuestions.q2 },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleVerify = () => {
    const decoded = decodeResultCode(checkInput);
    if (!decoded) {
      setCheckResult('fail');
      return;
    }
    const matches =
      decoded.screen0.choice === (state.screen0.choice ?? 1) &&
      decoded.screen0.confidence === (state.screen0.confidence ?? 1) &&
      decoded.screen5.modifiedChoice === (state.screen5.modifiedChoice ?? 1);
    setCheckResult(matches ? 'ok' : 'fail');
  };

  const handleDownloadText = () => {
    const lines = [
      `학번: ${state.studentId}`,
      `결과 코드: ${code}`,
      '',
      '[화면0] 방석이 충격을 줄이는 까닭',
      state.screen0.reason || '(응답 없음)',
      '',
      '[화면1] 손을 뗀 뒤 힘 예측 이유(기타 서술)',
      state.screen1.reasonCustom || '(응답 없음)',
      '',
      '[화면2] 빈칸 채우기',
      `- ${state.screen2.bottomAnswers.b1 || '(응답 없음)'}`,
      `- ${state.screen2.bottomAnswers.b2 || '(응답 없음)'}`,
      `- ${state.screen2.bottomAnswers.b3 || '(응답 없음)'}`,
      '',
      '[화면3] 변인 분류 이유',
      state.screen3.reason || '(응답 없음)',
      '',
      '[화면5] 생각 수정 서술',
      state.screen5.reflectionReason || '(응답 없음)',
      '',
      '[출구 문항 3] 통제 변인',
      state.exitQuestions.q3 || '(응답 없음)',
      '',
      '[출구 문항 4] 완충재 원리 설명',
      state.exitQuestions.q4 || '(응답 없음)',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `충돌시뮬레이터_기록_${state.studentId || '학생'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow border p-8 text-center space-y-6">
        <h1 className="text-xl font-bold text-gray-800">수고했습니다!</h1>
        <p className="text-sm text-gray-600">
          아래 코드를 학습지에 그대로 적어 주세요. 3차시에 이 코드로 오늘 응답을 불러옵니다.
        </p>

        <div className="text-2xl font-mono font-bold tracking-wider text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-lg py-4 px-2 break-all">
          {code}
        </div>

        <button
          onClick={handleDownloadText}
          className="w-full py-2 bg-gray-100 text-gray-700 rounded font-bold text-sm hover:bg-gray-200 border"
        >
          서술형 응답 전체 기록 .txt 다운로드
        </button>

        <div className="text-left border-t pt-4">
          <h4 className="text-sm font-bold text-gray-700 mb-2">코드를 옮겨 적었는지 확인해 보기</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={checkInput}
              onChange={(e) => {
                setCheckInput(e.target.value);
                setCheckResult('idle');
              }}
              placeholder="적은 코드를 여기에 다시 입력"
              className="flex-1 p-2 border rounded border-gray-300 text-sm font-mono outline-none focus:border-blue-500"
            />
            <button
              onClick={handleVerify}
              className="px-3 py-2 bg-gray-700 text-white rounded text-sm font-bold hover:bg-gray-800"
            >
              확인
            </button>
          </div>
          {checkResult === 'ok' && (
            <p className="text-sm text-green-600 font-bold mt-2">✅ 코드가 정확합니다.</p>
          )}
          {checkResult === 'fail' && (
            <p className="text-sm text-red-600 font-bold mt-2">코드를 다시 확인해 주세요.</p>
          )}
        </div>

        <button
          onClick={() => navigate('/lab/exit')}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          출구 문항으로 돌아가기
        </button>
      </div>
    </div>
  );
}
