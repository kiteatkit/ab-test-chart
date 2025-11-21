export interface Variation {
  id?: number;
  name: string;
}

export interface DayData {
  date: string;
  visits: Record<string, number>;
  conversions: Record<string, number>;
}

export interface ChartData {
  variations: Variation[];
  data: DayData[];
}

export interface ProcessedDataPoint {
  date: string;
  [key: string]: number | string; // variationId: conversionRate
}

export type TimeRange = 'day' | 'week';
export type LineStyle = 'line' | 'smooth' | 'area';
export type Theme = 'light' | 'dark';

export interface ChartState {
  selectedVariations: string[];
  timeRange: TimeRange;
  lineStyle: LineStyle;
  theme: Theme;
  zoomDomain?: { x?: [number, number]; y?: [number, number] };
}