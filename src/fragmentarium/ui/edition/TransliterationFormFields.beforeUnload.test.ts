import { handleBeforeUnload } from 'fragmentarium/ui/edition/TransliterationFormFields'

function createEvent(): BeforeUnloadEvent {
  return { returnValue: '' } as BeforeUnloadEvent
}

test('An unsaved change warns before unloading', () => {
  const event = createEvent()

  const result = handleBeforeUnload(event, () => true)

  expect(result).toEqual(
    'You have unsaved changes. Are you sure you want to leave?',
  )
  expect(event.returnValue).toEqual(result)
})

test('An unchanged form unloads without a warning', () => {
  const event = createEvent()

  expect(handleBeforeUnload(event, () => false)).toBeUndefined()
  expect(event.returnValue).toEqual('')
})
