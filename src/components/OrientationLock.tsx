import { useEffect, useState } from 'react';

export default function OrientationLock() {
  const [shouldLock, setShouldLock] = useState(false);

  useEffect(() => {
    // 세로 방향이면서, 화면 너비가 900px 미만이고, 터치 기기일 때만 안내를 띄운다.
    const mediaQuery = window.matchMedia('(orientation: portrait) and (max-width: 899px) and (pointer: coarse)');
    
    const handleOrientationChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setShouldLock(e.matches);
    };

    // Initial check
    handleOrientationChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleOrientationChange);
    return () => mediaQuery.removeEventListener('change', handleOrientationChange);
  }, []);

  if (!shouldLock) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <svg className="w-24 h-24 mb-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <h1 className="text-3xl font-bold mb-4">가로로 돌려 주세요</h1>
      <p className="text-lg text-gray-300">
        이 시뮬레이터는 가로 화면에 최적화되어 있습니다.<br />
        기기를 가로 방향으로 회전해 주세요.
      </p>
    </div>
  );
}
