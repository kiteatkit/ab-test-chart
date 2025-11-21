# A/B Test Chart Visualization

Interactive chart visualization for analyzing A/B test results with multiple variations.

## Visualization Library

**Recharts** - A composable charting library built on React components. Chosen for:
- Native React integration with declarative API
- Built-in responsive design
- Excellent TypeScript support
- Rich feature set for interactive charts
- Active maintenance and good documentation

## Features

### Required Features
- ✅ Multiple variation comparison (up to 4 variations)
- ✅ Date range filtering with interactive brush/slider
- ✅ Conversion rate calculation and display
- ✅ Responsive design for different screen sizes
- ✅ Interactive tooltips with detailed metrics
- ✅ Clean, modern UI

### Bonus Features
- ✅ **Chart export** - Download chart as PNG image
- ✅ **Line style variations** - Switch between linear, smooth curves, and area charts
- ✅ **Variation selection** - Toggle individual variations on/off
- ✅ **Smart date labels** - Automatically switches between daily and monthly views based on zoom level
- ✅ **Interactive zoom** - Brush component for exploring specific date ranges
- ✅ **Real-time calculations** - Conversion rates update dynamically based on selected date range

## Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd ab-test-chart
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Chart.tsx          # Main chart component with Recharts
│   ├── Controls.tsx       # Control panel for filters and options
│   └── *.module.css       # Component styles
├── utils/
│   └── dataProcessor.ts   # Data transformation and calculations
├── types/
│   └── index.ts          # TypeScript type definitions
├── data.json             # A/B test data
└── App.tsx               # Main application component
```

## Usage

1. **Select Variations**: Use checkboxes to toggle which test variations to display
2. **Adjust Date Range**: Drag the brush slider at the bottom of the chart to zoom into specific periods
3. **Change Line Style**: Switch between linear, smooth, and area chart styles
4. **Export Chart**: Click "Export Chart" to download the current view as PNG

## Technology Stack

- React 19
- TypeScript
- Vite
- Recharts
- date-fns
- CSS Modules
