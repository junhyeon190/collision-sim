import { useEffect, useRef } from 'react';
import { simulateCollision } from '../../../engine';
import { useStore } from '../../../store/useStore';

export default function Screen2Simulation() {
  const { progress, isPlaying, isSlowMotion } = useStore(state => state.screen2);
  const updateScreen2 = useStore(state => state.updateScreen2);
  const isLocked = useStore(state => state.screen2.isLocked);
  
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const togglePlay = () => {
    if (!isLocked) return; // 저장 전에 락
    if (progress >= 2.0) {
      updateScreen2({ progress: 0, isPlaying: true });
    } else {
      updateScreen2({ isPlaying: !isPlaying });
    }
  };

  const toggleSlowMotion = () => {
    updateScreen2({ isSlowMotion: !isSlowMotion });
  };

  const hardCol = simulateCollision({ n: 0 }); // 맨바닥
  const softCol = simulateCollision({ n: 3 }); // 완충재 3장

  // 완충재가 눌리는 애니메이션의 최대 압축률. softCol.s(약 9.5mm)를 기준으로 정규화해서
  // "완충재 3장"만 눈에 띄게 눌리게 한다. (이전 코드는 s(미터 단위, 0.001 수준)를 100으로
  // 나눠 사실상 0에 가까운 값이 되어 맨바닥과 구분이 안 갔다.)
  const CUSHION_SQUISH_MAX = 0.35;

  const updateAnimation = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (isPlaying) {
      const speed = isSlowMotion ? 0.0005 : 0.0015;
      const next = progress + delta * speed;
      if (next >= 2.0) {
        updateScreen2({ isPlaying: false, progress: 2.0 });
      } else {
        updateScreen2({ progress: next });
      }
    }
    requestRef.current = requestAnimationFrame(updateAnimation);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateAnimation);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isSlowMotion, progress, updateScreen2]);

  // 스마트폰 모형: 30x60
  const phoneWidth = 30;
  const phoneHeight = 60;
  const yStart = 10;
  const yEnd = 80;

  // 낙하(progress 0~1), 충돌(progress 1~2)
  const getSimState = (prog: number, colData: ReturnType<typeof simulateCollision>) => {
    if (prog < 1.0) {
      const p = prog;
      return {
        y: yStart + (yEnd - yStart) * (p * p),
        padSquish: 1.0,
      };
    } else {
      const t = (prog - 1.0) * softCol.dt;
      
      let y = yEnd;
      let padSquish = 1.0;

      if (t < colData.dt) {
        const pCol = t / colData.dt;
        // colData.s를 softCol.s(가장 많이 눌리는 경우) 기준으로 정규화 → 맨바닥은 거의 안 눌리고
        // 완충재 3장은 최대 CUSHION_SQUISH_MAX만큼 눌리는 것이 눈에 보이게 된다.
        const crushAmount = Math.sin(pCol * Math.PI) * CUSHION_SQUISH_MAX * (colData.s / softCol.s);
        padSquish = 1.0 - crushAmount;
        y = yEnd + (1.0 - padSquish) * 5; // 완충재가 눌린 만큼 y도 더 내려감 (수치 보정)
      } else {
        padSquish = 1.0; 
      }
      return { y, padSquish };
    }
  };

  const hardState = getSimState(progress, hardCol);
  const softState = getSimState(progress, softCol);

  return (
    <div className="flex w-full h-full bg-white relative overflow-hidden flex-col rounded-lg">
      <div className="absolute top-2 w-full flex justify-center space-x-2 z-20">
        <button 
          onClick={togglePlay}
          disabled={!isLocked}
          className={`px-4 py-2 text-white rounded font-bold shadow w-24 transition-colors ${!isLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {progress >= 2.0 ? '다시 재생' : isPlaying ? '일시정지' : '재생'}
        </button>
        <button 
          onClick={toggleSlowMotion}
          className={`px-4 py-2 rounded font-bold shadow transition-colors ${isSlowMotion ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {isSlowMotion ? '느린 재생 중' : '느린 재생'}
        </button>
      </div>

      <div className="flex-1 flex w-full h-full mt-14">
        {/* 왼쪽: 시멘트 바닥 (맨바닥) */}
        <div className="flex-1 relative border-r border-gray-200">
          <div className="absolute w-full bottom-0 h-[20%] bg-gray-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">맨바닥</span>
          </div>
          <div 
            className="absolute bg-gray-600 rounded"
            style={{ 
              width: phoneWidth, 
              height: phoneHeight, 
              left: '50%',
              top: `${Math.min(hardState.y, yEnd)}%`,
              transform: `translate(-50%, -100%)`
            }}
          />
        </div>

        {/* 오른쪽: 완충재 3장 */}
        <div className="flex-1 relative">
          <div className="absolute w-full bottom-0 h-[20%] flex items-center justify-center flex-col">
            <div className="w-[80%] z-10 origin-bottom flex flex-col items-center mb-[-15px]" style={{ transform: `scaleY(${softState.padSquish})` }}>
              <div className="w-full h-3 bg-blue-200 rounded-t shadow-sm border-b border-blue-300" />
              <div className="w-full h-3 bg-blue-300 shadow-sm border-b border-blue-400" />
              <div className="w-full h-3 bg-blue-400 rounded-b shadow-sm" />
            </div>
            <div className="w-full h-full bg-blue-50 flex items-end justify-center pb-2 border-t-2 border-blue-200">
              <span className="text-blue-800 font-bold text-sm z-20 relative top-2">완충재 3장</span>
            </div>
          </div>
          <div 
            className="absolute bg-gray-600 rounded z-20"
            style={{ 
              width: phoneWidth, 
              height: phoneHeight, 
              left: '50%',
              top: `${Math.min(softState.y, yEnd + 5)}%`,
              transform: `translate(-50%, -100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
