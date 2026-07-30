

interface Frame {
  t: number;
  F: number;
  v: number;
  x: number;
  a: number;
}

interface Props {
  currentFrame: Frame;
  currentTime: number;
  showForce: boolean;
  setShowForce: (val: boolean) => void;
  showVelocity: boolean;
  setShowVelocity: (val: boolean) => void;
  isPlaying: boolean;
  playbackRate: 1 | 0.25;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSlowMotion: () => void;
  isControlsEnabled: boolean;
  friction: number;
  setFriction: (val: number) => void;
  isFrictionUnlocked: boolean;
}

export default function Screen1Simulation({
  currentFrame, currentTime, showForce, setShowForce, showVelocity, setShowVelocity,
  isPlaying, playbackRate, onPlay, onPause, onReset, onSlowMotion, isControlsEnabled,
  friction, setFriction, isFrictionUnlocked
}: Props) {
  
  // 1픽셀을 0.01m (1cm) 정도로 매핑 (임의 스케일 조정)
  // x가 0 ~ 약 3.0~4.0m 까지 증가
  const scale = 150; 
  const cartX = 50 + currentFrame.x * scale;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 bg-white/80 p-2 rounded shadow">
        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={showForce} onChange={e => setShowForce(e.target.checked)} className="text-red-500 rounded focus:ring-red-500" />
          <span className="flex items-center"><span className="w-3 h-3 inline-block bg-red-500 mr-1 rounded-sm"></span> 힘 화살표</span>
        </label>
        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={showVelocity} onChange={e => setShowVelocity(e.target.checked)} className="text-blue-500 rounded focus:ring-blue-500" />
          <span className="flex items-center"><span className="w-3 h-3 inline-block bg-blue-500 mr-1 rounded-sm"></span> 속도 화살표</span>
        </label>
      </div>

      <div className="flex-1 relative overflow-hidden bg-blue-50/30">
        <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
          {/* 하늘과 땅 배경 */}
          <rect x="0" y="200" width="100%" height="100" fill="#e5e7eb" />
          <line x1="0" y1="200" x2="100%" y2="200" stroke="#9ca3af" strokeWidth="4" />

          {/* 수레 그룹 */}
          <g transform={`translate(${cartX}, 160)`}>
            {/* 바퀴 */}
            <circle cx="20" cy="30" r="10" fill="#4b5563" />
            <circle cx="80" cy="30" r="10" fill="#4b5563" />
            {/* 수레 본체 */}
            <rect x="0" y="0" width="100" height="30" rx="4" fill="#3b82f6" />
            
            {/* 손 애니메이션 (0~1초 사이 밀기) */}
            {currentFrame.t <= 1.0 && (
              <g transform="translate(-40, 10)">
                <path d="M 0 0 Q 20 -10 40 0" fill="none" stroke="#fca5a5" strokeWidth="4" />
                <circle cx="40" cy="0" r="8" fill="#f87171" />
              </g>
            )}

            {/* 힘 화살표 (빨강) */}
            {showForce && Math.abs(currentFrame.F) > 0.05 && (
              <g transform="translate(50, -30)">
                {/* 힘의 크기에 따라 화살표 길이 조절. 2N일 때 약 60px */}
                <line x1="0" y1="0" x2={currentFrame.F * 30} y2="0" stroke="red" strokeWidth="6" markerEnd="url(#arrow-red)" />
                <text x={currentFrame.F * 15} y="-10" textAnchor="middle" fill="red" fontSize="14" fontWeight="bold">힘(F)</text>
              </g>
            )}

            {/* 속도 화살표 (파랑) */}
            {showVelocity && currentFrame.v > 0.01 && (
              <g transform="translate(50, 15)">
                {/* 속도 크기에 따라 화살표 길이 조절. 2m/s일 때 약 60px */}
                <line x1="0" y1="0" x2={currentFrame.v * 30} y2="0" stroke="blue" strokeWidth="4" markerEnd="url(#arrow-blue)" />
                <text x={currentFrame.v * 15} y="15" textAnchor="middle" fill="blue" fontSize="12" fontWeight="bold">속도(v)</text>
              </g>
            )}
          </g>
          
          <defs>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <polygon points="0,0 10,5 0,10" fill="red" />
            </marker>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <polygon points="0,0 10,5 0,10" fill="blue" />
            </marker>
          </defs>
        </svg>

        {/* 현재 시간 오버레이 */}
        <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded shadow font-mono font-bold text-gray-700">
          t = {currentTime.toFixed(2)} 초
        </div>
      </div>

      <div className="flex-none flex flex-col border-t bg-gray-50">
        {/* 컨트롤 버튼 영역 */}
        <div className="p-4 flex justify-center space-x-4 items-center relative">
          {!isControlsEnabled && (
            <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                예측을 먼저 저장해 주세요
              </span>
            </div>
          )}
          
          <button 
            onClick={onReset}
            className="w-12 h-12 bg-white text-gray-700 rounded-full shadow hover:bg-gray-50 flex items-center justify-center border"
            title="처음으로"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {isPlaying ? (
            <button 
              onClick={onPause}
              className="w-16 h-16 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 flex items-center justify-center"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={onPlay}
              className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center pl-1.5"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}

          <button 
            onClick={onSlowMotion}
            className={`w-12 h-12 rounded-full shadow flex items-center justify-center font-bold text-xs border transition-colors
              ${playbackRate === 0.25 ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50'}`}
            title="느린 재생 (1/4 배속)"
          >
            1/4 배속
          </button>
        </div>

        {/* 마찰 슬라이더 영역 */}
        <div className={`p-3 border-t transition-all duration-500 ${isFrictionUnlocked ? 'bg-blue-50' : 'bg-gray-100 opacity-70'}`}>
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-gray-800 text-sm flex items-center">
              {!isFrictionUnlocked && <span className="mr-1">🔒</span>}
              조건 변경: 바닥의 마찰
            </h4>
            <span className="text-xs font-bold text-gray-600">
              현재 마찰 계수(μ) = {friction.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold text-gray-500">0 (에어트랙)</span>
            <input 
              type="range" 
              min="0" 
              max="0.3" 
              step="0.05"
              value={friction}
              onChange={(e) => setFriction(parseFloat(e.target.value))}
              disabled={!isFrictionUnlocked}
              className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${!isFrictionUnlocked ? 'cursor-not-allowed' : ''}`}
            />
            <span className="text-xs font-bold text-gray-500">0.3 (거친 바닥)</span>
          </div>
          {!isFrictionUnlocked ? (
            <p className="text-xs text-center text-gray-500 mt-1">해석 질문에 답한 후 열립니다.</p>
          ) : (
            <p className="text-xs text-center text-blue-600 mt-1">실제 교실 바닥이라면? 마찰을 늘려 보세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}
