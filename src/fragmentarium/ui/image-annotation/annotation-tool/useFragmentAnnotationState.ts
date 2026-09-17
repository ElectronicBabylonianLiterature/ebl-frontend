import { useCallback, useState } from 'react'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import automaticAlignment from 'fragmentarium/ui/image-annotation/annotation-tool/automatic-alignment'
import initializeAnnotations from 'fragmentarium/ui/image-annotation/annotation-tool/initializeAnnotations'
import useAnnotationKeyboardShortcuts from 'fragmentarium/ui/image-annotation/annotation-tool/useAnnotationKeyboardShortcuts'
import useAnnotationPersistence from 'fragmentarium/ui/image-annotation/annotation-tool/useAnnotationPersistence'
import {
  createAnnotation,
  findAnnotationById,
  replaceAnnotation,
  toAutomaticAnnotation,
} from 'fragmentarium/ui/image-annotation/annotation-tool/annotationSelection'
import {
  FragmentAnnotationState,
  ZoomEvent,
} from 'fragmentarium/ui/image-annotation/annotation-tool/fragmentAnnotationStateTypes'

export default function useFragmentAnnotationState({
  tokens,
  fragment,
  initialAnnotations,
  fragmentService,
}: {
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  fragment: Fragment
  initialAnnotations: readonly Annotation[]
  fragmentService: FragmentService
}): FragmentAnnotationState {
  const [isChangeExistingMode, setIsChangeExistingMode] = useState(false)
  const [isAutomaticSelected, setIsAutomaticSelected] = useState(false)
  const [displayCards, setDisplayCards] = useState(false)
  const [contentScale, setContentScale] = useState(0.3)
  const [toggled, setToggled] = useState<Annotation | null>(null)
  const [hovering, setHovering] = useState<Annotation | null>(null)
  const [annotation, setAnnotation] = useState<RawAnnotation>({})
  const [annotations, setAnnotations] = useState<readonly Annotation[]>(
    initializeAnnotations(initialAnnotations, tokens),
  )
  const [savedAnnotations, setSavedAnnotations] = useState(annotations)

  const reset = useCallback((): void => {
    setToggled(null)
    setIsChangeExistingMode(false)
    setIsAutomaticSelected(false)
    setAnnotation({})
  }, [])

  const { isChangeExistingModeButtonPressed, isDisableAnnotating } =
    useAnnotationKeyboardShortcuts({
      reset,
      annotations,
      savedAnnotations,
      fragmentNumber: fragment.number,
    })

  const persistence = useAnnotationPersistence({
    fragmentService,
    fragmentNumber: fragment.number,
    annotations,
    setAnnotations,
    setSavedAnnotations,
    reset,
  })

  const leaveChangeExistingMode = (): void => {
    setToggled(null)
    setIsChangeExistingMode(false)
  }

  const onChange = (updated: RawAnnotation): void => {
    if (isChangeExistingMode && updated.selection && !hovering) {
      leaveChangeExistingMode()
    }
    setAnnotation(updated)
  }

  const selectExisting = (
    selected: Annotation,
    data: NonNullable<RawAnnotation['data']>,
  ): void => {
    const replaced = replaceAnnotation(annotations, selected, data)
    setAnnotation({})
    setAnnotations(
      isAutomaticSelected && isChangeExistingMode
        ? automaticAlignment(tokens, replaced.annotation, replaced.annotations)
        : replaced.annotations,
    )
    leaveChangeExistingMode()
  }

  const handleSelection = (selection: RawAnnotation | Annotation): void => {
    const { geometry, data } = selection
    if (!data) {
      return
    }
    const selected = findAnnotationById(data.id, annotations)
    if (selected) {
      return selectExisting(selected, data)
    }
    const created = geometry ? createAnnotation(geometry, data) : null
    if (created) {
      setAnnotation({})
      setAnnotations([...annotations, created])
    }
  }

  const onClick = (): void => {
    if (isChangeExistingModeButtonPressed) {
      setToggled(hovering)
      setIsChangeExistingMode(true)
    }
    if (isAutomaticSelected && annotation.selection && annotation.geometry) {
      handleSelection(toAutomaticAnnotation(annotation))
    }
  }

  return {
    ...persistence,
    annotation,
    annotations,
    contentScale,
    displayCards,
    handleSelection,
    hovering,
    isAutomaticSelected,
    isChangeExistingMode,
    isDisableAnnotating,
    onChange,
    onClick,
    onZoom: (event: ZoomEvent): void => setContentScale(1 / event.state.scale),
    setHovering,
    toggleAutomaticSelection: (): void =>
      setIsAutomaticSelected(!isAutomaticSelected),
    toggleDisplayCards: (): void => setDisplayCards(!displayCards),
    toggled,
    tokens,
  }
}
