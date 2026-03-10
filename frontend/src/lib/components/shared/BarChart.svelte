<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import Chart from 'chart.js/auto';

  export let data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      [key: string]: unknown;
    }>;
  } = { labels: [], datasets: [] };

  export let options: Record<string, unknown> = {};
  export let height: string = '250px';

  let className: string = '';
  export { className as class };

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  const defaultOptions: Record<string, unknown> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-secondary)',
          font: { family: 'Inter', size: 11 },
          boxWidth: 12,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: 'var(--bg-elevated)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-default)',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 8,
        titleFont: { family: 'Inter', size: 12, weight: '600' },
        bodyFont: { family: 'Inter', size: 11 },
      },
    },
    scales: {
      x: {
        grid: { color: 'var(--border-muted)', drawBorder: false },
        ticks: { color: 'var(--text-muted)', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'var(--border-muted)', drawBorder: false },
        ticks: { color: 'var(--text-muted)', font: { family: 'Inter', size: 11 } },
        beginAtZero: true,
      },
    },
  };

  function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  function createChart() {
    if (!canvas) return;
    if (chart) {
      chart.destroy();
      chart = null;
    }
    const mergedOptions = deepMerge(defaultOptions, options);
    chart = new Chart(canvas, {
      type: 'bar',
      data,
      options: mergedOptions as Record<string, unknown>,
    });
  }

  function updateChart() {
    if (!chart) {
      createChart();
      return;
    }
    chart.data = data;
    chart.update();
  }

  onMount(() => {
    createChart();
  });

  afterUpdate(() => {
    updateChart();
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  });
</script>

<div class={cn('bg-bg-surface border border-border rounded-lg p-4', className)}>
  <div style="height: {height}; position: relative;">
    <canvas bind:this={canvas}></canvas>
  </div>
</div>
