/** Minimal observable value, shaped like Svelte's writable so callers stay unchanged. */
export interface Readable<T> {
  subscribe(run: (value: T) => void): () => void;
  get(): T;
}

export function writable<T>(initial: T) {
  let value = initial;
  const subs = new Set<(v: T) => void>();
  const set = (next: T) => {
    if (Object.is(next, value)) return;
    value = next;
    subs.forEach((fn) => fn(value));
  };
  return {
    set,
    update: (fn: (v: T) => T) => set(fn(value)),
    get: () => value,
    subscribe(run: (v: T) => void) {
      subs.add(run);
      run(value);
      return () => subs.delete(run);
    },
  };
}
