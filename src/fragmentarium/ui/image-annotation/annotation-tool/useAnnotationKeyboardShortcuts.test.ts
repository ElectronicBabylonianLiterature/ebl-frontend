import { act, renderHook, RenderHookResult } from '@testing-library/react'
import Annotation from 'fragmentarium/domain/annotation'
import useAnnotationKeyboardShortcuts from 'fragmentarium/ui/image-annotation/annotation-tool/useAnnotationKeyboardShortcuts'
import { annotations as annotationFixtures } from 'test-support/test-annotation'

const buttonY = 89
const buttonEscape = 27
const buttonShift = 16
const buttonUnrelated = 65

type Shortcuts = ReturnType<typeof useAnnotationKeyboardShortcuts>

const reset = jest.fn()

function setUp(
  annotations: readonly Annotation[] = [],
  savedAnnotations: readonly Annotation[] = [],
): RenderHookResult<Shortcuts, unknown> {
  return renderHook(() =>
    useAnnotationKeyboardShortcuts({
      reset,
      annotations,
      savedAnnotations,
      fragmentNumber: 'K.1',
    }),
  )
}

function press(keyCode: number, type: 'keydown' | 'keyup'): void {
  act(() => {
    document.dispatchEvent(new KeyboardEvent(type, { keyCode }))
  })
}

beforeEach(() => jest.clearAllMocks())

describe('key presses', () => {
  it('resets on escape', () => {
    setUp()

    press(buttonEscape, 'keydown')

    expect(reset).toHaveBeenCalled()
  })

  it('enters change-existing mode while Y is held', () => {
    const { result } = setUp()

    press(buttonY, 'keydown')
    expect(result.current.isChangeExistingModeButtonPressed).toBe(true)

    press(buttonY, 'keyup')
    expect(result.current.isChangeExistingModeButtonPressed).toBe(false)
  })

  it('disables annotating while shift is held', () => {
    const { result } = setUp()

    press(buttonShift, 'keydown')
    expect(result.current.isDisableAnnotating).toBe(true)

    press(buttonShift, 'keyup')
    expect(result.current.isDisableAnnotating).toBe(false)
  })

  it('ignores an unrelated key', () => {
    const { result } = setUp()

    press(buttonUnrelated, 'keydown')
    press(buttonUnrelated, 'keyup')

    expect(reset).not.toHaveBeenCalled()
    expect(result.current.isChangeExistingModeButtonPressed).toBe(false)
    expect(result.current.isDisableAnnotating).toBe(false)
  })

  it('stops listening once unmounted', () => {
    const { unmount } = setUp()
    unmount()

    press(buttonEscape, 'keydown')

    expect(reset).not.toHaveBeenCalled()
  })
})

describe('leaving the page', () => {
  function dispatchBeforeUnload(): boolean {
    const event = new Event('beforeunload', { cancelable: true })
    act(() => {
      window.dispatchEvent(event)
    })
    return event.defaultPrevented
  }

  it('blocks leaving while there are unsaved annotations', () => {
    setUp(annotationFixtures, [])

    expect(dispatchBeforeUnload()).toBe(true)
  })

  it('allows leaving once every annotation is saved', () => {
    const annotations = annotationFixtures
    setUp(annotations, annotations)

    expect(dispatchBeforeUnload()).toBe(false)
  })
})
