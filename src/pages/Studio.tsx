import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Step1CodeRestore from '../components/studio/Step1CodeRestore';
import Step2Situation from '../components/studio/Step2Situation';
import Step3Problem from '../components/studio/Step3Problem';
import Step4Prompt from '../components/studio/Step4Prompt';
import Step5SelfCheck from '../components/studio/Step5SelfCheck';
import Step6Canvas from '../components/studio/Step6Canvas';
import Step7Print from '../components/studio/Step7Print';

export default function Studio() {
  const { step } = useParams();
  const stepNum = parseInt(step || '1', 10);

  const [studentIdInput, setStudentIdInput] = useState('');
  const studentId = useStore((state) => state.studentId);
  const setStudentId = useStore((state) => state.setStudentId);

  if (!studentId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-indigo-700 mb-6">설계 스튜디오 (3차시)</h1>
          <p className="text-gray-600 mb-4 text-sm">자신의 학번을 입력해 주세요.</p>
          <input
            type="text"
            className="border-2 border-gray-300 p-3 w-full rounded mb-4 text-center text-xl tracking-widest focus:border-indigo-500 outline-none"
            placeholder="예) 10101"
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && studentIdInput.length >= 4) {
                setStudentId(studentIdInput);
              }
            }}
          />
          <button
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition"
            disabled={studentIdInput.length < 4}
            onClick={() => setStudentId(studentIdInput)}
          >
            입력 완료
          </button>
        </div>
      </div>
    );
  }

  switch (stepNum) {
    case 1: return <Step1CodeRestore />;
    case 2: return <Step2Situation />;
    case 3: return <Step3Problem />;
    case 4: return <Step4Prompt />;
    case 5: return <Step5SelfCheck />;
    case 6: return <Step6Canvas />;
    case 7: return <Step7Print />;
    default: return <Navigate to="/studio/1" replace />;
  }
}
