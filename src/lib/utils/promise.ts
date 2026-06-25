/**
 * Map an async function over an array with a concurrency cap.
 * Uses a fixed-size worker pool instead of Promise.all on every slice,
 * which is fairer for mixed-latency tasks and avoids thundering
 * the downstream service.
 */

export async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 5,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  const queue = [...items];
  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item === undefined) continue;
        try {
          const value = await fn(item);
          results.push({ status: "fulfilled", value });
        } catch (reason) {
          results.push({ status: "rejected", reason });
        }
      }
    });

  await Promise.all(workers);
  return results;
}
