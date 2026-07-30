import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'recharts';
import { useStore } from '../../store/useStore';
import { evaluateStudioDesign, STUDIO_MATERIALS } from '../../engine';
import { judgeStudioDesign, isDesignPassing } from '../../lib/studioJudge';
import { findStudioSituation } from '../../lib/studioSituations';
import TimeSeriesChart from '../common/TimeSeriesChart';
import StudioLayout from './StudioLayout';

const STATUS_ICON: Record<string, string> = { pass: '✅', fail: '❌', warn: '⚠️' };

export default function Step6Canvas() {
  const navigate = useNavigate();
  const studio = useStore((state) => state.studio);
  const updateStudio = useStore((state) => state.updateStudio);

  const mass = studio.mass ?? 0.2;
  const velocity = studio.velocity ?? 4.43;
  const bareContactMm = findStudioSituation(studio.situationId)?.bareContactMm ?? 0.5;

  const result = useMemo(
    () => evaluateStudioDesign({
      m: mass,
      v: velocity,
      thicknessMm: studio.designThicknessMm,
      materialId: studio.designMaterialId,
      areaCm2: studio.designAreaCm2,
      bareContactMm,
    }),
    [mass, velocity, studio.designThicknessMm, studio.designMaterialId, studio.designAreaCm2, bareContactMm]
  );

  const rows = useMemo(
    () => judgeStudioDesign(result, studio.designThicknessMm, {
      targetForce: studio.targetForce ?? 100,
      thicknessLimitMm: studio.thicknessLimitMm ?? 15,
      weightLimitG: studio.weightLimitG ?? 50,
    }),
    [result, studio.designThicknessMm, studio.targetForce, studio.thicknessLimitMm, studio.weightLimitG]
  );

  const passing = isDesignPassing(rows);

  return (
    <StudioLayout
      step={6}
      title="6. 설계 캔버스와 판정"
      onPrev={() => navigate('/studio/5')}
      onNext={() => navigate('/studio/7')}
    >
      <div className="space-y-5">
        <section className="bg-white rounded-lg shadow border p-5 space-y-4">
          <h3 className="font-bold text-gray-800">설계값 조절</h3>
          <label className="block text-sm text-gray-700">
            완충 두께: <b>{studio.designThicknessMm} mm</b>
            <input
              type="range"
              min={1}
              max={60}
              value={studio.designThicknessMm}
              onChange={(e) => updateStudio({ designThicknessMm: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <label className="block text-sm text-gray-700">
            재질
            <select
              value={studio.designMaterialId}
              onChange={(e) => updateStudio({ designMaterialId: e.target.value })}
              className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
            >
              {STUDIO_MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-gray-700">
            접촉 면적: <b>{studio.designAreaCm2} cm²</b>
            <input
              type="range"
              min={5}
              max={200}
              value={studio.designAreaCm2}
              onChange={(e) => updateStudio({ designAreaCm2: Number(e.target.value) })}
              className="w-full"
            />
          </label>
        </section>

        <section className="bg-white rounded-lg shadow border p-4">
          <h3 className="font-bold text-gray-800 mb-2 text-sm">힘-시간 그래프</h3>
          <div className="relative h-56">
            <TimeSeriesChart data={result.history} timeKey="t" xLabel="시간 t (s)" yLabel="힘 F (N)">
              <Line type="monotone" dataKey="F" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
            </TimeSeriesChart>
          </div>
        </section>

        <section className={`rounded-lg border p-5 ${passing ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <h3 className="font-bold text-gray-800 mb-3">판정 결과</h3>
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.key}>
                <div className="flex items-center gap-2 text-sm">
                  <span>{STATUS_ICON[row.status]}</span>
                  <span className="font-bold text-gray-800">{row.label}</span>
                  <span className="text-gray-600">{row.valueText}</span>
                  <span className="text-gray-400">({row.limitText})</span>
                </div>
                {row.hint && <p className="text-xs text-gray-500 ml-6 mt-0.5">→ {row.hint}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </StudioLayout>
  );
}
