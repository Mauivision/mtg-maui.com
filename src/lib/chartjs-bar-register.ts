/**
 * Registers Chart.js scales/elements used by horizontal bar charts (leaderboard, draft).
 * Import this module once before rendering any `<Bar />` from react-chartjs-2 in those widgets.
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export { ChartJS };
