import { useStore } from '../../../store/useStore';

export default function Screen2Bottom() {
  const { screen2, updateScreen2, feedbackUnlocked } = useStore();
  const { progress, hasComparedArea } = screen2;
  const bottomAnswers = screen2.bottomAnswers || { b1: '', b2: '', b3: '' };

  const choices = ['증가', '감소', '거의 같다'];
  
  const isEnabled = progress >= 2.0 && hasComparedArea;
  const setAnswer = (key: 'b1'|'b2'|'b3', val: string) => {
    if (!isEnabled) return;
    updateScreen2({ bottomAnswers: { ...bottomAnswers, [key]: val } });
  };

  return (
    <div className="flex flex-col space-y-4 text-gray-700 bg-white h-full p-2 relative">
      <h4 className="font-bold text-blue-700 mb-2">빈칸 채우기</h4>
      
      {!isEnabled && (
        <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center rounded backdrop-blur-[1px]">
          <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
            시뮬레이션을 재생하고 '면적 비교해 보기'를 관찰한 뒤 열립니다.
          </span>
        </div>
      )}

      <p className="text-lg leading-relaxed bg-gray-50 p-4 rounded border border-gray-200">
        완충재는 충돌 시간을 
        <select 
          className="mx-2 p-1 border rounded bg-white font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          value={bottomAnswers.b1}
          onChange={(e) => setAnswer('b1', e.target.value)}
          disabled={!isEnabled}
        >
          <option value="" disabled>선택</option>
          {choices.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        하여 평균힘을 
        <select 
          className="mx-2 p-1 border rounded bg-white font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          value={bottomAnswers.b2}
          onChange={(e) => setAnswer('b2', e.target.value)}
          disabled={!isEnabled}
        >
          <option value="" disabled>선택</option>
          {choices.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        하지만, 같은 운동량 변화가 일어나므로 충격량은 
        <select 
          className="mx-2 p-1 border rounded bg-white font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          value={bottomAnswers.b3}
          onChange={(e) => setAnswer('b3', e.target.value)}
          disabled={!isEnabled}
        >
          <option value="" disabled>선택</option>
          {choices.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        .
      </p>

      {feedbackUnlocked && bottomAnswers.b1 && bottomAnswers.b2 && bottomAnswers.b3 && (
        <div className={`p-4 rounded-lg font-bold ${bottomAnswers.b1 === '증가' && bottomAnswers.b2 === '감소' && bottomAnswers.b3 === '거의 같다' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {bottomAnswers.b1 === '증가' && bottomAnswers.b2 === '감소' && bottomAnswers.b3 === '거의 같다' 
            ? '✅ 정답입니다! 두 곡선의 면적이 같다는 것은 충격량이 같다는 뜻입니다.' 
            : '❌ 다시 한 번 생각해 볼까요? 완충재가 푹신하게 눌리는 동안 걸린 시간과 충격량(면적)을 확인해 보세요.'}
        </div>
      )}
    </div>
  );
}
