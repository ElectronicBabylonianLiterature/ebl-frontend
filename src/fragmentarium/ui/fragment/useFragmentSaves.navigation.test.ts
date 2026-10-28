import { act, renderHook } from '@testing-library/react'
import useFragmentSaves from 'fragmentarium/ui/fragment/useFragmentSaves'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { deferred } from 'test-support/concurrencyLimiterHelpers'

it('ignores a previous fragment save without ending the current save', async () => {
  const firstFragment = fragmentFactory.build({ number: 'K.1' })
  const secondFragment = fragmentFactory.build({ number: 'K.2' })
  const savedSecondFragment = fragmentFactory.build({ number: 'K.2' })
  const firstSave = deferred<Fragment>()
  const secondSave = deferred<Fragment>()
  const { result, rerender } = renderHook(
    (fragment: Fragment) => useFragmentSaves(fragment),
    { initialProps: firstFragment },
  )

  act(() => {
    void result.current.handleSave(() => firstSave.promise)
  })
  rerender(secondFragment)
  act(() => {
    void result.current.handleSave(() => secondSave.promise)
  })

  await act(async () => firstSave.resolve(firstFragment))

  expect(result.current.visibleFragment).toBe(secondFragment)
  expect(result.current.isSaving).toBe(true)
  expect(result.current.error).toBeNull()

  await act(async () => secondSave.resolve(savedSecondFragment))

  expect(result.current.visibleFragment).toBe(savedSecondFragment)
  expect(result.current.isSaving).toBe(false)
})
