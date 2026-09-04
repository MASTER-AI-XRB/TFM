/** Map + truthy filter in one pass (replaces `.map().filter(Boolean)`). */
export function mapTruthy<T, U>(items: Iterable<T>, transform: (item: T) => U): U[] {
  const result: U[] = []
  for (const item of items) {
    const value = transform(item)
    if (value) {
      result.push(value)
    }
  }
  return result
}
