import {
  handleBeforeUnload,
  runBeforeUnloadEvent,
  unsavedChangesMessage,
} from 'fragmentarium/ui/edition/beforeUnloadWarning'

function createEvent(): BeforeUnloadEvent {
  return { returnValue: '' } as BeforeUnloadEvent
}

describe('handleBeforeUnload', () => {
  it('warns and sets returnValue when there are unsaved changes', () => {
    const event = createEvent()

    expect(handleBeforeUnload(event, () => true)).toBe(unsavedChangesMessage)
    expect(event.returnValue).toBe(unsavedChangesMessage)
  })

  it('stays silent and leaves returnValue alone when there are no changes', () => {
    const event = createEvent()

    expect(handleBeforeUnload(event, () => false)).toBeUndefined()
    expect(event.returnValue).toBe('')
  })
})

describe('runBeforeUnloadEvent', () => {
  it('registers a listener while there are unsaved changes', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener')

    runBeforeUnloadEvent({ hasChanges: () => true })

    expect(addEventListener).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    )
    addEventListener.mockRestore()
  })

  it('registers no listener while the form is pristine', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener')

    runBeforeUnloadEvent({ hasChanges: () => false })

    expect(addEventListener).not.toHaveBeenCalled()
    addEventListener.mockRestore()
  })

  it('removes the listener it registered when cleaned up', () => {
    const removeEventListener = jest.spyOn(window, 'removeEventListener')

    runBeforeUnloadEvent({ hasChanges: () => true })()

    expect(removeEventListener).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    )
    removeEventListener.mockRestore()
  })

  it('warns through the registered listener when the page is closed', () => {
    const listeners: ((event: BeforeUnloadEvent) => unknown)[] = []
    const addEventListener = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((_type, listener) =>
        listeners.push(listener as (event: BeforeUnloadEvent) => unknown),
      )

    runBeforeUnloadEvent({ hasChanges: () => true })
    const event = createEvent()

    expect(listeners[0](event)).toBe(unsavedChangesMessage)
    addEventListener.mockRestore()
  })
})
