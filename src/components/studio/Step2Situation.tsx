import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { STUDIO_SITUATIONS, findStudioSituation } from '../../lib/studioSituations';
import StudioLayout from './StudioLayout';

export default function Step2Situation() {
  const navigate = useNavigate();
  const studio = useStore((state) => state.studio);
  const updateStudio = useStore((state) => state.updateStudio);

  const selected = findStudioSituation(studio.situationId);

  const handleSelect = (id: string) => {
    const s = findStudioSituation(id);
    if (!s) return;
    updateStudio({
      situationId: s.id,
      mass: s.defaultMass,
      velocity: s.defaultVelocity,
      collidingObject: s.collidingObject,
      protectedTarget: s.protectedTarget,
      targetForce: s.defaultTargetForce,
      thicknessLimitMm: s.defaultThicknessLimitMm,
      weightLimitG: s.defaultWeightLimitG,
    });
  };

  return (
    <StudioLayout
      step={2}
      title="2. 상황 선택"
      onPrev={() => navigate('/studio/1')}
      onNext={() => navigate('/studio/3')}
      nextDisabled={!studio.situationId}
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-500">
          안전장치를 설계할 상황을 하나 골라 보세요. 질량·속도는 근사치이며 아래에서 직접 수정할 수 있습니다.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STUDIO_SITUATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                studio.situationId === s.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="font-bold text-gray-800 text-sm">{s.label}</div>
              <div className="text-xs text-gray-500 mt-1">{s.protectedTarget} 보호</div>
            </button>
          ))}
        </div>

        {selected && (
          <section className="bg-white rounded-lg shadow border p-5 space-y-4">
            <h3 className="font-bold text-gray-800">선택한 상황: {selected.label}</h3>
            <p className="text-xs text-gray-500">{selected.note} (아래 값은 자유롭게 수정 가능)</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm text-gray-700">
                충돌 물체의 질량 (kg)
                <input
                  type="number"
                  step="0.01"
                  value={studio.mass ?? selected.defaultMass}
                  onChange={(e) => updateStudio({ mass: Number(e.target.value) })}
                  className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
                />
              </label>
              <label className="text-sm text-gray-700">
                충돌 속도 (m/s)
                <input
                  type="number"
                  step="0.1"
                  value={studio.velocity ?? selected.defaultVelocity}
                  onChange={(e) => updateStudio({ velocity: Number(e.target.value) })}
                  className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
                />
              </label>
            </div>
          </section>
        )}
      </div>
    </StudioLayout>
  );
}
