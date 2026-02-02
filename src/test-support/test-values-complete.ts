export function testContainsAllValues(
  valueMapping: { [key: string]: unknown },
  valueList: unknown,
  label = '',
): void {
  test.each(Object.values(valueMapping))(`%s is in ${label}`, (value) => {
    expect(valueList).toContain(value)
  })
}
