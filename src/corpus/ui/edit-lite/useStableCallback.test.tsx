import { renderHook } from '@testing-library/react'
import useStableCallback from 'corpus/ui/edit-lite/useStableCallback'

test('the callback is stable and calls the latest function', () => {
  const { result, rerender } = renderHook(
    ({ factor }: { factor: number }) =>
      useStableCallback((value: number): number => value * factor),
    { initialProps: { factor: 2 } },
  )
  const firstCallback = result.current

  expect(firstCallback(3)).toBe(6)

  rerender({ factor: 5 })

  expect(result.current).toBe(firstCallback)
  expect(firstCallback(3)).toBe(15)
})
