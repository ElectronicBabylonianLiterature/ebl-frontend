import SupersedableOperation from 'common/utils/SupersedableOperation'

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

test('Superseding makes the current operation stale', () => {
  const operation = new SupersedableOperation()
  const isStale = operation.start()

  operation.supersede()

  expect(isStale()).toBe(true)
})

test('Superseding without a started operation is harmless', () => {
  const operation = new SupersedableOperation()
  operation.supersede()

  expect(operation.start()()).toBe(false)
})

test('An operation started after superseding is current', () => {
  const operation = new SupersedableOperation()
  operation.start()
  operation.supersede()

  expect(operation.start()()).toBe(false)
})

test('Observing does not make earlier operations stale', () => {
  const operation = new SupersedableOperation()
  const isStarted = operation.start()
  const isObserved = operation.observe()

  expect(isStarted()).toBe(false)
  expect(isObserved()).toBe(false)
})

test('An observation goes stale when the operation is superseded or restarted', () => {
  const operation = new SupersedableOperation()
  const isObservedBeforeSupersede = operation.observe()
  operation.supersede()
  const isObservedBeforeStart = operation.observe()
  operation.start()

  expect(isObservedBeforeSupersede()).toBe(true)
  expect(isObservedBeforeStart()).toBe(true)
})
