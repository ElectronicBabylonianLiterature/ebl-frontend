import _ from 'lodash'
import { produce } from 'immer'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import Annotation from 'fragmentarium/domain/annotation'

export default function initializeAnnotations(
  initialAnnotations: readonly Annotation[],
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>,
): readonly Annotation[] {
  const flatTokens = tokens.flat()
  return initialAnnotations.map((annotation) => {
    const token = flatTokens.find(
      (flatToken) =>
        _.isEqual(flatToken.path, annotation.data.path) &&
        flatToken.value === annotation.data.value,
    )
    return token
      ? annotation
      : produce(annotation, (draft) => {
          ;(draft as Annotation & { outdated: boolean }).outdated = true
        })
  })
}
