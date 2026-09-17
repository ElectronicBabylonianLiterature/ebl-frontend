import { Dispatch, SetStateAction } from 'react'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'

export type ZoomEvent = { state: { scale: number } }

export type FragmentAnnotationState = {
  annotation: RawAnnotation
  annotations: readonly Annotation[]
  contentScale: number
  deleteAllAnnotations: () => void
  displayCards: boolean
  error: Error | null
  generateAnnotations: () => void
  handleSelection: (annotation: RawAnnotation | Annotation) => void
  hovering: Annotation | null
  isAutomaticSelected: boolean
  isChangeExistingMode: boolean
  isDeleting: boolean
  isDisableAnnotating: boolean
  isGenerateAnnotationsLoading: boolean
  isSaving: boolean
  onChange: (annotation: RawAnnotation) => void
  onClick: () => void
  onDelete: (annotation: Annotation) => Promise<void>
  onZoom: (event: ZoomEvent) => void
  saveCurrentAnnotations: () => void
  setHovering: Dispatch<SetStateAction<Annotation | null>>
  toggleAutomaticSelection: () => void
  toggleDisplayCards: () => void
  toggled: Annotation | null
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
}
