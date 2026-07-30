import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import Layout from '../../Layout';
import Screen3Sorter from './Screen3Sorter';

export default function Screen3Main() {
  const navigate = useNavigate();
  const screen3 = useStore((state) => state.screen3);
  const updateScreen3 = useStore((state) => state.updateScreen3);

  // spec.md §5 화면3: 통제 변인 칸이 비어 있으면 다음 단계로 넘어갈 수 없다. (A수준 관문)
  const controlledCount = Object.values(screen3.placements).filter((v) => v === 'controlled').length;
  const canProceed = controlledCount > 0;

  return (
    <Layout
      step={3}
      question="완충재 개수가 충돌 결과에 미치는 영향을 어떻게 알아볼까?"
      expectedArea={
        <div className="flex flex-col h-full space-y-4">
          <div>
            <h4 className="font-bold text-blue-700 mb-2">탐구 문제</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              완충재 개수가 늘어나면 스마트폰 모형의 가속도 피크값은 어떻게 변하는가?
            </p>
            <p className="text-xs text-gray-400 mt-1">
              다음 시간에 여러분이 직접 스마트폰으로 측정할 실험입니다. 오늘은 그 설계를 합니다.
            </p>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <h4 className="font-bold text-blue-700 mb-2">이렇게 분류한 이유는?</h4>
            <textarea
              value={screen3.reason}
              onChange={(e) => updateScreen3({ reason: e.target.value })}
              className="w-full flex-1 min-h-[100px] p-2 border rounded border-gray-300 focus:border-blue-500 outline-none text-sm resize-none"
              placeholder="카드를 세 상자로 나눈 이유를 적어 주세요"
            />
          </div>
          {!canProceed && (
            <p className="text-xs text-orange-600 font-bold">
              통제 변인 칸이 비어 있으면 다음으로 넘어갈 수 없습니다.
            </p>
          )}
        </div>
      }
      simulationArea={<Screen3Sorter />}
      observedArea={null}
      bottomArea={
        <div className="text-sm text-gray-600">
          카드를 옮겨 다시 분류한 횟수: <span className="font-bold text-gray-800">{screen3.moveCount}회</span>
        </div>
      }
      onPrev={() => navigate('/lab/2')}
      onNext={() => navigate('/lab/5')}
      nextDisabled={!canProceed}
    />
  );
}
