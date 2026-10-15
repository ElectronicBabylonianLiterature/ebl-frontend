import { Dispatch, SetStateAction, useRef, useState } from 'react'
import Annotation from 'fragmentarium/domain/annotation'
import SerialQueue from 'common/utils/SerialQueue'
import {
  AnnotationFragmentService,
  AnnotationPersistence,
} from 'fragmentarium/ui/image-annotation/annotation-tool/fragmentAnnotationStateTypes'

export default function useAnnotationPersistence({
  fragmentService,
  fragmentNumber,
  annotations,
  setAnnotations,
  setSavedAnnotations,
  reset,
}: {
  fragmentService: AnnotationFragmentService
  fragmentNumber: string
  annotations: readonly Annotation[]
  setAnnotations: Dispatch<SetStateAction<readonly Annotation[]>>
  setSavedAnnotations: (annotations: readonly Annotation[]) => void
  reset: () => void
}): AnnotationPersistence {
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pendingWrites, setPendingWrites] = useState(0)
  const [isGenerateAnnotationsLoading, setIsGenerateAnnotationsLoading] =
    useState(false)
  const [error, setError] = useState<Error | null>(null)
  const writeQueue = useRef(new SerialQueue())

  const saveAnnotations = (
    updatedAnnotations: readonly Annotation[],
  ): Promise<boolean> => {
    setAnnotations(updatedAnnotations)
    setError(null)
    setPendingWrites((count) => count + 1)
    return writeQueue.current
      .enqueue(() =>
        fragmentService.updateAnnotations(fragmentNumber, updatedAnnotations),
      )
      .then(
        () => {
          setSavedAnnotations(updatedAnnotations)
          return true
        },
        (saveError: Error) => {
          setError(saveError)
          return false
        },
      )
      .finally(() => setPendingWrites((count) => count - 1))
  }

  return {
    error,
    isDeleting,
    isGenerateAnnotationsLoading,
    isSaving,
    isWriting: pendingWrites > 0,
    onDelete: (annotation: Annotation): Promise<void> =>
      saveAnnotations(
        annotations.filter((other) => annotation.data.id !== other.data.id),
      ).then(() => undefined),
    saveCurrentAnnotations: (): void => {
      setIsSaving(true)
      saveAnnotations(annotations).finally(() => setIsSaving(false))
    },
    deleteAllAnnotations: (): void => {
      if (window.confirm('Sure you want to delete everything ?')) {
        setIsDeleting(true)
        saveAnnotations([])
          .then((isSaved) => isSaved && reset())
          .finally(() => setIsDeleting(false))
      }
    },
    generateAnnotations: (): void => {
      setIsGenerateAnnotationsLoading(true)
      fragmentService
        .generateAnnotations(fragmentNumber)
        .then((generated) =>
          setAnnotations((current) => [...current, ...generated]),
        )
        .catch(setError)
        .finally(() => setIsGenerateAnnotationsLoading(false))
    },
  }
}
