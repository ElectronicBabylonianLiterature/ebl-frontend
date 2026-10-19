import { act } from '@testing-library/react'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import { FragmentAnnotationState } from 'fragmentarium/ui/image-annotation/annotation-tool/fragmentAnnotationStateTypes'
import {
  largeGeometry,
  resetAnnotationState,
  setUp,
} from 'fragmentarium/ui/image-annotation/annotation-tool/useFragmentAnnotationState.testSupport'
import { annotations as existingAnnotations } from 'test-support/test-annotation'

beforeEach(resetAnnotationState)

describe('change-existing mode', () => {
  const buttonY = 89

  function holdChangeExistingKey(): void {
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: buttonY }))
    })
  }

  function enterChangeExistingMode(
    result: { current: FragmentAnnotationState },
    hovering: Annotation | null = null,
  ): void {
    holdChangeExistingKey()
    act(() => result.current.setHovering(hovering))
    act(() => result.current.onClick())
  }

  it('clicking while the key is held toggles the hovered annotation', () => {
    const { result } = setUp()
    const hovered = existingAnnotations[0]

    enterChangeExistingMode(result, hovered)

    expect(result.current.isChangeExistingMode).toBe(true)
    expect(result.current.toggled).toBe(hovered)
  })

  it('drawing a new selection while in the mode leaves it', () => {
    const { result } = setUp()

    enterChangeExistingMode(result)
    act(() =>
      result.current.onChange({
        selection: { mode: 'SELECTING' },
      } as RawAnnotation),
    )

    expect(result.current.isChangeExistingMode).toBe(false)
    expect(result.current.toggled).toBeNull()
  })

  it('aligns the remaining annotations automatically when both modes are on', () => {
    const { result } = setUp()
    const existing = existingAnnotations[0]

    act(() => result.current.toggleAutomaticSelection())
    enterChangeExistingMode(result, existing)
    act(() =>
      result.current.handleSelection({
        data: { ...existing.data, value: 'aligned' },
      } as RawAnnotation),
    )

    expect(result.current.annotations).toHaveLength(1)
    expect(result.current.isChangeExistingMode).toBe(false)
  })
})

it('clicking with automatic selection on annotates the drawn box', () => {
  const { result } = setUp([])

  act(() => result.current.toggleAutomaticSelection())
  act(() =>
    result.current.onChange({
      selection: { mode: 'EDITING' },
      geometry: largeGeometry,
    } as RawAnnotation),
  )
  act(() => result.current.onClick())

  expect(result.current.annotations).toHaveLength(1)
  expect(result.current.annotations[0].data.value).toBe(
    AnnotationToken.blank().value,
  )
})
