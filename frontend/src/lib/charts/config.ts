import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// TODO: Read from CSS variables for light theme support.
// Chart.js defaults are set once at import and don't re-read CSS variables.
const THEME = {
  text: '#8b949e',      // matches --text-secondary
  border: '#30363d',    // matches --border
  surface: '#1c2333',   // matches --surface
} as const;

// Apply Arkive dark theme to all charts
Chart.defaults.color = THEME.text;
Chart.defaults.borderColor = THEME.border;
Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.plugins.tooltip.backgroundColor = THEME.surface;
Chart.defaults.plugins.tooltip.borderColor = THEME.border;
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.plugins.tooltip.padding = { x: 10, y: 6 };
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
