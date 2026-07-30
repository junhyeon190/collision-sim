import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import StudioLayout from './StudioLayout';

export default function Step3Problem() {
  const navigate = useNavigate();
  const studio = useStore((state) => state.studio);
  const updateStudio = useStore((state) => state.updateStudio);

  const isComplete =
    studio.collidingObject.trim().length > 0 &&
    studio.protectedTarget.trim().length > 0 &&
    studio.currentProblem.trim().length > 0 &&
    studio.targetForce !== null &&
    studio.material.trim().length > 0 &&
    studio.thicknessLimitMm !== null &&
    studio.weightLimitG !== null;

  return (
    <StudioLayout
      step={3}
      title="3. 문제 정의"
      onPrev={() => navigate('/studio/2')}
      onNext={() => navigate('/studio/4')}
      nextDisabled={!isComplete}
    >
      <div className="bg-white rounded-lg shadow border p-5 space-y-4">
        <p className="text-sm text-gray-500">
          다음 단계에서 이 내용을 그대로 AI 프롬프트로 조립합니다. 구체적으로 적을수록 좋은 답을 받습니다.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm text-gray-700">
            충돌하는 물체
            <input
              type="text"
              value={studio.collidingObject}
              onChange={(e) => updateStudio({ collidingObject: e.target.value })}
              className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
            />
          </label>
          <label className="text-sm text-gray-700">
            보호 대상
            <input
              type="text"
              value={studio.protectedTarget}
              onChange={(e) => updateStudio({ protectedTarget: e.target.value })}
              className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
            />
          </label>
        </div>

        <label className="block text-sm text-gray-700">
          현재 문제 (왜 이 보호장치가 필요한가?)
          <textarea
            value={studio.currentProblem}
            onChange={(e) => updateStudio({ currentProblem: e.target.value })}
            rows={3}
            placeholder="예) 지금은 완충재가 없어서 충돌 시 평균힘이 너무 커서 물체가 파손된다."
            className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500 resize-none"
          />
        </label>

        <div className="grid grid-cols-3 gap-4">
          <label className="text-sm text-gray-700">
            목표 평균힘 (N 이하)
            <input
              type="number"
              value={studio.targetForce ?? ''}
              onChange={(e) => updateStudio({ targetForce: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
            />
          </label>
          <label className="text-sm text-gray-700">
            두께 제한 (mm 이하)
            <input
              type="number"
              value={studio.thicknessLimitMm ?? ''}
              onChange={(e) => updateStudio({ thicknessLimitMm: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
            />
          </label>
          <label className="text-sm text-gray-700">
            무게 제한 (g 이하)
            <input
              type="number"
              value={studio.weightLimitG ?? ''}
              onChange={(e) => updateStudio({ weightLimitG: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
            />
          </label>
        </div>

        <label className="block text-sm text-gray-700">
          재료 후보 (쉼표로 구분)
          <input
            type="text"
            value={studio.material}
            onChange={(e) => updateStudio({ material: e.target.value })}
            placeholder="예) 실리콘/에어캡/발포폼"
            className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
          />
        </label>
      </div>
    </StudioLayout>
  );
}
