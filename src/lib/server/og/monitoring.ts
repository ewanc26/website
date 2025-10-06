interface OgMetrics {
  cacheHits: number;
  cacheMisses: number;
  generationTimes: number[];
  errors: number;
  timeouts: number;
}

const metrics: OgMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  generationTimes: [],
  errors: 0,
  timeouts: 0
};

export function recordCacheHit() {
  metrics.cacheHits++;
}

export function recordCacheMiss() {
  metrics.cacheMisses++;
}

export function recordGenerationTime(ms: number) {
  metrics.generationTimes.push(ms);
  // Keep only last 100 measurements
  if (metrics.generationTimes.length > 100) {
    metrics.generationTimes.shift();
  }
}

export function recordError() {
  metrics.errors++;
}

export function recordTimeout() {
  metrics.timeouts++;
}

export function getMetrics() {
  const times = metrics.generationTimes;
  const avg = times.length > 0 
    ? times.reduce((a, b) => a + b, 0) / times.length 
    : 0;
  const max = times.length > 0 ? Math.max(...times) : 0;
  const min = times.length > 0 ? Math.min(...times) : 0;

  return {
    ...metrics,
    averageGenerationTime: Math.round(avg),
    maxGenerationTime: max,
    minGenerationTime: min,
    cacheHitRate: metrics.cacheHits + metrics.cacheMisses > 0
      ? ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2) + '%'
      : 'N/A'
  };
}

export function resetMetrics() {
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
  metrics.generationTimes = [];
  metrics.errors = 0;
  metrics.timeouts = 0;
}
