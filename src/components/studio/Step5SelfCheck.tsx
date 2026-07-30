import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { evaluateStudioDesign, STUDIO_MATERIALS } from '../../engine';
import { findStudioSituation } from '../../lib/studioSituations';
import StudioLayout from './StudioLayout';

export default function Step5SelfCheck() {
  const navigate = useNavigate();
  const studio = useStore((state) => state.studio);
  const updateStudio = useStore((state) => state.updateStudio);

  const mass = studio.mass ?? 0.2;
  const velocity = studio.velocity ?? 4.43;
  const bareContactMm = findStudioSituation(studio.situationId)?.bareContactMm ?? 0.5;

  const calc = useMemo(() => {
    if (studio.checkCalcThicknessMm === null) return null;
    return evaluateStudioDesign({
      m: mass,
      v: velocity,
      thicknessMm: studio.checkCalcThicknessMm,
      materialId: studio.checkCalcMaterialId,
      areaCm2: 30,
      bareContactMm,
    });
  }, [mass, velocity, studio.checkCalcThicknessMm, studio.checkCalcMaterialId, bareContactMm]);

  const isComplete = studio.aiAnswer.trim().length > 0 && studio.checkDiscardedReason.trim().length > 0;

  return (
    <StudioLayout
      step={5}
      title="5. AI 답변 자기 검증"
      onPrev={() => navigate('/studio/4')}
      onNext={() => navigate('/studio/6')}
      nextDisabled={!isComplete}
    >
      <div className="space-y-5">
        <section className="bg-white rounded-lg shadow border p-5">
          <h3 className="font-bold text-gray-800 mb-2">AI 답변 붙여넣기</h3>
          <textarea
            value={studio.aiAnswer}
            onChange={(e) => updateStudio({ aiAnswer: e.target.value })}
            rows={8}
            placeholder="AI 서비스에서 받은 답변을 여기에 붙여넣으세요."
            className="w-full p-3 border rounded outline-none focus:border-indigo-500 resize-none text-sm"
          />
        </section>

        <section className="bg-white rounded-lg shadow border p-5 space-y-3">
          <h3 className="font-bold text-gray-800">체크리스트</h3>
          <p className="text-xs text-gray-500 -mt-2">
            시뮬레이터는 채점하지 않습니다. 직접 체크하고 근거를 적어 보세요.
          </p>

          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={studio.checkImpulseTime}
              onChange={(e) => updateStudio({ checkImpulseTime: e.target.checked })}
              className="mt-1"
            />
            AI가 '충격을 흡수한다'고만 썼는가, 충돌 시간을 언급했는가?
          </label>

          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={studio.checkDistinguished}
              onChange={(e) => updateStudio({ checkDistinguished: e.target.checked })}
              className="mt-1"
            />
            AI가 충격량과 충격력을 구분했는가?
          </label>

          <div className="border-t pt-3">
            <p className="text-sm text-gray-700 mb-2">AI가 제시한 두께·재질로 계산하면 평균힘은 얼마인가?</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-gray-600">
                제시된 두께 (mm)
                <input
                  type="number"
                  value={studio.checkCalcThicknessMm ?? ''}
                  onChange={(e) => updateStudio({ checkCalcThicknessMm: e.target.value === '' ? null : Number(e.target.value) })}
                  className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
                />
              </label>
              <label className="text-xs text-gray-600">
                가장 가까운 재질
                <select
                  value={studio.checkCalcMaterialId}
                  onChange={(e) => updateStudio({ checkCalcMaterialId: e.target.value })}
                  className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
                >
                  {STUDIO_MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </label>
            </div>
            {calc && (
              <p className="text-sm text-indigo-700 mt-2">
                → 엔진 계산 결과: 평균힘 약 <b>{calc.F_avg.toFixed(0)} N</b>, 최대힘 약 <b>{calc.F_peak.toFixed(0)} N</b>, 무게 약 <b>{calc.weightG.toFixed(0)} g</b>
              </p>
            )}
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-700 border-t pt-3">
            <input
              type="checkbox"
              checked={studio.checkWithinConstraints}
              onChange={(e) => updateStudio({ checkWithinConstraints: e.target.checked })}
              className="mt-1"
            />
            무게·부피·비용 제약을 위반하지 않는가?
          </label>

          <label className="block text-sm text-gray-700 border-t pt-3">
            AI 답변 중 내가 버린 것과 그 이유는? (서술 필수)
            <textarea
              value={studio.checkDiscardedReason}
              onChange={(e) => updateStudio({ checkDiscardedReason: e.target.value })}
              rows={3}
              className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500 resize-none"
            />
          </label>
        </section>
      </div>
    </StudioLayout>
  );
}
