import { useNavigate } from 'react-router-dom';
import Layout from '../../Layout';
import Screen2Expected from './Screen2Expected';
import Screen2Simulation from './Screen2Simulation';
import Screen2Observed from './Screen2Observed';
import Screen2Bottom from './Screen2Bottom';

export default function Screen2Main() {
  const navigate = useNavigate();
  const simWithHeader = (
    <div className="flex flex-col w-full h-full relative">
      <div className="w-full bg-gray-800 text-white p-2 text-xs flex flex-wrap justify-between items-center rounded-t shadow-sm z-30 font-mono tracking-wider">
        <div className="flex space-x-4">
          <span>물체 질량 : <strong className="text-yellow-300">같음</strong></span>
          <span>낙하 높이 : <strong className="text-yellow-300">같음</strong></span>
        </div>
        <div className="flex space-x-4">
          <span>충돌 직전 속도 : <strong className="text-yellow-300">같음</strong></span>
          <span>충돌 후 : <strong className="text-yellow-300">두 물체 모두 정지</strong></span>
        </div>
        <div className="flex space-x-4">
          <span>튕김 : <strong className="text-yellow-300">없음</strong></span>
          <span className="bg-red-600 px-1 rounded">다른 조건 : <strong className="text-white">바닥만 다름</strong></span>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        <Screen2Simulation />
      </div>
    </div>
  );

  return (
    <Layout
      step={2}
      question="완충재는 충격량을 줄일까, 충돌하는 힘을 줄일까?"
      expectedArea={<Screen2Expected />}
      simulationArea={simWithHeader}
      observedArea={<Screen2Observed />}
      bottomArea={<Screen2Bottom />}
      onPrev={() => navigate('/lab/1')}
      onNext={() => navigate('/lab/3')}
    />
  );
}
