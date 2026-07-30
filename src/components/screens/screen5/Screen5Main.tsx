import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import Layout from '../../Layout';
import RadioGroup from '../../common/RadioGroup';

// Screen0Expected.tsx에서 쓴 선택지와 반드시 같아야 한다(같은 문항을 다시 물어 비교하는 화면이므로).
const SCREEN0_CHOICES = [
  { id: 1, text: '떨어지는 속도를 늦춰준다' },
  { id: 2, text: '충돌하는 시간을 길게 늘려준다' },
  { id: 3, text: '물체가 받는 중력을 줄여준다' },
  { id: 4, text: '충돌할 때 튕겨나가게 한다' },
  { id: 5, text: '충격량 자체를 없애준다' },
];

const CONFIDENCE_OPTIONS = [
  { id: 1, text: '전혀 모르겠다' },
  { id: 2, text: '확실하지 않다' },
  { id: 3, text: '보통이다' },
  { id: 4, text: '조금 확신한다' },
  { id: 5, text: '매우 확신한다' },
];

function choiceText(id: number | null) {
  if (id === null) return '(응답 없음)';
  return SCREEN0_CHOICES.find((c) => c.id === id)?.text ?? '(응답 없음)';
}

export default function Screen5Main() {
  const navigate = useNavigate();
  const screen0 = useStore((state) => state.screen0);
  const screen5 = useStore((state) => state.screen5);
  const updateScreen5 = useStore((state) => state.updateScreen5);

  const isComplete =
    screen5.modifiedChoice !== null &&
    screen5.finalConfidence !== null &&
    screen5.reflectionReason.trim() !== '';

  return (
    <Layout
      step={5}
      question="처음 생각과 지금의 설명은 어떻게 달라졌을까?"
      expectedArea={
        <div className="flex flex-col h-full space-y-4 overflow-y-auto">
          <div>
            <h4 className="font-bold text-gray-700 mb-2">처음(화면0)에 내가 골랐던 답</h4>
            <div className="p-3 bg-gray-50 border rounded text-sm text-gray-700">
              <p className="mb-1">
                <span className="font-bold">방석이 주로 줄이는 것:</span> {choiceText(screen0.choice)}
              </p>
              <p>
                <span className="font-bold">그때의 확신도:</span>{' '}
                {screen0.confidence ? `${screen0.confidence} / 5` : '(응답 없음)'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-blue-700 mb-2">지금 다시 고른다면?</h4>
            <RadioGroup
              name="screen5ModifiedChoice"
              options={SCREEN0_CHOICES}
              selectedValue={screen5.modifiedChoice}
              onChange={(id) => updateScreen5({ modifiedChoice: id as number })}
              disabled={false}
            />
          </div>

          <div>
            <h4 className="font-bold text-blue-700 mb-2">지금 이 답에 얼마나 확신하나요?</h4>
            <RadioGroup
              name="screen5FinalConfidence"
              options={CONFIDENCE_OPTIONS}
              selectedValue={screen5.finalConfidence}
              onChange={(id) => updateScreen5({ finalConfidence: id as number })}
              disabled={false}
            />
          </div>
        </div>
      }
      simulationArea={
        <div className="flex flex-col h-full">
          <h4 className="font-bold text-blue-700 mb-2">생각이 바뀐 과정을 한 문장으로 적어 보세요</h4>
          <p className="text-xs text-gray-400 mb-2">
            예시 형식: 처음에는 ____라고 생각했지만, 관찰 결과를 보고 ____라고 생각을 수정했다.
          </p>
          <textarea
            value={screen5.reflectionReason}
            onChange={(e) => updateScreen5({ reflectionReason: e.target.value })}
            className="w-full flex-1 min-h-[160px] p-3 border rounded border-gray-300 focus:border-blue-500 outline-none text-sm resize-none"
            placeholder="처음에는 ○○라고 생각했지만, 관찰 결과를 보고 ○○라고 생각을 수정했다."
          />
          {!isComplete && (
            <p className="text-xs text-orange-600 font-bold mt-2">
              세 가지(다시 고른 답 / 확신도 / 한 문장 서술)를 모두 채워야 다음으로 넘어갈 수 있습니다.
            </p>
          )}
        </div>
      }
      observedArea={
        <div className="flex flex-col h-full space-y-3 text-sm">
          <h4 className="font-bold text-gray-700 mb-1">관찰 결과 요약</h4>
          <ul className="space-y-2">
            <li className="p-2 bg-blue-50 border border-blue-100 rounded">
              운동량 변화량: <span className="font-bold">같음</span>
            </li>
            <li className="p-2 bg-blue-50 border border-blue-100 rounded">
              충격량: <span className="font-bold">같음</span>
            </li>
            <li className="p-2 bg-orange-50 border border-orange-100 rounded">
              충돌 시간: <span className="font-bold">완충재 쪽이 더 길다</span>
            </li>
            <li className="p-2 bg-orange-50 border border-orange-100 rounded">
              평균힘: <span className="font-bold">완충재 쪽이 더 작다</span>
            </li>
          </ul>
        </div>
      }
      bottomArea={null}
      onPrev={() => navigate('/lab/3')}
      onNext={() => navigate('/lab/exit')}
      nextDisabled={!isComplete}
    />
  );
}
