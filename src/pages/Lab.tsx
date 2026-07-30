import { useState } from 'react';
import { useStore } from '../store/useStore';
import Screen0Main from '../components/screens/screen0/Screen0Main';
import Screen1Main from '../components/screens/screen1/Screen1Main';
import Screen2Main from '../components/screens/screen2/Screen2Main';
import Screen3Main from '../components/screens/screen3/Screen3Main';
import Screen5Main from '../components/screens/screen5/Screen5Main';
import { useParams, Navigate } from 'react-router-dom';

export default function Lab() {
  const { step } = useParams();
  const stepNum = parseInt(step || '0', 10);

  const [studentIdInput, setStudentIdInput] = useState('');

  const studentId = useStore((state) => state.studentId);
  const setStudentId = useStore((state) => state.setStudentId);

  // 1. 학번 입력 화면 (가장 먼저)
  if (!studentId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">충돌과 안전장치 시뮬레이션</h1>
          <p className="text-gray-600 mb-4 text-sm">자신의 학번을 입력해 주세요.</p>
          <input
            type="text"
            className="border-2 border-gray-300 p-3 w-full rounded mb-4 text-center text-xl tracking-widest focus:border-blue-500 outline-none"
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
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition"
            disabled={studentIdInput.length < 4}
            onClick={() => setStudentId(studentIdInput)}
          >
            입력 완료
          </button>
        </div>
      </div>
    );
  }

  // 화면 0 처리 (네비게이션은 Screen0Main 내부 Layout 헤더에 포함됨)
  if (stepNum === 0) {
    return (
      <div className="h-screen w-full relative">
        <Screen0Main />
      </div>
    );
  }

  // 화면 1 처리 (네비게이션은 Screen1Main 내부 Layout 헤더에 포함됨)
  if (stepNum === 1) {
    return (
      <div className="h-screen w-full relative">
        <Screen1Main />
      </div>
    );
  }

  // 화면 2 처리 (네비게이션은 Screen2Main 내부 Layout 헤더에 포함됨)
  if (stepNum === 2) {
    return (
      <div className="h-screen w-full relative">
        <Screen2Main />
      </div>
    );
  }

  // 화면 3 처리 (네비게이션은 Screen3Main 내부 Layout 헤더에 포함됨)
  if (stepNum === 3) {
    return (
      <div className="h-screen w-full relative">
        <Screen3Main />
      </div>
    );
  }

  // 화면 5 처리 (네비게이션은 Screen5Main 내부 Layout 헤더에 포함됨)
  if (stepNum === 5) {
    return (
      <div className="h-screen w-full relative">
        <Screen5Main />
      </div>
    );
  }

  return <Navigate to="/lab/0" replace />;
}
