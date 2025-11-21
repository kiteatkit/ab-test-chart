import type { ChartData, ProcessedDataPoint } from '../types';
import { startOfWeek, format, parseISO } from 'date-fns';

export const getVariationId = (variation: { id?: number; name: string }): string => {
  return variation.id !== undefined ? String(variation.id) : '0';
};

export const calculateConversionRate = (conversions: number, visits: number): number => {
  if (visits === 0) return 0;
  return (conversions / visits) * 100;
};

export const processDataByDay = (chartData: ChartData): ProcessedDataPoint[] => {
  return chartData.data.map((dayData) => {
    const point: ProcessedDataPoint = {
      date: dayData.date,
    };

    chartData.variations.forEach((variation) => {
      const varId = getVariationId(variation);
      const visits = dayData.visits[varId] || 0;
      const conversions = dayData.conversions[varId] || 0;
      point[varId] = calculateConversionRate(conversions, visits);
    });

    return point;
  });
};

export const processDataByWeek = (chartData: ChartData): ProcessedDataPoint[] => {
  const weeklyData: Map<string, Record<string, { visits: number; conversions: number }>> = new Map();

  chartData.data.forEach((dayData) => {
    const date = parseISO(dayData.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    // Используем первую реальную дату из данных для каждой недели вместо вычисленного weekStart
    if (!weeklyData.has(dayData.date)) {
      // Проверяем, есть ли уже данные для этой недели с другим ключом
      let existingWeekKey: string | null = null;
      for (const [key] of weeklyData.entries()) {
        const keyDate = parseISO(key);
        const keyWeekStart = format(startOfWeek(keyDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        if (keyWeekStart === weekKey) {
          existingWeekKey = key;
          break;
        }
      }

      if (!existingWeekKey) {
        weeklyData.set(dayData.date, {});
      } else {
        // Используем существующий ключ для этой недели
        const week = weeklyData.get(existingWeekKey)!;
        chartData.variations.forEach((variation) => {
          const varId = getVariationId(variation);
          const visits = dayData.visits[varId] || 0;
          const conversions = dayData.conversions[varId] || 0;

          if (!week[varId]) {
            week[varId] = { visits: 0, conversions: 0 };
          }

          week[varId].visits += visits;
          week[varId].conversions += conversions;
        });
        return;
      }
    }

    const week = weeklyData.get(dayData.date)!;

    chartData.variations.forEach((variation) => {
      const varId = getVariationId(variation);
      const visits = dayData.visits[varId] || 0;
      const conversions = dayData.conversions[varId] || 0;

      if (!week[varId]) {
        week[varId] = { visits: 0, conversions: 0 };
      }

      week[varId].visits += visits;
      week[varId].conversions += conversions;
    });
  });

  return Array.from(weeklyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, varData]) => {
      const point: ProcessedDataPoint = { date };

      Object.entries(varData).forEach(([varId, { visits, conversions }]) => {
        point[varId] = calculateConversionRate(conversions, visits);
      });

      return point;
    });
};

export const getVariationColor = (index: number): string => {
  const colors = [
    '#8884d8', // Original - blue
    '#82ca9d', // Variation A - green
    '#ffc658', // Variation B - yellow
    '#ff7c7c', // Variation C - red
  ];
  return colors[index % colors.length];
};

export const getVariationName = (chartData: ChartData, varId: string): string => {
  const variation = chartData.variations.find((v) => getVariationId(v) === varId);
  return variation?.name || `Variation ${varId}`;
};
