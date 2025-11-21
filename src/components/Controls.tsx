import { useState, useRef, useEffect } from 'react';
import type { ChartData, TimeRange, LineStyle, Theme } from '../types';
import { getVariationId, getVariationColor } from '../utils/dataProcessor';
import styles from './Controls.module.css';

interface ControlsProps {
  chartData: ChartData;
  selectedVariations: string[];
  timeRange: TimeRange;
  lineStyle: LineStyle;
  theme: Theme;
  onVariationToggle: (varId: string) => void;
  onTimeRangeChange: (range: TimeRange) => void;
  onLineStyleChange: (style: LineStyle) => void;
  onThemeToggle: () => void;
  onExport: () => void;
  onZoomReset: () => void;
  hasZoom: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
}

export const Controls = ({
  chartData,
  selectedVariations,
  timeRange,
  lineStyle,
  theme,
  onVariationToggle,
  onTimeRangeChange,
  onLineStyleChange,
  onThemeToggle,
  onExport,
  onZoomReset,
  hasZoom,
  onZoomIn,
  onZoomOut,
  onFullscreen,
}: ControlsProps) => {
  const [isVariationOpen, setIsVariationOpen] = useState(false);
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [isLineStyleOpen, setIsLineStyleOpen] = useState(false);

  const variationRef = useRef<HTMLDivElement>(null);
  const timeRangeRef = useRef<HTMLDivElement>(null);
  const lineStyleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (variationRef.current && !variationRef.current.contains(event.target as Node)) {
        setIsVariationOpen(false);
      }
      if (timeRangeRef.current && !timeRangeRef.current.contains(event.target as Node)) {
        setIsTimeRangeOpen(false);
      }
      if (lineStyleRef.current && !lineStyleRef.current.contains(event.target as Node)) {
        setIsLineStyleOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getVariationLabel = () => {
    if (selectedVariations.length === chartData.variations.length) {
      return 'All variations selected';
    }
    if (selectedVariations.length === 1) {
      const varId = selectedVariations[0];
      const variation = chartData.variations.find((v) => getVariationId(v) === varId);
      return variation?.name || 'Unknown';
    }
    return `${selectedVariations.length} variations selected`;
  };

  const timeRangeOptions = [
    { value: 'day' as TimeRange, label: 'Day' },
    { value: 'week' as TimeRange, label: 'Week' },
  ];

  const lineStyleOptions = [
    { value: 'line' as LineStyle, label: 'Line' },
    { value: 'smooth' as LineStyle, label: 'Smooth' },
    { value: 'area' as LineStyle, label: 'Area' },
  ];

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.topControls}>
        {/* Variation Selector */}
        <div className={styles.dropdownWrapper} ref={variationRef}>
          <div className={styles.dropdown}>
            <button
              className={styles.dropdownButton}
              onClick={() => setIsVariationOpen(!isVariationOpen)}
            >
              <span>{getVariationLabel()}</span>
              <span className={styles.dropdownArrow}>▼</span>
            </button>
            {isVariationOpen && (
              <div className={styles.dropdownMenu}>
                {chartData.variations.map((variation, index) => {
                  const varId = getVariationId(variation);
                  const isSelected = selectedVariations.includes(varId);
                  const color = getVariationColor(index);

                  return (
                    <label
                      key={varId}
                      className={styles.dropdownItem}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onVariationToggle(varId)}
                        disabled={selectedVariations.length === 1 && isSelected}
                        style={{ accentColor: color }}
                      />
                      <span style={{ color: isSelected ? color : undefined }}>
                        {variation.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className={styles.dropdownWrapper} ref={timeRangeRef}>
          <div className={styles.dropdown}>
            <button
              className={styles.dropdownButton}
              onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
            >
              <span>{timeRangeOptions.find((opt) => opt.value === timeRange)?.label}</span>
              <span className={styles.dropdownArrow}>▼</span>
            </button>
            {isTimeRangeOpen && (
              <div className={styles.dropdownMenu}>
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.dropdownItem} ${
                      timeRange === option.value ? styles.active : ''
                    }`}
                    onClick={() => {
                      onTimeRangeChange(option.value);
                      setIsTimeRangeOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Line Style Selector */}
        <div className={styles.dropdownWrapper} ref={lineStyleRef}>
          <div className={styles.dropdown}>
            <button
              className={styles.dropdownButton}
              onClick={() => setIsLineStyleOpen(!isLineStyleOpen)}
            >
              <span>Line style: {lineStyleOptions.find((opt) => opt.value === lineStyle)?.label.toLowerCase()}</span>
              <span className={styles.dropdownArrow}>▼</span>
            </button>
            {isLineStyleOpen && (
              <div className={styles.dropdownMenu}>
                {lineStyleOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.dropdownItem} ${
                      lineStyle === option.value ? styles.active : ''
                    }`}
                    onClick={() => {
                      onLineStyleChange(option.value);
                      setIsLineStyleOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Icon Buttons */}
        <div className={styles.iconButtons}>
          <button
            className={styles.iconButton}
            onClick={onZoomOut}
            title="Zoom Out"
          >
            −
          </button>
          <button
            className={styles.iconButton}
            onClick={onZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button
            className={styles.iconButton}
            onClick={onZoomReset}
            disabled={!hasZoom}
            title="Reset Zoom"
          >
            ↻
          </button>
          <button
            className={styles.iconButton}
            onClick={onFullscreen}
            title="Fullscreen"
          >
            ⛶
          </button>
          <button
            className={styles.iconButton}
            onClick={onThemeToggle}
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className={styles.iconButton} onClick={onExport} title="Export PNG">
            ⬇
          </button>
        </div>
      </div>
    </div>
  );
};
