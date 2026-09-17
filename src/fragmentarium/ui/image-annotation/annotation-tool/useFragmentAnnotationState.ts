import { useCallback, useState } from 'react'
import { uuid4 } from '@sentry/utils'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import Annotation, {
  isBoundingBoxTooSmall,
  RawAnnotation,
} from 'fragmentarium/domain/annotation'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import automaticAlignment from 'fragmentarium/ui/image-annotation/annotation-tool/automatic-alignment'
import initializeAnnotations from 'fragmentarium/ui/image-annotation/annotation-tool/initializeAnnotations'
import useAnnotationKeyboardShortcuts from 'fragmentarium/ui/image-annotation/annotation-tool/useAnnotationKeyboardShortcuts'
import {
  FragmentAnnotationState,
  ZoomEvent,
} from 'fragmentarium/ui/image-annotation/annotation-tool/fragmentAnnotationStateTypes'

function getSelectionById(
  id: string | undefined,
  annotations: readonly Annotation[],
): Annotation | null {
  const toggledAnnotation = annotations.filter(
    (annotation) => annotation.data.id === id,
  )[0]
  if (toggledAnnotation) {
    return toggledAnnotation
  } else {
    return null
  }
}

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
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGenerateAnnotationsLoading, setIsGenerateAnnotationsLoading] =
    useState(false)
  const [error, setError] = useState<Error | null>(null)
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

  const saveAnnotations = async (
    updatedAnnotations: readonly Annotation[],
  ): Promise<void> => {
    setAnnotations(updatedAnnotations)
    return fragmentService
      .updateAnnotations(fragment.number, updatedAnnotations)
      .then(() => setSavedAnnotations(updatedAnnotations))
      .catch(setError)
  }

  const onDelete = async (annotation: Annotation): Promise<void> => {
    const updatedAnnotations = annotations.filter(
      (other: Annotation) => annotation.data.id !== other.data.id,
    )
    return saveAnnotations(updatedAnnotations)
  }

  const onChange = (annotation: RawAnnotation): void => {
    if (isChangeExistingMode && annotation.selection && !hovering) {
      setToggled(null)
      setIsChangeExistingMode(false)
    }
    setAnnotation(annotation)
  }

  const handleSelection = (annotation: RawAnnotation | Annotation): void => {
    const { geometry, data } = annotation
    if (data) {
      const selectedAnnotation = getSelectionById(data.id, annotations)
      if (selectedAnnotation) {
        const newAnnotation = new Annotation(selectedAnnotation.geometry, {
          id: selectedAnnotation.data.id,
          ...data,
        })
        setAnnotation({})
        const newAnnotations = [
          ...annotations.filter(
            (annotation) => annotation.data.id !== newAnnotation.data.id,
          ),
          newAnnotation,
        ]
        setAnnotations(newAnnotations)
        if (isAutomaticSelected && isChangeExistingMode) {
          setAnnotations(
            automaticAlignment(tokens, newAnnotation, newAnnotations),
          )
        }
        setToggled(null)
        setIsChangeExistingMode(false)
      } else if (geometry) {
        if (isBoundingBoxTooSmall(geometry)) {
          const newAnnotation = new Annotation(geometry, {
            ...data,
            id: uuid4(),
          })
          setAnnotation({})
          setAnnotations([...annotations, newAnnotation])
        }
      }
    }
  }

  const onZoom = (event: ZoomEvent): void => {
    setContentScale(1 / event.state.scale)
  }

  const onClick = (): void => {
    if (isChangeExistingModeButtonPressed) {
      setToggled(hovering)
      setIsChangeExistingMode(true)
    }
    if (isAutomaticSelected && annotation.selection && annotation.geometry) {
      const token = AnnotationToken.blank()
      const automaticAnnotation = {
        ...annotation,
        data: {
          ...annotation.data,
          value: token.value,
          type: token.type,
          path: token.path,
          signName: '',
        },
      }
      handleSelection(automaticAnnotation)
    }
  }

  const generateAnnotations = (): void => {
    setIsGenerateAnnotationsLoading(true)
    fragmentService
      .generateAnnotations(fragment.number)
      .then((generatedAnnotations) =>
        setAnnotations([...annotations, ...generatedAnnotations]),
      )
      .catch(setError)
      .finally(() => setIsGenerateAnnotationsLoading(false))
  }

  const deleteAllAnnotations = (): void => {
    const confirmation = window.confirm('Sure you want to delete everything ?')
    if (confirmation) {
      setIsDeleting(true)
      saveAnnotations([])
        .then(() => reset())
        .finally(() => setIsDeleting(false))
    }
  }

  const saveCurrentAnnotations = (): void => {
    setIsSaving(true)
    saveAnnotations(annotations).finally(() => setIsSaving(false))
  }

  return {
    annotation,
    annotations,
    contentScale,
    deleteAllAnnotations,
    displayCards,
    error,
    generateAnnotations,
    handleSelection,
    hovering,
    isAutomaticSelected,
    isChangeExistingMode,
    isDeleting,
    isDisableAnnotating,
    isGenerateAnnotationsLoading,
    isSaving,
    onChange,
    onClick,
    onDelete,
    onZoom,
    saveCurrentAnnotations,
    setHovering,
    toggleAutomaticSelection: () =>
      setIsAutomaticSelected(!isAutomaticSelected),
    toggleDisplayCards: () => setDisplayCards(!displayCards),
    toggled,
    tokens,
  }
}
