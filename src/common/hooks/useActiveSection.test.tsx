import { act, renderHook } from '@testing-library/react'
import useActiveSection from 'common/hooks/useActiveSection'
import {
  installMockIntersectionObserver,
  triggerIntersection,
  MockIntersectionObserver,
} from 'test-support/intersectionObserverMock'

describe('useActiveSection', () => {
  beforeEach(() => {
    installMockIntersectionObserver()
    document.body.innerHTML = ''
  })

  it('returns null and observes nothing when there are no ids', () => {
    const { result } = renderHook(() => useActiveSection([]))
    expect(result.current).toBeNull()
    expect(MockIntersectionObserver.instances).toHaveLength(0)
  })

  it('observes only elements that exist in the document', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>'
    renderHook(() => useActiveSection(['a', 'b', 'missing']))
    expect(MockIntersectionObserver.instances[0].observedElements).toHaveLength(
      2,
    )
  })

  it('selects the first visible id in document order and drops ids that leave', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>'
    const ids = ['a', 'b']
    const { result } = renderHook(() => useActiveSection(ids))
    act(() => {
      triggerIntersection([
        { id: 'b', isIntersecting: true },
        { id: 'a', isIntersecting: true },
      ])
    })
    expect(result.current).toBe('a')
    act(() => {
      triggerIntersection([{ id: 'a', isIntersecting: false }])
    })
    expect(result.current).toBe('b')
  })

  it('stays null while nothing is intersecting', () => {
    document.body.innerHTML = '<div id="a"></div>'
    const ids = ['a']
    const { result } = renderHook(() => useActiveSection(ids))
    act(() => {
      triggerIntersection([{ id: 'a', isIntersecting: false }])
    })
    expect(result.current).toBeNull()
  })

  it('disconnects the observer on unmount', () => {
    document.body.innerHTML = '<div id="a"></div>'
    const { unmount } = renderHook(() => useActiveSection(['a']))
    const observer = MockIntersectionObserver.instances[0]
    expect(observer.observedElements).toHaveLength(1)
    unmount()
    expect(observer.observedElements).toHaveLength(0)
  })
})
