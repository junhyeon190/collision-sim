import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import RadioGroup from '../../common/RadioGroup';
import ConfirmModal from '../../common/ConfirmModal';

export default function Screen1Expected() {
  const screen1 = useStore((state) => state.screen1);
  const updateScreen1 = useStore((state) => state.updateScreen1);
  const isLocked = screen1.isLocked;
  
  const [showConfirm, setShowConfirm] = useState(false);

  const isComplete = screen1.forcePrediction !== null && 
                     screen1.motionPrediction !== null && 
                     (screen1.reasonChoice !== null && (screen1.reasonChoice !== 5 || screen1.reasonCustom.trim() !== ''));

  const handleSave = () => {
    if (isComplete && !isLocked) {
      setShowConfirm(true);
    }
  };

  const confirmSave = () => {
    updateScreen1({ isLocked: true });
    setShowConfirm(false);
  };

  const forces = [
    { id: 1, text: "오른쪽으로 미는 힘이 계속 작용한다" },
    { id: 2, text: "오른쪽 힘이 점차 줄어든다" },
    { id: 3, text: "왼쪽 마찰력만 작용한다" },
    { id: 4, text: "수평 방향 알짜힘은 0이다" }
  ];

  const motions = [
    { id: 1, text: "즉시 멈춘다" },
    { id: 2, text: "점점 느려져 멈춘다" },
    { id: 3, text: "거의 일정한 속도로 계속 움직인다" },
    { id: 4, text: "계속 빨라진다" }
  ];

  const reasons = [
    { id: 1, text: "물체가 움직이려면 운동 방향의 힘이 필요하다" },
    { id: 2, text: "처음 받은 힘이 수레 안에 남아 있다" },
    { id: 3, text: "힘이 없어지면 물체는 원래 정지 상태로 돌아간다" },
    { id: 4, text: "알짜힘이 0이면 속도가 변하지 않는다" },
    { id: 5, text: "기타 (직접 입력)" }
  ];

  return (
    <div className="flex flex-col space-y-6 relative h-full">
      <ConfirmModal 
        isOpen={showConfirm}
        title="저장 확인"
        message={<>저장하면 예측을 수정할 수 없습니다.<br/>저장하고 시뮬레이션을 관찰할까요?</>}
        onConfirm={confirmSave}
        onCancel={() => setShowConfirm(false)}
        confirmText="저장하고 관찰하기"
      />

      <div>
        <h4 className="font-bold text-blue-700 mb-2">예측 1. 손을 뗀 뒤 수레에 작용하는 수평 방향 힘은?</h4>
        <RadioGroup 
          name="forcePrediction"
          options={forces}
          selectedValue={screen1.forcePrediction}
          onChange={(id) => updateScreen1({ forcePrediction: id as number })}
          disabled={isLocked}
        />
      </div>

      <div>
        <h4 className="font-bold text-blue-700 mb-2">예측 2. 손을 뗀 뒤 수레의 운동은?</h4>
        <RadioGroup 
          name="motionPrediction"
          options={motions}
          selectedValue={screen1.motionPrediction}
          onChange={(id) => updateScreen1({ motionPrediction: id as number })}
          disabled={isLocked}
        />
      </div>

      <div>
        <h4 className="font-bold text-blue-700 mb-2">그렇게 생각한 이유는?</h4>
        <RadioGroup 
          name="reasonChoice"
          options={reasons}
          selectedValue={screen1.reasonChoice}
          onChange={(id) => updateScreen1({ reasonChoice: id as number })}
          disabled={isLocked}
        />
        {screen1.reasonChoice === 5 && (
          <input 
            type="text" 
            className="w-full mt-2 p-2 border rounded"
            placeholder="이유를 입력하세요"
            disabled={isLocked}
            value={screen1.reasonCustom}
            onChange={(e) => updateScreen1({ reasonCustom: e.target.value })}
          />
        )}
      </div>

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
