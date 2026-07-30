import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, AreaChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

// recharts ReferenceLine의 label prop 중 이 프로젝트에서 실제로 쓰는 형태만 좁혀서 정의한다.
type LabelPosition = 'top' | 'bottom' | 'left' | 'right' | 'insideTopLeft' | 'insideBottomLeft';

interface ReferenceLineLabel {
  value: string | number;
  position?: LabelPosition;
  fontSize?: number;
  fill?: string;
  fontWeight?: number;
  offset?: number;
}

export interface ReferenceLineSpec {
  y?: number;
  x?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  label?: ReferenceLineLabel;
}

interface TimeSeriesChartProps {
  chartType?: 'line' | 'area';
  data: Record<string, number>[];
  timeKey?: string;
  currentTime?: number; // 이 시각 이전 데이터만 보여줌
  hideTicks?: boolean;
  xLabel?: string;
  yLabel?: string;
  xDomain?: [number, number];
  xTicks?: number[];
  yDomain?: [number, number];
  yTicks?: number[];
  referenceLines?: ReferenceLineSpec[];
  children: React.ReactNode; // <Line>, <Area>, <Tooltip> 등
}

export default function TimeSeriesChart({
  chartType = 'line',
  data,
  timeKey = 't',
  currentTime,
  hideTicks = false,
  xLabel = '시간 t (s)',
  yLabel = '힘 F (N)',
  xDomain,
  xTicks,
  yDomain,
  yTicks,
  referenceLines = [],
  children
}: TimeSeriesChartProps) {
  
  const visibleData = useMemo(() => {
    if (currentTime === undefined) return data;
    return data.filter(d => d[timeKey] <= currentTime);
  }, [data, currentTime, timeKey]);

  const commonProps = {
    data: visibleData,
    margin: { top: 30, right: 20, left: hideTicks ? 0 : -10, bottom: 20 }
  };

  const commonChildren = (
    <>
      {/* 축 끝의 화살표 마커. recharts CartesianAxis 소스 기준: X축은 왼쪽→오른쪽(x1<x2)으로 그려지므로
          markerEnd로 오른쪽 끝에, Y축은 위(y1)→아래(y2)로 그려지므로 markerStart + auto-start-reverse로
          위쪽 끝에 바깥쪽을 향하도록 붙인다. */}
      <defs>
        <marker id="axis-arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <polygon points="0,0 10,5 0,10" fill="#6b7280" />
        </marker>
        <marker id="axis-arrow-start" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <polygon points="0,0 10,5 0,10" fill="#6b7280" />
        </marker>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey={timeKey}
        type="number"
        domain={xDomain}
        ticks={xTicks}
        tick={hideTicks ? false : { fontSize: 12 }}
        axisLine={{ stroke: '#666', strokeWidth: 2, markerEnd: 'url(#axis-arrow-end)' }}
        tickLine={!hideTicks}
        label={{ value: xLabel, position: 'bottom', offset: 5, fontSize: 13 }}
      />
      <YAxis
        domain={yDomain}
        allowDataOverflow={!!yDomain}
        ticks={yTicks}
        tick={hideTicks ? false : { fontSize: 12 }}
        axisLine={{ stroke: '#666', strokeWidth: 2, markerStart: 'url(#axis-arrow-start)' }}
        tickLine={!hideTicks}
        label={{ value: yLabel, position: hideTicks ? 'insideTopLeft' : 'top', offset: hideTicks ? -10 : 15, fontSize: 13 }}
      />
      {referenceLines.map((ref, idx) => (
        <ReferenceLine key={idx} {...ref} />
      ))}
      {children}
    </>
  );

  return (
    <div className="absolute inset-0 w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <LineChart {...commonProps}>
            {commonChildren}
          </LineChart>
        ) : (
          <AreaChart {...commonProps}>
            {commonChildren}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
