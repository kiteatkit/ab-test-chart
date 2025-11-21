import { useRef, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Brush,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { ProcessedDataPoint, ChartData, LineStyle } from '../types';
import { getVariationColor, getVariationName, getVariationId } from '../utils/dataProcessor';
import styles from './Chart.module.css';

interface ChartProps {
  data: ProcessedDataPoint[];
  chartData: ChartData;
  selectedVariations: string[];
  lineStyle: LineStyle;
  zoomDomain?: { x?: [number, number]; y?: [number, number] };
  onZoomChange?: (domain: { x?: [number, number]; y?: [number, number] } | undefined) => void;
  dataZoomRange?: { start: number; end: number };
  onDataZoomChange?: (range: { start: number; end: number }) => void;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  chartData,
}: {
  active?: boolean;
  payload?: readonly { value: number; dataKey: string; color: string }[];
  label?: string | number;
  chartData: ChartData;
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>
        {label ? format(parseISO(String(label)), 'MMM dd, yyyy') : ''}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className={styles.tooltipItem}>
          <div className={styles.tooltipDot} style={{ backgroundColor: entry.color }} />
          <span>{getVariationName(chartData, entry.dataKey)}:</span>
          <span className={styles.tooltipValue}>{entry.value.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
};

export const Chart = ({
  data,
  chartData,
  selectedVariations,
  lineStyle,
  zoomDomain,
  onZoomChange,
  dataZoomRange = { start: 0, end: 100 },
  onDataZoomChange,
}: ChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.floor((dataZoomRange.start / 100) * data.length);
  const endIndex = Math.ceil((dataZoomRange.end / 100) * data.length) - 1;

  if (!data.length || !selectedVariations.length) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.noData}>No data to display. Please select at least one variation.</div>
      </div>
    );
  }

  const visibleData = data.slice(
    Math.max(0, startIndex),
    Math.min(data.length, endIndex + 1)
  );

  const xAxisTicks = useMemo(() => {
    if (visibleData.length <= 31) return undefined;

    const monthsMap = new Map<string, string>();
    visibleData.forEach(d => {
      const monthKey = format(parseISO(d.date), 'yyyy-MM');
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, d.date);
      }
    });

    return Array.from(monthsMap.values());
  }, [visibleData]);

  const formatXAxis = (dateStr: string) => {
    const date = parseISO(dateStr);
    return visibleData.length <= 31 ? format(date, 'MMM dd') : format(date, 'MMM');
  };

  const formatYAxis = (value: number) => `${value.toFixed(0)}%`;

  const isArea = lineStyle === 'area';
  const ChartComponent = isArea ? AreaChart : LineChart;
  const LineComponent = isArea ? Area : Line;

  const lineProps = {
    type: lineStyle === 'smooth' || isArea ? ('monotone' as const) : ('linear' as const),
    strokeWidth: 2,
    dot: false,
    activeDot: { r: 5 },
  };

  const handleBrushChange = (newIndexes: { startIndex?: number; endIndex?: number }) => {
    if (newIndexes.startIndex === undefined || newIndexes.endIndex === undefined) return;

    if (onDataZoomChange) {
      const start = (newIndexes.startIndex / data.length) * 100;
      const end = ((newIndexes.endIndex + 1) / data.length) * 100;
      onDataZoomChange({ start, end });
    }

    if (onZoomChange) {
      const hasZoom = newIndexes.startIndex !== 0 || newIndexes.endIndex !== data.length - 1;
      onZoomChange(hasZoom ? { x: [newIndexes.startIndex, newIndexes.endIndex] } : undefined);
    }
  };

  return (
    <div className={styles.chartContainer} ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            ticks={xAxisTicks}
            domain={zoomDomain?.x || ['auto', 'auto']}
          />
          <YAxis
            tickFormatter={formatYAxis}
            domain={zoomDomain?.y || ['auto', 'auto']}
            label={{
              value: 'Conversion Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              offset: 10,
            }}
          />
          <Tooltip
            content={(props) => <CustomTooltip {...props} chartData={chartData} />}
            cursor={{ stroke: 'var(--accent-color)', strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          <Legend />
          <Brush
            dataKey="date"
            height={30}
            stroke="var(--accent-color)"
            fill="var(--bg-secondary)"
            tickFormatter={formatXAxis}
            startIndex={startIndex}
            endIndex={endIndex}
            onChange={handleBrushChange}
          />
          {selectedVariations.map((varId) => (
            <LineComponent
              key={varId}
              dataKey={varId}
              name={getVariationName(chartData, varId)}
              stroke={getVariationColor(
                chartData.variations.findIndex((v) => getVariationId(v) === varId)
              )}
              fill={
                isArea
                  ? getVariationColor(
                      chartData.variations.findIndex((v) => getVariationId(v) === varId)
                    )
                  : undefined
              }
              fillOpacity={isArea ? 0.3 : undefined}
              {...lineProps}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};
