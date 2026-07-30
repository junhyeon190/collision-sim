import { useState, useMemo } from 'react';
import { Area, ReferenceDot, ReferenceLine } from 'recharts';
import { simulateCollision } from '../../../engine';
import { useStore } from '../../../store/useStore';
import TimeSeriesChart from '../../common/TimeSeriesChart';

export default function Screen2Observed() {
  const { progress, hasComparedArea } = useStore(state => state.screen2);
  const updateScreen2 = useStore(state => state.updateScreen2);
  const isLocked = useStore(state => state.screen2.isLocked);

  const [showAreaAnim, setShowAreaAnim] = useState(false);
  const [showBowl, setShowBowl] = useState(false);
  // 학생 화면에는 항상 숨김(spec.md: 화면2까지 수치 숨김). 지금은 교사(준현) 확인용 임시 토글.
  const [showValues, setShowValues] = useState(false);

  const { data, hardPeak, hardPeakT, hardDt, softPeak, softPeakT, softDt, impulseJ } = useMemo(() => {
    const hard = simulateCollision({ n: 0 });
    const soft = simulateCollision({ n: 3 });
    const maxT = soft.dt;

    const arr = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxT;
      let fHard = 0;
      if (t <= hard.dt) {
        fHard = hard.F_peak * Math.sin((Math.PI * t) / hard.dt);
      }
      const fSoft = soft.F_peak * Math.sin((Math.PI * t) / soft.dt);

      // 맨바닥 힘(약 6000N)이 완충재 힘(약 300N)보다 18배 가까이 커서, 실제 크기 그대로 그리면
      // 완충재 곡선이 거의 안 보인다. 두 곡선이 화면 안에 함께 들어오도록 제곱근 스케일로 눌러서 그린다.
      // (면적이 같다는 정확한 증거는 아래 '면적 비교해 보기' 버튼의 도식으로 별도 제공한다.)
      arr.push({ t, fHard: Math.sqrt(fHard), fSoft: Math.sqrt(fSoft) });
    }
    return {
      data: arr,
      hardPeak: hard.F_peak,
      hardPeakT: hard.dt / 2, // sin(π t/dt) 최대점은 t = dt/2
      hardDt: hard.dt, // 충돌 시작(t=0)부터 끝까지 걸린 시간
      softPeak: soft.F_peak,
      softPeakT: soft.dt / 2,
      softDt: soft.dt,
      impulseJ: hard.J, // 충격량 J=mv는 n(완충재 개수)과 무관해 두 경우 값이 같다(soft.J와 동일)
    };
  }, []);

  // 낙하시(0~1)는 그래프 0. 충돌시(1~2)는 시간에 맞게 그래프 그림.
  const maxT = data[data.length - 1].t;
  const currentTime = progress < 1.0 ? 0 : (progress - 1.0) * maxT;
  
  const isPlaybackFinished = progress >= 2.0;

  if (!isLocked) {
    return (
      <div className="flex flex-col w-full h-full p-2 bg-white rounded-lg shadow relative items-center justify-center">
        <h3 className="font-bold text-gray-700 mb-4">충돌 시 힘-시간 그래프</h3>
        <div className="flex-1 w-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
          <p className="text-gray-500 font-bold">예측을 저장하고 시뮬레이션을 재생하면 결과를 볼 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-2 bg-white rounded-lg shadow relative">
      <div className="flex items-center justify-center relative mb-2">
        <h3 className="text-center font-bold text-gray-700">충돌 시 힘-시간 그래프</h3>
        {!showAreaAnim && (
          <button
            onClick={() => setShowValues((v) => !v)}
            title="학생에게는 항상 숨겨진, 교사 확인용 임시 버튼입니다"
            className={`absolute right-0 text-[11px] px-2 py-0.5 rounded border font-bold
              ${showValues ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
          >
            🔎 확인용(교사)
          </button>
        )}
      </div>

      <div className="flex-1 relative flex flex-col justify-end">
        {showAreaAnim ? (
          <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center pt-8">
            <h4 className="font-bold text-blue-700 mb-6">두 곡선의 면적(충격량)은 같다</h4>
            <div className="flex items-end justify-center space-x-12 h-32 w-full px-12">
              <div className="flex flex-col items-center w-32 relative">
                <span className="mb-2 text-xs text-gray-500 font-bold">맨바닥 면적</span>
                <div className="bg-red-400 w-8 transition-all duration-1000 ease-in-out origin-bottom" style={{ height: '100px' }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 animate-fade-in delay-1000">
                  <span className="font-bold text-white text-lg">같음</span>
                </div>
              </div>
              <div className="flex flex-col items-center w-32 relative">
                <span className="mb-2 text-xs text-gray-500 font-bold">완충재 면적</span>
                <div className="bg-blue-400 w-32 transition-all duration-1000 ease-in-out origin-bottom" style={{ height: '25px' }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 animate-fade-in delay-1000">
                  <span className="font-bold text-white text-lg">같음</span>
                </div>
              </div>
            </div>
            <p className="mt-8 text-sm text-gray-600">높이와 너비는 달라도, 넓이는 완전히 같습니다.</p>
            {showValues && (
              <p className="mt-2 text-xs font-bold text-indigo-600" title="학생에게는 항상 숨겨진, 교사 확인용 수치입니다">
                🔎 면적(충격량) J ≈ {impulseJ.toFixed(3)} N·s (두 경우 동일)
              </p>
            )}
          </div>
        ) : (
          <TimeSeriesChart
            chartType="area"
            data={data}
            timeKey="t"
            currentTime={currentTime}
            hideTicks={true}
            xLabel="시간 t (s)"
            yLabel="힘 F (N)"
          >
            <Area type="monotone" dataKey="fHard" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} strokeWidth={2} isAnimationActive={false} />
            <Area type="monotone" dataKey="fSoft" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2} isAnimationActive={false} />

            {/* 영점 (구조 표시, 항상 보임) */}
            <ReferenceDot
              x={0}
              y={0}
              r={3}
              fill="#374151"
              stroke="#fff"
              strokeWidth={1}
              isFront
              label={{ value: 'O', position: 'left', fontSize: 11, fill: '#374151', fontWeight: 700 }}
            />

            {/* 각 곡선의 최댓값·시각 (교사 확인용, 학생 화면에는 기본적으로 숨김) */}
            {showValues && currentTime >= hardPeakT && (
              <ReferenceDot
                x={hardPeakT}
                y={Math.sqrt(hardPeak)}
                r={4}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth={1}
                isFront
                label={{
                  value: `${hardPeak.toFixed(0)}N @ ${hardPeakT.toFixed(4)}s`,
                  position: 'right',
                  fontSize: 11,
                  fill: '#ef4444',
                  fontWeight: 700,
                }}
              />
            )}
            {showValues && currentTime >= softPeakT && (
              <ReferenceDot
                x={softPeakT}
                y={Math.sqrt(softPeak)}
                r={4}
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth={1}
                isFront
                label={{
                  value: `${softPeak.toFixed(0)}N @ ${softPeakT.toFixed(4)}s`,
                  position: 'top',
                  fontSize: 11,
                  fill: '#3b82f6',
                  fontWeight: 700,
                }}
              />
            )}

            {/* 시간 축 위 충돌 구간(시점~종점) 표시. 시점(t=0)은 영점(O)과 겹치므로 종점에만 세로 눈금을 긋는다. */}
            {showValues && currentTime >= hardDt && (
              <ReferenceLine
                x={hardDt}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="2 2"
                label={{
                  value: `Δt=${hardDt.toFixed(4)}s`,
                  position: 'insideBottomLeft',
                  fontSize: 10,
                  fill: '#ef4444',
                  fontWeight: 700,
                  offset: 6,
                }}
              />
            )}
            {showValues && currentTime >= softDt && (
              <ReferenceLine
                x={softDt}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="2 2"
                label={{
                  value: `Δt=${softDt.toFixed(4)}s`,
                  position: 'insideBottomLeft',
                  fontSize: 10,
                  fill: '#3b82f6',
                  fontWeight: 700,
                  offset: 6,
                }}
              />
            )}
          </TimeSeriesChart>
        )}
        {!showAreaAnim && showValues && currentTime > 0 && (
          <div
            className="absolute top-1 right-1 text-[11px] font-bold text-indigo-600 bg-white/80 px-2 py-0.5 rounded"
            title="학생에게는 항상 숨겨진, 교사 확인용 수치입니다"
          >
            🔎 J ≈ {impulseJ.toFixed(3)} N·s (두 곡선 면적 동일)
          </div>
        )}
      </div>

      <div className="flex justify-center mt-2 space-x-2">
        {!isPlaybackFinished && (
          <span className="text-xs text-gray-500 mt-2 absolute">시뮬레이션을 끝까지 재생하면 숨겨진 기능이 열립니다.</span>
        )}
        <button 
          onClick={() => {
            setShowAreaAnim(!showAreaAnim);
            if (!hasComparedArea) updateScreen2({ hasComparedArea: true });
          }}
          disabled={!isPlaybackFinished}
          className={`px-3 py-1 text-sm rounded shadow font-bold z-20 
            ${!isPlaybackFinished ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
              showAreaAnim ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        >
          {showAreaAnim ? '그래프 다시 보기' : '면적 비교해 보기'}
        </button>
        <button 
          onClick={() => setShowBowl(!showBowl)}
          disabled={!hasComparedArea}
          className={`px-3 py-1 text-sm rounded shadow font-bold z-20
            ${!hasComparedArea ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
              showBowl ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        >
          {!hasComparedArea ? '먼저 면적 비교를 누르세요' : showBowl ? '물그릇 비유 숨기기' : '물그릇 비유 보기'}
        </button>
      </div>

      {showBowl && (
        <div className="mt-4 p-4 bg-teal-50 rounded-lg flex items-center justify-around border border-teal-100 z-10">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-600 mb-2">맨바닥 (좁고 높은 그릇)</span>
            <div className="w-8 h-24 border-b-2 border-l-2 border-r-2 border-gray-400 relative">
              <div className="absolute bottom-0 w-full h-20 bg-blue-300 opacity-80" />
            </div>
            <span className="text-xs text-blue-600 font-bold mt-1">물 200ml</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-600 mb-2">완충재 (넓고 낮은 그릇)</span>
            <div className="w-24 h-12 border-b-2 border-l-2 border-r-2 border-gray-400 relative mt-12">
              <div className="absolute bottom-0 w-full h-8 bg-blue-300 opacity-80" />
            </div>
            <span className="text-xs text-blue-600 font-bold mt-1">물 200ml</span>
          </div>
        </div>
      )}
    </div>
  );
}
