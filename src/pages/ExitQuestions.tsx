import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import RadioGroup from '../components/common/RadioGroup';

// spec.md §5 출구 문항 (형성평가 기록용, 4문항). 정답은 학생 화면에 절대 노출하지 않는다.
const Q1_OPTIONS = [
  { id: 1, text: '오른쪽' },
  { id: 2, text: '왼쪽' },
  { id: 3, text: '0' },
  { id: 4, text: '속도에 비례' },
];

const Q2_OPTIONS = [
  { id: 1, text: '완충재에서 운동량 변화량과 충격량이 모두 작다' },
  { id: 2, text: '충격량은 비슷하지만 완충재에서 충돌 시간이 길어 평균힘이 작다' },
  { id: 3, text: '완충재에서는 중력이 작게 작용한다' },
  { id: 4, text: '맨바닥에서만 충격량이 발생한다' },
];

export default function ExitQuestions() {
  const navigate = useNavigate();
  const studentId = useStore((state) => state.studentId);
  const exitQuestions = useStore((state) => state.exitQuestions);
  const updateExitQuestions = useStore((state) => state.updateExitQuestions);

  const isComplete =
    exitQuestions.q1 !== null &&
    exitQuestions.q2 !== null &&
    exitQuestions.q3.trim() !== '' &&
    exitQuestions.q4.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow border p-6 space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-xl font-bold text-gray-800">출구 문항</h1>
          <span className="text-sm text-gray-500 font-medium">학번: {studentId || '입력 안 됨'}</span>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 mb-3">
            1. 마찰을 무시할 수 있는 수평면에서 물체가 오른쪽으로 일정한 속도로 움직인다. 수평 방향
            알짜힘은?
          </h4>
          <RadioGroup
            name="exitQ1"
            options={Q1_OPTIONS}
            selectedValue={exitQuestions.q1}
            onChange={(id) => updateExitQuestions({ q1: id as number })}
            disabled={false}
          />
        </div>

        <div>
          <h4 className="font-bold text-gray-700 mb-3">
            2. 같은 물체를 같은 속도로 맨바닥과 완충재에 충돌시켜 모두 정지시켰다. 가장 적절한 설명은?
          </h4>
          <RadioGroup
            name="exitQ2"
            options={Q2_OPTIONS}
            selectedValue={exitQuestions.q2}
            onChange={(id) => updateExitQuestions({ q2: id as number })}
            disabled={false}
          />
        </div>

        <div>
          <h4 className="font-bold text-gray-700 mb-2">
            3. 완충재 개수가 가속도 피크에 미치는 영향을 알아볼 때 통제해야 할 변인 두 가지를 쓰시오.
          </h4>
          <textarea
            value={exitQuestions.q3}
            onChange={(e) => updateExitQuestions({ q3: e.target.value })}
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 outline-none text-sm resize-none"
            rows={2}
            placeholder="예: 물체 질량, 낙하 높이 등"
          />
        </div>

        <div>
          <h4 className="font-bold text-gray-700 mb-2">
            4. 완충재가 충격을 줄이는 원리를 '충돌 시간'과 '평균힘'을 사용하여 설명하시오.
          </h4>
          <textarea
            value={exitQuestions.q4}
            onChange={(e) => updateExitQuestions({ q4: e.target.value })}
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 outline-none text-sm resize-none"
            rows={3}
            placeholder="충돌 시간과 평균힘의 관계를 이용해 설명해 주세요"
          />
        </div>

        {!isComplete && (
          <p className="text-xs text-orange-600 font-bold">모든 문항에 답해야 결과 코드를 받을 수 있습니다.</p>
        )}

        <div className="flex justify-between pt-2 border-t">
          <button
            onClick={() => navigate('/lab/5')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-bold text-sm hover:bg-gray-300"
          >
            이전
          </button>
          <button
            onClick={() => navigate('/lab/result')}
            disabled={!isComplete}
            className={`px-6 py-2 rounded font-bold text-sm transition-colors ${
              isComplete
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            결과 코드 받기
          </button>
        </div>
      </div>
    </div>
  );
}
