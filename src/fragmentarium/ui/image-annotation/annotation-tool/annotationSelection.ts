import { uuid4 } from '@sentry/utils'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import Annotation, {
  AnnotationData,
  Geometry,
  isBoundingBoxTooSmall,
  RawAnnotation,
} from 'fragmentarium/domain/annotation'

export function findAnnotationById(
  id: string | undefined,
  annotations: readonly Annotation[],
): Annotation | null {
  return annotations.find((annotation) => annotation.data.id === id) ?? null
}

export function replaceAnnotation(
  annotations: readonly Annotation[],
  selected: Annotation,
  data: AnnotationData,
): { annotation: Annotation; annotations: readonly Annotation[] } {
  const annotation = new Annotation(selected.geometry, {
    id: selected.data.id,
    ...data,
  })
  return {
    annotation,
    annotations: [
      ...annotations.filter((other) => other.data.id !== annotation.data.id),
      annotation,
    ],
  }
}

export function createAnnotation(
  geometry: Geometry,
  data: AnnotationData,
): Annotation | null {
  return isBoundingBoxTooSmall(geometry)
    ? new Annotation(geometry, { ...data, id: uuid4() })
    : null
}

export function toAutomaticAnnotation(
  annotation: RawAnnotation,
): RawAnnotation {
  const token = AnnotationToken.blank()
  return {
    ...annotation,
    data: {
      ...annotation.data,
      value: token.value,
      type: token.type,
      path: token.path,
      signName: '',
    },
  }
}
