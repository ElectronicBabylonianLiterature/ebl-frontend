import { AnnotationToken } from './annotation-token'
import Annotation from 'fragmentarium/domain/annotation'

test.each([
  [
    new AnnotationToken('kur', [2, 0, 1], true),
    new Annotation(
      {
        x: 1,
        y: 1,
        height: 1,
        width: 1,
        type: 'RECTANGLE',
      },
      {
        value: 'ruk',
        path: [2, 0, 1],
      }
    ),
    true,
  ],
  [
    new AnnotationToken('kur', [2, 0, 1], true),
    new Annotation(
      {
        x: 1,
        y: 1,
        height: 1,
        width: 1,
        type: 'RECTANGLE',
      },
      {
        value: 'ruk',
        path: [2, 0, 4],
      }
    ),
    false,
  ],
  [
    new AnnotationToken('kur', [2, 0, 1], true),
    {
      geometry: {
        x: 1,
        y: 1,
        height: 1,
        width: 1,
        type: 'RECTANGLE',
      },
      data: {
        value: 'ruk',
        path: [2, 0, 1],
      },
    },
    true,
  ],
  [
    new AnnotationToken('kur', [2, 0, 1], true),
    {
      geometry: {
        x: 1,
        y: 1,
        height: 1,
        width: 1,
        type: 'RECTANGLE',
      },
      data: {
        value: 'ruk',
        path: [2, 0, 4],
      },
    },
    false,
  ],
  [new AnnotationToken('kur', [2, 0, 1], true), {}, false],
])('hasMatchingPath %#', (token, annotation, expected) => {
  expect(token.hasMatchingPath(annotation)).toEqual(expected)
})
