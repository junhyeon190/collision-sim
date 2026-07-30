import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import RadioGroup from '../../common/RadioGroup';
import ConfirmModal from '../../common/ConfirmModal';

export default function Screen0Expected() {
  const screen0 = useStore((state) => state.screen0);
  const updateScreen0 = useStore((state) => state.updateScreen0);
  const isLocked = screen0.isLocked;
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);

  const isComplete = screen0.reason.trim() !== '' && screen0.choice !== null && screen0.confidence !== null;

  const handleSave = () => {
    if (isComplete && !isLocked) {
      setShowConfirm(true);
    }
  };

  const confirmSave = () => {
    updateScreen0({ isLocked: true });
    setShowConfirm(false);
    navigate('/lab/1');
  };

  const choices = [
    { id: 1, text: "떨어지는 속도를 늦춰준다" },
    { id: 2, text: "충돌하는 시간을 길게 늘려준다" },
    { id: 3, text: "물체가 받는 중력을 줄여준다" },
    { id: 4, text: "충돌할 때 튕겨나가게 한다" },
    { id: 5, text: "충격량 자체를 없애준다" }
  ];

  const confidences = [
    { id: 1, text: "전혀 모르겠다" },
    { id: 2, text: "확실하지 않다" },
    { id: 3, text: "보통이다" },
    { id: 4, text: "조금 확신한다" },
    { id: 5, text: "매우 확신한다" }
  ];

  return (
    <div className="flex flex-col h-full relative">
      <ConfirmModal 
        isOpen={showConfirm}
        title="저장 확인"
        message={<>저장하면 예측을 수정할 수 없습니다.<br/>저장하고 화면 1로 이동할까요?</>}
        onConfirm={confirmSave}
        onCancel={() => setShowConfirm(false)}
        confirmText="저장하고 이동하기"
      />

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
        <div>
          <h4 className="font-bold text-blue-700 mb-2">충격을 줄인다는 것은 무엇을 줄이는 것일까?</h4>
          <input 
            type="text" 
            disabled={isLocked}
            value={screen0.reason}
            onChange={(e) => updateScreen0({ reason: e.target.value })}
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="예: 힘을 줄인다, 충격량을 줄인다..."
          />
        </div>

        <div>
          <h4 className="font-bold text-blue-700 mb-2">완충재(방석, 스펀지 등)는 어떤 원리로 충격을 줄일까?</h4>
          <RadioGroup 
            name="screen0Choice"
            options={choices}
            selectedValue={screen0.choice}
            onChange={(id) => updateScreen0({ choice: id as number })}
            disabled={isLocked}
          />
        </div>

        <div>
          <h4 className="font-bold text-blue-700 mb-2">자신의 예상에 얼마나 확신하나요?</h4>
          <RadioGroup 
            name="screen0Confidence"
            options={confidences}
            selectedValue={screen0.confidence}
            onChange={(id) => updateScreen0({ confidence: id as number })}
            disabled={isLocked}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex-none">
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
          {isLocked ? '저장 완료' : '내 생각 저장하고 다음으로 이동하기'}
        </button>
      </div>
    </div>
  );
}
