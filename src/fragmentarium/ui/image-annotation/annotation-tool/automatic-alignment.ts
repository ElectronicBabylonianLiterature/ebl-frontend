import Annotation, { Geometry } from 'fragmentarium/domain/annotation'
import _ from 'lodash'

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
  annotations: readonly Annotation[]
): Annotation[] {
  return annotations.filter((annotation) => {
    const isHeightInRange =
      annotation.geometry.y < point.y &&
      point.y < annotation.geometry.y + annotation.geometry.height
    const isNeighbouring = point.x < annotation.geometry.x
    if (isHeightInRange && isNeighbouring) {
      return annotation
    }
  })
}

export default function automaticAlignment(
  tokens,
  annotation: Annotation,
  annotations: readonly Annotation[]
): readonly Annotation[] {
  const enabledTokens = tokens.map((tokensFirst) =>
    tokensFirst.filter((tokenSecond) => tokenSecond.enabled)
  )

  let indexes
  const neighbouringTokens: any[] = []
  for (let rowIndex = 0; rowIndex < enabledTokens.length; rowIndex++) {
    let isAnnotationFound = false
    for (
      let columnIndex = 0;
      columnIndex < enabledTokens[rowIndex].length;
      columnIndex++
    ) {
      if (isAnnotationFound) {
        neighbouringTokens.push(enabledTokens[rowIndex][columnIndex])
      }
      if (
        _.isEqual(
          annotation.data.path,
          enabledTokens[rowIndex][columnIndex].path
        )
      ) {
        indexes = [rowIndex, columnIndex]
        isAnnotationFound = true
      }
    }
    if (isAnnotationFound) {
      break
    }
  }
  console.log(indexes)

  const neighbouringAnnotations = getNeighbouringAnnotations(
    getCenterPoint(annotation.geometry),
    annotations
  )

  const mergedAnnotations = neighbouringAnnotations
    .filter((annotation, index) => index < neighbouringTokens.length)
    .map((annotation, index) => {
      const token = neighbouringTokens[index]
      return new Annotation(annotation.geometry, {
        id: annotation.data.id,
        value: token.value,
        path: token.path,
        signName: '',
      })
    })
  let filteredAnnotations = annotations
  for (const mergedAnnotation of mergedAnnotations) {
    filteredAnnotations = filteredAnnotations.filter(
      (annotation) => annotation.data.id !== mergedAnnotation.data.id
    )
  }

  return [...filteredAnnotations, ...mergedAnnotations]
}
