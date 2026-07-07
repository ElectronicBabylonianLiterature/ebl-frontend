import {
  installMockIntersectionObserver,
  triggerIntersection,
} from 'test-support/intersectionObserverMock'

describe('MockIntersectionObserver', () => {
  beforeEach(() => {
    installMockIntersectionObserver()
  })

  it('records observed elements and supports unobserve and disconnect', () => {
    const observer = new IntersectionObserver(jest.fn())
    const first = document.createElement('div')
    const second = document.createElement('div')
    observer.observe(first)
    observer.observe(second)

    observer.unobserve(first)
    observer.unobserve(document.createElement('div'))
    expect(observer.takeRecords()).toEqual([])
    expect(observer.root).toBeNull()
    expect(observer.rootMargin).toBe('')
    expect(observer.thresholds).toEqual([])

    observer.disconnect()
    expect(observer.takeRecords()).toEqual([])
  })

  it('triggers the latest observer callback with mapped entries', () => {
    const callback = jest.fn()
    new IntersectionObserver(callback)

    triggerIntersection([
      { id: 'x', isIntersecting: true, top: 7 },
      { id: 'y', isIntersecting: false },
    ])

    expect(callback).toHaveBeenCalledTimes(1)
    const entries = callback.mock.calls[0][0]
    expect(entries[0].target.id).toBe('x')
    expect(entries[0].isIntersecting).toBe(true)
    expect(entries[0].boundingClientRect.top).toBe(7)
    expect(entries[1].boundingClientRect.top).toBe(0)
  })
})
