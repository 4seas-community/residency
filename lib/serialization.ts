export function serializeDateValues<T>(value: T): T {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return (value as Date).toISOString() as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeDateValues(item)) as T
  }

  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value)
    if (prototype === Object.prototype || prototype === null) {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, serializeDateValues(nestedValue)]),
      ) as T
    }
  }

  return value
}
