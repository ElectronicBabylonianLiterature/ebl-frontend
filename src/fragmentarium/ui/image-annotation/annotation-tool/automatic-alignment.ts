import Annotation, { Geometry } from 'fragmentarium/domain/annotation'
import _ from 'lodash'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'

interface Point {
  x: number
  y: number
}

function getCenterPoint(geometry: Geometry): Point {
  return {
    x: geometry.x + geometry.width / 2,
    y: geometry.y + geometry.height / 2,
  }
}

function getNeighbouringAnnotations(
  point: Point,
  annotations: readonly Annotation[],
): Annotation[] {
  return annotations.filter((annotation) => {
    const isHeightInRange =
      annotation.geometry.y < point.y &&
      point.y < annotation.geometry.y + annotation.geometry.height
    const isNeighbouring = point.x < annotation.geometry.x
    return isHeightInRange && isNeighbouring
  })
}

export default function automaticAlignment(
  tokens: readonly (readonly AnnotationToken[])[],
  annotation: Annotation,
  annotations: readonly Annotation[],
): readonly Annotation[] {
  const enabledTokens = tokens.map((tokensRow) =>
    tokensRow.filter((tokenSecond) => tokenSecond.enabled),
  )

  const neighbouringTokens: AnnotationToken[] = []

  for (const row of enabledTokens) {
    let isAnnotationFound = false
    for (const columnElement of row) {
      if (isAnnotationFound) {
        neighbouringTokens.push(columnElement)
      } else if (_.isEqual(annotation.data.path, columnElement.path)) {
        isAnnotationFound = true
      }
    }
    if (isAnnotationFound) {
      break
    }
  }
  const neighbouringAnnotations = getNeighbouringAnnotations(
    getCenterPoint(annotation.geometry),
    annotations,
  )

  const mergedAnnotations = neighbouringAnnotations
    .filter((annotation, index) => index < neighbouringTokens.length)
    .map((annotation, index) => {
      const token = neighbouringTokens[index]
      return new Annotation(annotation.geometry, {
        id: annotation.data.id,
        value: token.value,
        type: token.type,
        path: token.path,
        signName: token.sign?.name || '',
      })
    })

  let filteredAnnotations = annotations
  for (const mergedAnnotation of mergedAnnotations) {
    filteredAnnotations = filteredAnnotations.filter(
      (annotation) => annotation.data.id !== mergedAnnotation.data.id,
    )
  }
  return [...filteredAnnotations, ...mergedAnnotations]
}
