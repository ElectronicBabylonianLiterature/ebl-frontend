import { Fragment } from 'fragmentarium/domain/fragment'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'

export interface AnnotationSaveResult {
  readonly fragment: Fragment
  readonly refreshError: Error | null
}

export type UpdateNamedEntityAnnotations = (
  annotations: AnnotationSpans,
) => Promise<AnnotationSaveResult>

export const refreshFailedMessage =
  'The annotations were saved, but the fragment could not be refreshed. ' +
  'Reload the page to see the up-to-date fragment.'
