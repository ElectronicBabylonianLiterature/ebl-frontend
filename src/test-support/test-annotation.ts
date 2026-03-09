import Annotation, {
  AnnotationTokenType,
} from 'fragmentarium/domain/annotation'

export const annotations: readonly Annotation[] = [
  new Annotation(
    { x: 100.0, y: 45.7, width: 0.02, height: 4, type: 'RECTANGLE' },
    {
      id: 'abc123',
      value: 'kur',
      type: AnnotationTokenType.HasSign,
      path: [2, 3, 0],
      signName: 'KUR',
    },
  ),
]

export const annotationsDto: readonly Record<string, unknown>[] = [
  {
    geometry: { x: 100.0, y: 45.7, width: 0.02, height: 4 },
    data: {
      id: 'abc123',
      value: 'kur',
      type: 'HasSign',
      path: [2, 3, 0],
      signName: 'KUR',
    },
  },
]
