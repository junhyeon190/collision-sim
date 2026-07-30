import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Lab from './pages/Lab';
import ExitQuestions from './pages/ExitQuestions';
import ResultCode from './pages/ResultCode';
import Studio from './pages/Studio';
import Teacher from './pages/Teacher';

// react-router-dom의 basename은 끝에 슬래시가 없어야 한다(공식 예시: "/app").
// Vite의 BASE_URL은 항상 끝에 슬래시가 붙어 나오므로(예: "/collision-sim/") 그대로 넘기면
// 라우터가 어떤 경로도 매칭하지 못하고 catch-all(*)로 떨어져 항상 /lab/0으로 리다이렉트된다.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        basename={basename}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          {/* 정적 경로가 :step 동적 경로보다 먼저 매칭되도록 위에 둔다 */}
          <Route path="/lab/exit" element={<ExitQuestions />} />
          <Route path="/lab/result" element={<ResultCode />} />
          <Route path="/lab/:step" element={<Lab />} />
          <Route path="/lab" element={<Navigate to="/lab/0" replace />} />
          <Route path="/studio/:step" element={<Studio />} />
          <Route path="/studio" element={<Navigate to="/studio/1" replace />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="*" element={<Navigate to="/lab/0" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
