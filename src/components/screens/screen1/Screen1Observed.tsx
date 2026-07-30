import { Line, Tooltip } from 'recharts';
import TimeSeriesChart, { ReferenceLineSpec } from '../../common/TimeSeriesChart';

interface Frame {
  t: number;
  F: number;
  v: number;
  x: number;
  a: number;
  [key: string]: number; // TimeSeriesChart가 timeKey로 동적 접근할 수 있게 하는 인덱스 시그니처
}

interface Props {
  engineData: Frame[];
  currentTime: number;
  friction: number;
}

export default function Screen1Observed({ engineData, currentTime, friction }: Props) {
  const fRefLines: ReferenceLineSpec[] = friction > 0
    ? [
        { y: 0, stroke: "#000", strokeWidth: 2 },
        { x: 1.0, stroke: "gray", strokeDasharray: "3 3", label: { position: 'top', value: '손 뗌', fontSize: 12 } },
        { x: currentTime, stroke: "red", strokeWidth: 2 }
      ]
    : [
        { x: 1.0, stroke: "gray", strokeDasharray: "3 3", label: { position: 'top', value: '손 뗌', fontSize: 12 } },
        { x: currentTime, stroke: "red", strokeWidth: 2 }
      ];

  const vRefLines: ReferenceLineSpec[] = [
    { x: 1.0, stroke: "gray", strokeDasharray: "3 3", label: { position: 'top', value: '손 뗌', fontSize: 12 } },
    { x: currentTime, stroke: "red", strokeWidth: 2 }
  ];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 그래프 영역 */}
      <div className="flex-1 min-h-0 flex flex-col space-y-3">
        <div className="bg-gray-50 border p-1 rounded relative flex-1 min-h-[120px] flex flex-col">
          <h4 className="text-sm font-bold text-gray-700 text-center flex-none">힘-시간 그래프</h4>
          <div className="flex-1 w-full min-h-0 mt-1 relative">
            <TimeSeriesChart
              chartType="line"
              data={engineData}
              currentTime={currentTime}
              xDomain={[0, 3.0]}
              xTicks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              yDomain={friction > 0 ? [-4, 6] : [0, 4]}
              yTicks={friction > 0 ? [-4, -2, 0, 2, 4, 6] : [0, 1, 2, 3, 4]}
              hideTicks={false}
              referenceLines={fRefLines}
            >
              <Tooltip formatter={(value: number) => value.toFixed(2)} labelFormatter={label => `${Number(label).toFixed(2)}s`} />
              <Line type="monotone" dataKey="F" stroke="red" strokeWidth={2} dot={false} isAnimationActive={false} />
            </TimeSeriesChart>
          </div>
        </div>

        <div className="bg-gray-50 border p-1 rounded relative flex-1 min-h-[120px] flex flex-col">
          <h4 className="text-sm font-bold text-gray-700 text-center flex-none">속도-시간 그래프</h4>
          <div className="flex-1 w-full min-h-0 mt-1 relative">
            <TimeSeriesChart
              chartType="line"
              data={engineData}
              currentTime={currentTime}
              xDomain={[0, 3.0]}
              xTicks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              yDomain={[0, 3]}
              yTicks={[0, 1, 2, 3]}
              yLabel="속도 v (m/s)"
              hideTicks={false}
              referenceLines={vRefLines}
            >
              <Tooltip formatter={(value: number) => value.toFixed(2)} labelFormatter={label => `${Number(label).toFixed(2)}s`} />
              <Line type="monotone" dataKey="v" stroke="blue" strokeWidth={2} dot={false} isAnimationActive={false} />
            </TimeSeriesChart>
          </div>
        </div>
      </div>
    </div>
  );
}
