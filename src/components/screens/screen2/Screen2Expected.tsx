import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import RadioGroup from '../../common/RadioGroup';
import ConfirmModal from '../../common/ConfirmModal';

export default function Screen2Expected() {
  const screen2 = useStore((state) => state.screen2);
  const updateScreen2 = useStore((state) => state.updateScreen2);
  const isLocked = screen2.isLocked;
  
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePredictionChange = (field: keyof typeof screen2.predictions, val: string) => {
    if (isLocked) return;
    updateScreen2({
      predictions: {
        ...screen2.predictions,
        [field]: val
      }
    });
  };

  const isComplete = 
    screen2.predictions.momentum && 
    screen2.predictions.impulse && 
    screen2.predictions.time && 
    screen2.predictions.avgForce && 
    screen2.reasonChoice !== null;

  const handleSave = () => {
    if (isComplete && !isLocked) {
      setShowConfirm(true);
    }
  };

  const questions = [
    { key: 'momentum', label: '운동량 변화량' },
    { key: 'impulse', label: '충격량' },
    { key: 'time', label: '충돌 시간' },
    { key: 'avgForce', label: '평균힘' }
  ] as const;

  const choices = ['맨바닥이 큼', '완충재가 큼', '같음', '모르겠음'];

  const reasons = [
    { id: 1, text: "완충재가 충격을 흡수하므로 충격량이 작다" },
    { id: 2, text: "같은 물체가 같은 속도로 충돌해 정지하므로 운동량 변화량은 같다" },
    { id: 3, text: "완충재는 물체의 질량을 줄인다" },
    { id: 4, text: "부드러운 바닥에서는 중력이 작게 작용한다" },
    { id: 5, text: "아직 모르겠다" }
  ];

  return (
    <div className="flex flex-col space-y-4 text-sm h-full overflow-y-auto pr-2 relative">
      <ConfirmModal 
        isOpen={showConfirm}
        title="저장 확인"
        message={<>저장하면 예측을 수정할 수 없습니다.<br/>저장하고 시뮬레이션을 관찰할까요?</>}
        onConfirm={() => {
          updateScreen2({ isLocked: true });
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
        confirmText="저장하고 관찰하기"
      />

      <h4 className="font-bold text-blue-700">예측 1. 두 충돌에서 다음 물리량은 어느 쪽이 더 클까?</h4>
      
      <table className="w-full text-center border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-gray-700 w-1/4">물리량</th>
            {choices.map(c => (
              <th key={c} className="border border-gray-300 p-2 font-normal text-xs text-gray-600">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.key} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2 font-bold text-gray-700">{q.label}</td>
              {choices.map(c => (
                <td key={c} className="border border-gray-300 p-0 text-center align-middle">
                  <div 
                    className={`flex items-center justify-center w-full h-full p-3 transition-colors ${screen2.predictions[q.key] === c ? 'bg-blue-100' : ''} ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-100'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isLocked) {
                        handlePredictionChange(q.key, c);
                      }
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      screen2.predictions[q.key] === c ? 'border-blue-500 bg-white' : 'border-gray-300 bg-white'
                    }`}>
                      {screen2.predictions[q.key] === c && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="font-bold text-blue-700 mt-4">예측 2. 운동량 변화량이나 충격량에 대해 그렇게 예측한 이유는?</h4>
      <RadioGroup 
        name="screen2Reason"
        options={reasons}
        selectedValue={screen2.reasonChoice}
        onChange={(id) => updateScreen2({ reasonChoice: id as number })}
        disabled={isLocked}
      />

      <div className="mt-auto pt-4">
        <button 
          onClick={handleSave}
          disabled={isLocked || !isComplete}
          className={`w-full py-3 rounded font-bold text-white transition-colors
            ${isLocked 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isComplete 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-md' 
                : 'bg-blue-300 cursor-not-allowed'}`}
        >
          {isLocked ? '저장 완료' : '내 생각 저장하고 관찰하기'}
        </button>
      </div>
    </div>
  );
}
