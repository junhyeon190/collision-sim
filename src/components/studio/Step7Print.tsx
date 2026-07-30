import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { evaluateStudioDesign, STUDIO_MATERIALS } from '../../engine';
import { buildStudioBaseline, buildStudioPrompt } from '../../lib/studioPrompt';
import { findStudioSituation } from '../../lib/studioSituations';
import { judgeStudioDesign } from '../../lib/studioJudge';
import StudioLayout from './StudioLayout';

const STATUS_ICON: Record<string, string> = { pass: '✅', fail: '❌', warn: '⚠️' };

export default function Step7Print() {
  const navigate = useNavigate();
  const studio = useStore((state) => state.studio);

  const mass = studio.mass ?? 0.2;
  const velocity = studio.velocity ?? 4.43;
  const bareContactMm = findStudioSituation(studio.situationId)?.bareContactMm ?? 0.5;

  const baseline = useMemo(() => buildStudioBaseline(mass, velocity, bareContactMm), [mass, velocity, bareContactMm]);
  const prompt = useMemo(() => buildStudioPrompt(studio, mass, velocity, baseline), [studio, mass, velocity, baseline]);

  const finalResult = useMemo(
    () => evaluateStudioDesign({
      m: mass, v: velocity, thicknessMm: studio.designThicknessMm, materialId: studio.designMaterialId, areaCm2: studio.designAreaCm2, bareContactMm,
    }),
    [mass, velocity, studio.designThicknessMm, studio.designMaterialId, studio.designAreaCm2, bareContactMm]
  );

  const rows = useMemo(
    () => judgeStudioDesign(finalResult, studio.designThicknessMm, {
      targetForce: studio.targetForce ?? 100,
      thicknessLimitMm: studio.thicknessLimitMm ?? 15,
      weightLimitG: studio.weightLimitG ?? 50,
    }),
    [finalResult, studio.designThicknessMm, studio.targetForce, studio.thicknessLimitMm, studio.weightLimitG]
  );

  const materialLabel = STUDIO_MATERIALS.find((m) => m.id === studio.designMaterialId)?.label ?? studio.designMaterialId;
  const checkMaterialLabel = STUDIO_MATERIALS.find((m) => m.id === studio.checkCalcMaterialId)?.label ?? studio.checkCalcMaterialId;

  return (
    <StudioLayout step={7} title="7. 산출물 출력" onPrev={() => navigate('/studio/6')}>
      <div className="space-y-4 print:space-y-3 print:text-[11px]">
        <div className="flex justify-between items-center print:hidden">
          <p className="text-sm text-gray-500">한 장짜리 인쇄용 화면입니다. 아래 버튼으로 인쇄하세요.</p>
          <button onClick={() => window.print()} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700">
            인쇄하기
          </button>
        </div>

        <h1 className="text-xl font-bold text-gray-900 hidden print:block">충돌·안전장치 설계 산출물</h1>

        <section className="bg-white rounded-lg shadow border p-4 print:border-0 print:shadow-none print:p-0">
          <h3 className="font-bold text-gray-800 mb-2">문제 정의</h3>
          <p className="text-sm text-gray-700">
            충돌 물체: <b>{studio.collidingObject || '-'}</b> · 보호 대상: <b>{studio.protectedTarget || '-'}</b><br />
            현재 문제: {studio.currentProblem || '-'}<br />
            목표: 평균힘 {studio.targetForce ?? '-'} N 이하, 두께 {studio.thicknessLimitMm ?? '-'} mm 이하, 무게 {studio.weightLimitG ?? '-'} g 이하, 재료 후보 {studio.material || '-'}
          </p>
        </section>

        <section className="bg-white rounded-lg shadow border p-4 print:border-0 print:shadow-none print:p-0">
          <h3 className="font-bold text-gray-800 mb-2">사용한 프롬프트</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{prompt}</p>
        </section>

        <section className="bg-white rounded-lg shadow border p-4 print:border-0 print:shadow-none print:p-0">
          <h3 className="font-bold text-gray-800 mb-2">AI 답변</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{studio.aiAnswer || '(입력 없음)'}</p>
        </section>

        <section className="bg-white rounded-lg shadow border p-4 print:border-0 print:shadow-none print:p-0">
          <h3 className="font-bold text-gray-800 mb-2">자기 검증 결과</h3>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>충돌 시간 언급 여부: {studio.checkImpulseTime ? '언급함' : '언급 안 함(단순 흡수만 언급)'}</li>
            <li>충격량·충격력 구분 여부: {studio.checkDistinguished ? '구분함' : '구분 안 함'}</li>
            <li>
              AI 제시 두께 {studio.checkCalcThicknessMm ?? '-'} mm · 재질 {checkMaterialLabel} → 계산된 평균힘 약{' '}
              {studio.checkCalcThicknessMm !== null
                ? evaluateStudioDesign({ m: mass, v: velocity, thicknessMm: studio.checkCalcThicknessMm, materialId: studio.checkCalcMaterialId, areaCm2: 30, bareContactMm }).F_avg.toFixed(0)
                : '-'} N
            </li>
            <li>무게·부피·비용 제약 준수 여부: {studio.checkWithinConstraints ? '준수함' : '위반 소지 있음'}</li>
            <li>버린 AI 답변과 이유: {studio.checkDiscardedReason || '(입력 없음)'}</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow border p-4 print:border-0 print:shadow-none print:p-0">
          <h3 className="font-bold text-gray-800 mb-2">최종 설계값</h3>
          <p className="text-sm text-gray-700">
            두께 {studio.designThicknessMm} mm · 재질 {materialLabel} · 접촉 면적 {studio.designAreaCm2} cm²<br />
            충돌 시간 약 {finalResult.dt.toFixed(3)}초 · 평균힘 약 {finalResult.F_avg.toFixed(0)} N · 최대힘 약 {finalResult.F_peak.toFixed(0)} N · 충격량 약 {finalResult.J.toFixed(2)} N·s
          </p>
        </section>

        <section className="bg-white rounded-lg shadow border p-4 print:border-0 print:shadow-none print:p-0">
          <h3 className="font-bold text-gray-800 mb-2">판정 결과</h3>
          <div className="space-y-1">
            {rows.map((row) => (
              <p key={row.key} className="text-sm text-gray-700">
                {STATUS_ICON[row.status]} {row.label} — {row.valueText} ({row.limitText})
                {row.hint && <span className="text-gray-500"> → {row.hint}</span>}
              </p>
            ))}
          </div>
        </section>
      </div>
    </StudioLayout>
  );
}
