import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import OrientationLock from './components/OrientationLock';
import Lab from './pages/Lab';
import ExitQuestions from './pages/ExitQuestions';
import ResultCode from './pages/ResultCode';
import Studio from './pages/Studio';
import Teacher from './pages/Teacher';

export default function App() {
  return (
    <ErrorBoundary>
      <OrientationLock />
      <BrowserRouter
        basename={import.meta.env.BASE_URL}
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
