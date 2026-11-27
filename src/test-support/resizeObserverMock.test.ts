import {
  MockResizeObserver,
  installMockResizeObserver,
  resizeObservedElements,
  uninstallMockResizeObserver,
} from 'test-support/resizeObserverMock'

afterEach(uninstallMockResizeObserver)

test('calls back only observers that still observe an element', () => {
  installMockResizeObserver()
  const watching = jest.fn()
  const stopped = jest.fn()
  const element = document.createElement('div')
  const watchingObserver = new window.ResizeObserver(watching)
  const stoppedObserver = new window.ResizeObserver(stopped)
  watchingObserver.observe(element)
  stoppedObserver.observe(element)
  stoppedObserver.unobserve(element)

  resizeObservedElements()

  expect(MockResizeObserver.instances).toEqual([
    watchingObserver,
    stoppedObserver,
  ])
  expect(watching).toHaveBeenCalledWith([], watchingObserver)
  expect(stopped).not.toHaveBeenCalled()
})

test('can be removed again', () => {
  installMockResizeObserver()
  uninstallMockResizeObserver()
  expect('ResizeObserver' in window).toBe(false)
})
