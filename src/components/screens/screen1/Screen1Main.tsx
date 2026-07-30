import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../Layout';
import { useStore } from '../../../store/useStore';
import { simulateCart } from '../../../engine';
import Screen1Expected from './Screen1Expected';
import Screen1Simulation from './Screen1Simulation';
import Screen1Observed from './Screen1Observed';
import Screen1Bottom from './Screen1Bottom';

export default function Screen1Main() {
  const navigate = useNavigate();
  const isLocked = useStore((state) => state.screen1.isLocked);
  
  // 시뮬레이션 상태
  const [friction, setFriction] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<1 | 0.25>(1); // 1배속 또는 1/4배속 (느린 재생)
  const [currentTime, setCurrentTime] = useState(0);
  
  // 시각화 토글 상태
  const [showForce, setShowForce] = useState(true);
  const [showVelocity, setShowVelocity] = useState(true);
  
  // 마찰 슬라이더 개방 상태 (관찰 -> 해석 질문(3번) 정답 시 열림)
  const screen1 = useStore((state) => state.screen1);
  const isFrictionUnlocked = screen1.interpretationAnswer === 3;

  // 엔진 시계열 데이터
  const engineData = useMemo(() => simulateCart(friction), [friction]);

  // 애니메이션 로직
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // 초 단위
      setCurrentTime(prevTime => {
        const nextTime = prevTime + deltaTime * playbackRate;
        if (nextTime >= 2.0) {
          setIsPlaying(false);
          return 2.0; // 끝까지 감
        }
        return nextTime;
      });
    }
    previousTimeRef.current = time;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      previousTimeRef.current = undefined;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, playbackRate]);

  // 마찰력 변경 시 시간 초기화 (다시 시작)
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [friction]);

  // 현재 시간에 가장 가까운 데이터 인덱스 찾기
  // 엔진 데이터는 20ms(0.02초) 간격
  const currentIndex = Math.min(
    Math.floor(currentTime / 0.02),
    engineData.length - 1
  );
  
  const currentFrame = engineData[currentIndex] || engineData[0];

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  const handleSlowMotion = () => {
    setPlaybackRate(prev => prev === 1 ? 0.25 : 1);
  };

  return (
    <Layout 
      step={1}
      question="손을 뗀 뒤에도 수레를 앞으로 미는 힘이 남아 있을까?"
      expectedArea={<Screen1Expected />}
      simulationArea={
        <Screen1Simulation 
          currentFrame={currentFrame}
          currentTime={currentTime}
          showForce={showForce}
          setShowForce={setShowForce}
          showVelocity={showVelocity}
          setShowVelocity={setShowVelocity}
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onSlowMotion={handleSlowMotion}
          isControlsEnabled={isLocked} // 예측 저장 후에만 활성화
          friction={friction}
          setFriction={setFriction}
          isFrictionUnlocked={isFrictionUnlocked}
        />
      }
      observedArea={
        <Screen1Observed 
          engineData={engineData}
          currentTime={currentTime}
          friction={friction}
        />
      }
      bottomArea={<Screen1Bottom />}
      onPrev={() => navigate('/lab/0')}
      onNext={() => navigate('/lab/2')}
    />
  );
}
