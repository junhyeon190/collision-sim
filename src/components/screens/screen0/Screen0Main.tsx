import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import Layout from '../../Layout';
import Screen0Expected from './Screen0Expected';
import Screen0Simulation from './Screen0Simulation';

export default function Screen0Main() {
  const navigate = useNavigate();
  const isLocked = useStore((state) => state.screen0.isLocked);

  return (
    <Layout
      step={0}
      question="충격을 줄인다는 것은 무엇을 줄이는 것일까?"
      expectedArea={<Screen0Expected />}
      simulationArea={<Screen0Simulation />}
      observedArea={null}
      bottomArea={null}
      onNext={() => navigate('/lab/1')}
      nextDisabled={!isLocked}
    />
  );
}
