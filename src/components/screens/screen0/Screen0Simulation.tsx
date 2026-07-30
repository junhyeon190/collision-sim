import { useEffect, useRef, useState } from 'react';

// 낙하 시뮬레이션: 높이 1.0m (화면 비율상 상단에서 하단으로), 
// h = 0.5 * g * t^2. t = sqrt(2h/g) = sqrt(2/9.8) = 0.451s
// 느린 재생 반복이므로 애니메이션 시간을 좀 늘려서(예: 0~0.8초 주기) 떨어지고 충돌을 관찰하도록 한다.

export default function Screen0Simulation() {
  const requestRef = useRef<number>();
  const [time, setTime] = useState(0); // 0.0 ~ 1.5s 주기

  const animate = (timestamp: number) => {
    // timestamp 바탕으로 0 ~ 1.5초 주기 생성
    const t = (timestamp % 2000) / 2000; // 0.0 ~ 1.0 (2초 반복)
    setTime(t);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 낙하 로직: t=0.0~0.7 구간에서 낙하, 0.7 이후 충돌 후 정지
  // 0.7초일 때 바닥에 닿게 설정. y = 10% ~ 80% 
  const yStart = 10;
  const yEnd = 80; // 바닥 높이
  
  // 낙하 거리 공식: 비율로 계산
  // t가 0~0.7일 때, y = yStart + (yEnd - yStart) * (t/0.7)^2
  const PHONE_SQUISH_MAX = 0.05;   // 스마트폰은 딱딱한 물체라 아주 살짝만 눌린다
  const CUSHION_SQUISH_MAX = 0.45; // 방석은 물체보다 훨씬 크게 눌렸다가 복원된다

  let yPosition = yStart;
  let phoneSquish = 1.0;   // 오른쪽(방석 쪽) 스마트폰 압축 비율
  let cushionSquish = 1.0; // 방석 자체의 압축 비율

  if (time <= 0.7) {
    const tNorm = time / 0.7;
    yPosition = yStart + (yEnd - yStart) * (tNorm * tNorm);
  } else {
    yPosition = yEnd;
    // 충돌 순간(afterT=0)부터 최대로 눌렸다가(0.5) 다시 복원되는(1.0) 연출
    const afterT = (time - 0.7) / 0.3;
    if (afterT < 0.5) {
      phoneSquish = 1.0 - (afterT * 2) * PHONE_SQUISH_MAX;
      cushionSquish = 1.0 - (afterT * 2) * CUSHION_SQUISH_MAX;
    } else {
      phoneSquish = (1 - PHONE_SQUISH_MAX) + ((afterT - 0.5) * 2) * PHONE_SQUISH_MAX;
      cushionSquish = (1 - CUSHION_SQUISH_MAX) + ((afterT - 0.5) * 2) * CUSHION_SQUISH_MAX;
    }
  }

  // 스마트폰 모형: 가로 세로 비율을 가진 사각형 (스마트폰처럼)
  const phoneWidth = 30;
  const phoneHeight = 60;

  return (
    <div className="flex w-full h-full bg-white relative overflow-hidden flex-col rounded-lg">
      <h3 className="absolute top-4 w-full text-center font-bold text-gray-700">충돌 순간 느린 재생 반복</h3>
      
      <div className="flex-1 flex w-full h-full mt-12">
        {/* 왼쪽: 시멘트 바닥 */}
        <div className="flex-1 relative border-r border-gray-200">
          <div className="absolute w-full bottom-0 h-[20%] bg-gray-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">시멘트 바닥</span>
          </div>
          <svg className="absolute w-full h-full top-0 left-0">
            {/* 맨바닥 충돌은 찌그러짐 없음 */}
            <rect 
              x="50%" 
              y={`${Math.min(yPosition, yEnd)}%`} 
              width={phoneWidth} 
              height={phoneHeight} 
              fill="#4b5563"
              rx="4"
              transform={`translate(-${phoneWidth/2}, -${phoneHeight})`}
            />
          </svg>
        </div>

        {/* 오른쪽: 방석 */}
        <div className="flex-1 relative">
          <div className="absolute w-full bottom-0 h-[20%] flex items-center justify-center flex-col">
            <div
              className="w-[80%] h-4 bg-orange-300 rounded-full shadow-inner mb-[-10px] z-10 opacity-80 origin-bottom"
              style={{ transform: `scaleY(${cushionSquish})` }}
            />
            <div className="w-full h-full bg-orange-100 flex items-end justify-center pb-2">
              <span className="text-orange-800 font-bold text-sm z-20 relative top-2">방석</span>
            </div>
          </div>
          <svg className="absolute w-full h-full top-0 left-0">
            <rect
              x="50%"
              y={`${Math.min(yPosition, yEnd)}%`}
              width={phoneWidth}
              height={phoneHeight * phoneSquish}
              fill="#4b5563"
              rx="4"
              transform={`translate(-${phoneWidth/2}, -${phoneHeight * phoneSquish})`}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
