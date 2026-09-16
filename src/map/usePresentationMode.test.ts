import { act, renderHook } from '@testing-library/react'
import usePresentationMode from './usePresentationMode'

function pressEscape(): void {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })
}

describe('usePresentationMode', () => {
  it('starts inactive', () => {
    expect(
      renderHook(() => usePresentationMode()).result.current.isActive,
    ).toBe(false)
  })

  it('enters and exits through its own controls', () => {
    const { result } = renderHook(() => usePresentationMode())

    act(() => result.current.enter())
    expect(result.current.isActive).toBe(true)

    act(() => result.current.exit())
    expect(result.current.isActive).toBe(false)
  })

  it('exits on Escape', () => {
    const { result } = renderHook(() => usePresentationMode())
    act(() => result.current.enter())

    pressEscape()

    expect(result.current.isActive).toBe(false)
  })

  it('ignores other keys while active', () => {
    const { result } = renderHook(() => usePresentationMode())
    act(() => result.current.enter())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    expect(result.current.isActive).toBe(true)
  })

  it('listens only while active and cleans up on unmount', () => {
    const add = jest.spyOn(window, 'addEventListener')
    const remove = jest.spyOn(window, 'removeEventListener')
    const { result, unmount } = renderHook(() => usePresentationMode())

    expect(add).not.toHaveBeenCalledWith('keydown', expect.anything())

    act(() => result.current.enter())
    expect(add).toHaveBeenCalledWith('keydown', expect.any(Function))

    unmount()
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function))

    add.mockRestore()
    remove.mockRestore()
  })
})
