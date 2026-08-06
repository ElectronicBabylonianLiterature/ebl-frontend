import SupersedableOperation from './SupersedableOperation'

test('An operation is current until it is superseded', () => {
  const operation = new SupersedableOperation()
  const isStale = operation.start()
  expect(isStale()).toBe(false)
})

test('Starting a new operation makes the previous one stale', () => {
  const operation = new SupersedableOperation()
  const isFirstStale = operation.start()
  const isSecondStale = operation.start()
  expect(isFirstStale()).toBe(true)
  expect(isSecondStale()).toBe(false)
})

test('Only the most recent operation is current', () => {
  const operation = new SupersedableOperation()
  const checks = [operation.start(), operation.start(), operation.start()]
  expect(checks.map((isStale) => isStale())).toEqual([true, true, false])
})
