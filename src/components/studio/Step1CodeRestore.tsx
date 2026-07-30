import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { decodeResultCode } from '../../lib/resultCode';
import { reverseCalculateFromRealWorld } from '../../engine';
import StudioLayout from './StudioLayout';

// 실측을 건너뛴 학생을 위한 표준값. 이상화된 물리 엔진(s0=0.5mm)의 계산값이 아니라
// 실제 스마트폰 낙하 가속도계 측정에서 흔히 나오는 현실적인 수준의 값이다.
const STANDARD_ACCEL_N0 = 45; // g, 완충재 0장(맨바닥)
const STANDARD_ACCEL_N3 = 10; // g, 완충재 3장

export default function Step1CodeRestore() {
  const navigate = useNavigate();
  const studio = useStore((state) => state.studio);
  const updateStudio = useStore((state) => state.updateStudio);
  const [codeError, setCodeError] = useState(false);

  const handleRestore = () => {
    if (!studio.resultCodeInput.trim()) {
      updateStudio({ restoredStudentCode: null });
      setCodeError(false);
      return;
    }
    const decoded = decodeResultCode(studio.resultCodeInput);
    if (!decoded) {
      setCodeError(true);
      updateStudio({ restoredStudentCode: null });
      return;
    }
    setCodeError(false);
    updateStudio({ restoredStudentCode: decoded.studentCode });
  };

  const n0 = studio.measuredAccelN0 ?? STANDARD_ACCEL_N0;
  const n3 = studio.measuredAccelN3 ?? STANDARD_ACCEL_N3;
  const usingStandard = studio.measuredAccelN0 === null || studio.measuredAccelN3 === null;

  const calc = useMemo(() => {
    const r0 = reverseCalculateFromRealWorld(n0);
    const r3 = reverseCalculateFromRealWorld(n3);
    const dtRatio = r3.dt / r0.dt;
    return { r0, r3, dtRatio };
  }, [n0, n3]);

  return (
    <StudioLayout step={1} title="1. 코드 복원 / 실측값 입력" onNext={() => navigate('/studio/2')}>
      <div className="space-y-6">
        <section className="bg-white rounded-lg shadow border p-5">
          <h3 className="font-bold text-gray-800 mb-2">1. 1차시 결과 코드 입력 (건너뛰기 가능)</h3>
          <p className="text-sm text-gray-500 mb-3">학습지에 적어 둔 18자 결과 코드가 있다면 입력해 보세요.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={studio.resultCodeInput}
              onChange={(e) => {
                updateStudio({ resultCodeInput: e.target.value });
                setCodeError(false);
              }}
              placeholder="예: K7QM-3XB9-PW2F-HR5T-8J"
              className="flex-1 p-2 border rounded font-mono text-sm outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleRestore}
              className="px-4 py-2 bg-indigo-600 text-white rounded font-bold text-sm hover:bg-indigo-700"
            >
              복원하기
            </button>
          </div>
          {codeError && <p className="text-sm text-red-600 mt-2">코드를 다시 확인해 주세요.</p>}
          {studio.restoredStudentCode !== null && !codeError && (
            <p className="text-sm text-green-600 mt-2">복원 완료 (확인번호 {studio.restoredStudentCode}) — 1차시 응답과 이어서 진행합니다.</p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow border p-5">
          <h3 className="font-bold text-gray-800 mb-2">2. 2차시 실측값 입력 (건너뛰기 가능)</h3>
          <p className="text-sm text-gray-500 mb-3">
            스마트폰 가속도 센서로 측정한 <b>완충재 0장·3장의 최대 가속도(g)</b>를 입력하세요. 비워 두면 표준값을 사용합니다.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm text-gray-700">
              완충재 0장 (g)
              <input
                type="number"
                value={studio.measuredAccelN0 ?? ''}
                onChange={(e) => updateStudio({ measuredAccelN0: e.target.value === '' ? null : Number(e.target.value) })}
                placeholder={String(STANDARD_ACCEL_N0)}
                className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
              />
            </label>
            <label className="text-sm text-gray-700">
              완충재 3장 (g)
              <input
                type="number"
                value={studio.measuredAccelN3 ?? ''}
                onChange={(e) => updateStudio({ measuredAccelN3: e.target.value === '' ? null : Number(e.target.value) })}
                placeholder={String(STANDARD_ACCEL_N3)}
                className="w-full mt-1 p-2 border rounded outline-none focus:border-indigo-500"
              />
            </label>
          </div>
        </section>

        <section className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
          <h3 className="font-bold text-indigo-800 mb-2">3. 역산 결과</h3>
          {usingStandard && (
            <p className="text-xs text-indigo-500 mb-2">(입력하지 않은 값은 표준값으로 계산했습니다)</p>
          )}
          <p className="text-gray-800 leading-relaxed">
            측정값으로 계산하면 충돌 시간은 약 <b>{calc.r3.dt.toFixed(3)}초</b>, 평균힘은 약 <b>{calc.r3.F_avg.toFixed(0)}N</b>이었습니다.<br />
            완충재가 없을 때와 비교하면 충돌 시간은 <b>{calc.dtRatio.toFixed(1)}배</b>, 평균힘은 약 <b>1/{calc.dtRatio.toFixed(1)}</b>입니다.<br />
            충격량은 두 경우 모두 약 <b>{calc.r0.J.toFixed(2)} N·s</b>로 거의 같습니다.
          </p>
        </section>
      </div>
    </StudioLayout>
  );
}
