import { renderHook, RenderHookResult } from '@testing-library/react'
import Annotation from 'fragmentarium/domain/annotation'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import useFragmentAnnotationState from 'fragmentarium/ui/image-annotation/annotation-tool/useFragmentAnnotationState'
import { FragmentAnnotationState } from 'fragmentarium/ui/image-annotation/annotation-tool/fragmentAnnotationStateTypes'
import { annotations as existingAnnotations } from 'test-support/test-annotation'

export const largeGeometry = {
  x: 1,
  y: 1,
  width: 2,
  height: 2,
  type: 'RECTANGLE',
}
export const tinyGeometry = {
  x: 1,
  y: 1,
  width: 0.1,
  height: 0.1,
  type: 'RECTANGLE',
}

const fragment = { number: 'K.1' } as Fragment
const tokens = [[AnnotationToken.blank()]]

export const fragmentService = {
  updateAnnotations: jest.fn(),
  generateAnnotations: jest.fn(),
} as unknown as jest.Mocked<FragmentService>

export function setUp(
  initialAnnotations: readonly Annotation[] = existingAnnotations,
): RenderHookResult<FragmentAnnotationState, unknown> {
  return renderHook(() =>
    useFragmentAnnotationState({
      tokens,
      fragment,
      initialAnnotations,
      fragmentService,
    }),
  )
}

export function resetAnnotationState(): void {
  jest.clearAllMocks()
  fragmentService.updateAnnotations.mockResolvedValue(undefined as never)
  fragmentService.generateAnnotations.mockResolvedValue([] as never)
}
