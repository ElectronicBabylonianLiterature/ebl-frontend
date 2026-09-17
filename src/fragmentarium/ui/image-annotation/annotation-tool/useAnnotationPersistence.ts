import { useState } from 'react'
import Annotation from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import { AnnotationPersistence } from 'fragmentarium/ui/image-annotation/annotation-tool/fragmentAnnotationStateTypes'

export default function useAnnotationPersistence({
  fragmentService,
  fragmentNumber,
  annotations,
  setAnnotations,
  setSavedAnnotations,
  reset,
}: {
  fragmentService: FragmentService
  fragmentNumber: string
  annotations: readonly Annotation[]
  setAnnotations: (annotations: readonly Annotation[]) => void
  setSavedAnnotations: (annotations: readonly Annotation[]) => void
  reset: () => void
}): AnnotationPersistence {
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGenerateAnnotationsLoading, setIsGenerateAnnotationsLoading] =
    useState(false)
  const [error, setError] = useState<Error | null>(null)

  const saveAnnotations = async (
    updatedAnnotations: readonly Annotation[],
  ): Promise<void> => {
    setAnnotations(updatedAnnotations)
    return fragmentService
      .updateAnnotations(fragmentNumber, updatedAnnotations)
      .then(() => setSavedAnnotations(updatedAnnotations))
      .catch(setError)
  }

  return {
    error,
    isDeleting,
    isGenerateAnnotationsLoading,
    isSaving,
    onDelete: (annotation: Annotation): Promise<void> =>
      saveAnnotations(
        annotations.filter((other) => annotation.data.id !== other.data.id),
      ),
    saveCurrentAnnotations: (): void => {
      setIsSaving(true)
      saveAnnotations(annotations).finally(() => setIsSaving(false))
    },
    deleteAllAnnotations: (): void => {
      if (window.confirm('Sure you want to delete everything ?')) {
        setIsDeleting(true)
        saveAnnotations([])
          .then(reset)
          .finally(() => setIsDeleting(false))
      }
    },
    generateAnnotations: (): void => {
      setIsGenerateAnnotationsLoading(true)
      fragmentService
        .generateAnnotations(fragmentNumber)
        .then((generated) => setAnnotations([...annotations, ...generated]))
        .catch(setError)
        .finally(() => setIsGenerateAnnotationsLoading(false))
    },
  }
}
