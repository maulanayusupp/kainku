/** Small array/object helpers used by the catalogue filtering pipeline. */

/** Groups items by a derived key, preserving insertion order. */
export function groupBy<T, K extends string>(items: T[], keyOf: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyOf(item)
      ;(acc[key] ||= []).push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

/** Counts occurrences of each value produced by `keysOf`. */
export function countBy<T, K extends string>(
  items: T[],
  keysOf: (item: T) => K | K[],
): Record<K, number> {
  const counts = {} as Record<K, number>
  for (const item of items) {
    const result = keysOf(item)
    for (const key of Array.isArray(result) ? result : [result]) {
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return counts
}

/** Removes duplicates while keeping the first occurrence. */
export function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

/** Adds `value` if absent, removes it if present. Returns a new array. */
export function toggle<T>(items: T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value]
}

/** Splits an array into fixed-size chunks. */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/** True when the two arrays contain at least one shared member. */
export function intersects<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.some((item) => b.includes(item))
}

/**
 * Stable sort by a comparator. `Array#sort` is already stable in every engine
 * this project targets; this wrapper just avoids mutating the input.
 */
export function sortBy<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  return [...items].sort(compare)
}

/** Case- and accent-insensitive substring match. */
export function matchesQuery(haystack: string, query: string): boolean {
  if (!query.trim()) return true
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  return normalize(haystack).includes(normalize(query.trim()))
}
