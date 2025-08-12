/**
 * Performance monitoring utilities for tracking Core Web Vitals and performance metrics
 */

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcpScore: string | null;
  lcpScore: string | null;
  fidScore: string | null;
  clsScore: string | null;
}

/**
 * Get performance score based on metric value and thresholds
 */
function getPerformanceScore(metric: number, thresholds: { good: number; needsImprovement: number }): string {
  if (metric <= thresholds.good) return 'good';
  if (metric <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Calculate First Contentful Paint score
 */
function getFCPScore(fcp: number): string {
  return getPerformanceScore(fcp, { good: 1800, needsImprovement: 3000 });
}

/**
 * Calculate Largest Contentful Paint score
 */
function getLCPScore(lcp: number): string {
  return getPerformanceScore(lcp, { good: 2500, needsImprovement: 4000 });
}

/**
 * Calculate First Input Delay score
 */
function getFIDScore(fid: number): string {
  return getPerformanceScore(fid, { good: 100, needsImprovement: 300 });
}

/**
 * Calculate Cumulative Layout Shift score
 */
function getCLSScore(cls: number): string {
  return getPerformanceScore(cls, { good: 0.1, needsImprovement: 0.25 });
}

/**
 * Measure Core Web Vitals and other performance metrics
 */
export function measurePerformance(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    const metrics: PerformanceMetrics = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      fcpScore: null,
      lcpScore: null,
      fidScore: null,
      clsScore: null
    };

    // Measure TTFB (Time to First Byte)
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }

    // Measure FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformancePaintTiming[];
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
        metrics.fcpScore = getFCPScore(metrics.fcp);
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Measure LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metrics.lcp = lastEntry.startTime;
        metrics.lcpScore = getLCPScore(metrics.lcp);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEventTiming[];
      const fidEntry = entries[0];
      if (fidEntry && typeof fidEntry.processingStart === 'number') {
        metrics.fid = fidEntry.processingStart - fidEntry.startTime;
        metrics.fidScore = getFIDScore(metrics.fid);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Measure CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as LayoutShift[];
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      metrics.cls = clsValue;
      metrics.clsScore = getCLSScore(metrics.cls);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Wait for all metrics to be collected
    setTimeout(() => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      resolve(metrics);
    }, 5000); // Wait up to 5 seconds for metrics
  });
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics(metrics: PerformanceMetrics): void {
  console.group('🚀 Performance Metrics');
  console.log(`FCP: ${metrics.fcp?.toFixed(2)}ms (${metrics.fcpScore})`);
  console.log(`LCP: ${metrics.lcp?.toFixed(2)}ms (${metrics.lcpScore})`);
  console.log(`FID: ${metrics.fid?.toFixed(2)}ms (${metrics.fidScore})`);
  console.log(`CLS: ${metrics.cls?.toFixed(3)} (${metrics.clsScore})`);
  console.log(`TTFB: ${metrics.ttfb?.toFixed(2)}ms`);
  console.groupEnd();
}

/**
 * Send performance metrics to analytics (if configured)
 */
export function sendPerformanceMetrics(metrics: PerformanceMetrics, endpoint?: string): void {
  if (!endpoint) return;

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metrics
    })
  }).catch(error => {
    console.warn('Failed to send performance metrics:', error);
  });
}
