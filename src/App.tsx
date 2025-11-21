import { useState, useMemo, useEffect } from 'react';
import { Chart } from './components/Chart';
import { Controls } from './components/Controls';
import type { ChartData, TimeRange, LineStyle, Theme, ProcessedDataPoint } from './types';
import { processDataByDay, processDataByWeek, getVariationId } from './utils/dataProcessor';
import { toPng } from 'html-to-image';
import chartDataJson from './data.json';
import styles from './App.module.css';

function App() {
  const [chartData] = useState<ChartData>(chartDataJson as ChartData);
  const [selectedVariations, setSelectedVariations] = useState<string[]>(() => {
    return chartData.variations.map((v) => getVariationId(v));
  });
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [lineStyle, setLineStyle] = useState<LineStyle>('smooth');
  const [theme, setTheme] = useState<Theme>('light');
  const [zoomDomain, setZoomDomain] = useState<
    { x?: [number, number]; y?: [number, number] } | undefined
  >();
  const [chartKey, setChartKey] = useState(0);
  const [dataZoomRange, setDataZoomRange] = useState<{ start: number; end: number }>({ start: 0, end: 100 });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const processedData = useMemo<ProcessedDataPoint[]>(() => {
    if (timeRange === 'week') {
      return processDataByWeek(chartData);
    }
    return processDataByDay(chartData);
  }, [chartData, timeRange]);

  const filteredData = useMemo(() => {
    return processedData.map((point) => {
      const filtered: ProcessedDataPoint = { date: point.date };
      selectedVariations.forEach((varId) => {
        if (point[varId] !== undefined) {
          filtered[varId] = point[varId];
        }
      });
      return filtered;
    });
  }, [processedData, selectedVariations]);

  const handleVariationToggle = (varId: string) => {
    setSelectedVariations((prev) => {
      if (prev.includes(varId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== varId);
      }
      return [...prev, varId];
    });
  };

  const handleExport = async () => {
    const chartElement = document.querySelector('[class*="chartContainer"]') as HTMLElement;
    if (!chartElement) return;

    try {
      const dataUrl = await toPng(chartElement, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `ab-test-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  const handleZoomReset = () => {
    setZoomDomain(undefined);
    setDataZoomRange({ start: 0, end: 100 });
    setChartKey((prev) => prev + 1); // Force chart to remount and reset brush
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleZoomIn = () => {
    setDataZoomRange((prev) => {
      const range = prev.end - prev.start;
      const newRange = Math.max(range * 0.7, 5); // Уменьшаем диапазон на 30%, минимум 5%
      const center = (prev.start + prev.end) / 2;
      let newStart = center - newRange / 2;
      let newEnd = center + newRange / 2;

      // Корректируем если выходим за границы
      if (newStart < 0) {
        newStart = 0;
        newEnd = Math.min(newRange, 100);
      }
      if (newEnd > 100) {
        newEnd = 100;
        newStart = Math.max(100 - newRange, 0);
      }

      return { start: newStart, end: newEnd };
    });
  };

  const handleZoomOut = () => {
    setDataZoomRange((prev) => {
      const range = prev.end - prev.start;
      if (range >= 99) return { start: 0, end: 100 }; // Уже максимальный зум

      const newRange = Math.min(range / 0.7, 100); // Увеличиваем диапазон (обратное zoom in)
      const center = (prev.start + prev.end) / 2;
      let newStart = center - newRange / 2;
      let newEnd = center + newRange / 2;

      if (newStart < 0) {
        newStart = 0;
        newEnd = Math.min(newRange, 100);
      }
      if (newEnd > 100) {
        newEnd = 100;
        newStart = Math.max(100 - newRange, 0);
      }

      return { start: Math.max(newStart, 0), end: Math.min(newEnd, 100) };
    });
  };

  const handleFullscreen = async () => {
    const chartContainer = document.querySelector('[class*="chartContainer"]');
    if (!chartContainer) return;

    try {
      if (!document.fullscreenElement) {
        await chartContainer.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  if (!chartData) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>A/B Testing</h1>
        </header>

        <Controls
          chartData={chartData}
          selectedVariations={selectedVariations}
          timeRange={timeRange}
          lineStyle={lineStyle}
          theme={theme}
          onVariationToggle={handleVariationToggle}
          onTimeRangeChange={setTimeRange}
          onLineStyleChange={setLineStyle}
          onThemeToggle={handleThemeToggle}
          onExport={handleExport}
          onZoomReset={handleZoomReset}
          hasZoom={!!zoomDomain || dataZoomRange.start !== 0 || dataZoomRange.end !== 100}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFullscreen={handleFullscreen}
        />

        <Chart
          key={chartKey}
          data={filteredData}
          chartData={chartData}
          selectedVariations={selectedVariations}
          lineStyle={lineStyle}
          zoomDomain={zoomDomain}
          onZoomChange={setZoomDomain}
          dataZoomRange={dataZoomRange}
          onDataZoomChange={setDataZoomRange}
        />
      </div>
    </div>
  );
}

export default App;
