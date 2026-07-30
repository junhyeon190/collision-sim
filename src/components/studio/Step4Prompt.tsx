import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { buildStudioBaseline, buildStudioPrompt } from '../../lib/studioPrompt';
import { findStudioSituation } from '../../lib/studioSituations';
import StudioLayout from './StudioLayout';

export default function Step4Prompt() {
  const navigate = useNavigate();
  const studio = useStore((state) => state.studio);
  const updateStudio = useStore((state) => state.updateStudio);
  const [copied, setCopied] = useState(false);

  const mass = studio.mass ?? 0.2;
  const velocity = studio.velocity ?? 4.43;
  const bareContactMm = findStudioSituation(studio.situationId)?.bareContactMm ?? 0.5;

  const baseline = useMemo(() => buildStudioBaseline(mass, velocity, bareContactMm), [mass, velocity, bareContactMm]);

  const prompt = useMemo(
    () => buildStudioPrompt(studio, mass, velocity, baseline),
    [studio, mass, velocity, baseline]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      updateStudio({ promptCopied: true });
    } catch {
      setCopied(false);
    }
  };

  return (
    <StudioLayout
      step={4}
      title="4. 프롬프트 조립기"
      onPrev={() => navigate('/studio/3')}
      onNext={() => navigate('/studio/5')}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          아래 문장을 복사해서 학교에서 쓰는 AI 서비스에 직접 붙여넣으세요. <b>이 화면은 AI를 호출하지 않습니다.</b>
        </p>

        <div className="bg-gray-900 text-teal-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
          {prompt}
        </div>

        <button
          onClick={handleCopy}
          className="px-5 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700"
        >
          프롬프트 복사
        </button>
        {copied && <span className="ml-3 text-sm text-green-600">복사되었습니다. AI 서비스에 붙여넣어 보세요.</span>}
      </div>
    </StudioLayout>
  );
}
