import { AnnotationToken } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import Annotation from 'fragmentarium/domain/annotation'
import automaticAlignment from 'fragmentarium/ui/image-annotation/annotation-tool/automatic-alignment'

const tokens = [
  [
    AnnotationToken.disabled('1.', [0]),
    new AnnotationToken('one-one', 'Reading', 'one-one', [1], true),
    new AnnotationToken('one-two', 'Reading', 'one-two', [2], true),
  ],
  [
    AnnotationToken.disabled('2.', [3]),
    new AnnotationToken('two-one', 'Reading', 'two-one', [4], true),
    new AnnotationToken('two-three', 'Reading', 'two-three', [5], true),
    new AnnotationToken('two-four', 'Reading', 'two-four', [6], true),
    new AnnotationToken('two-five', 'Reading', 'two-five', [7], true),
  ],
]

const annotations = [
  new Annotation(
    { type: 'RECTANGLE', x: 0, y: 0, width: 1, height: 1 },
    { id: '1', value: 'one-one', type: 'Reading', signName: '', path: [1] }
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 1, y: 0, width: 1, height: 1 },
    { id: '2', value: 'one-two', type: 'Reading', signName: '', path: [2] }
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 0, y: 2, width: 1, height: 1 },
    { id: '3', value: 'two-one', type: 'Reading', signName: '', path: [4] }
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 1, y: 2, width: 1, height: 1 },
    { id: '4', value: 'two-three', type: 'Reading', signName: '', path: [5] }
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 2, y: 2, width: 5, height: 5 },
    { id: '5', value: 'blank', type: 'Blank', signName: '', path: [-1] }
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 3, y: 2, width: 1, height: 1 },
    { id: '6', value: 'blank', type: 'Blank', signName: '', path: [-1] }
  ),
]

it('automaticAlignment', () => {
  const expected = [
    new Annotation(
      { type: 'RECTANGLE', x: 0, y: 0, width: 1, height: 1 },
      { id: '1', value: 'one-one', type: 'Reading', signName: '', path: [1] }
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 1, y: 0, width: 1, height: 1 },
      { id: '2', value: 'one-two', type: 'Reading', signName: '', path: [2] }
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 0, y: 2, width: 1, height: 1 },
      { id: '3', value: 'two-one', type: 'Reading', signName: '', path: [4] }
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 1, y: 2, width: 1, height: 1 },
      { id: '4', value: 'two-three', type: 'Reading', signName: '', path: [5] }
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 2, y: 2, width: 5, height: 5 },
      { id: '5', value: 'two-four', type: 'Reading', signName: '', path: [6] }
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 3, y: 2, width: 1, height: 1 },
      { id: '6', value: 'two-five', type: 'Reading', signName: '', path: [7] }
    ),
  ]
  const selection = new Annotation(
    { type: 'RECTANGLE', x: 1, y: 2, width: 1, height: 1 },
    { id: '4', value: 'two-three', type: 'Reading', signName: '', path: [5] }
  )
  expect(automaticAlignment(tokens, selection, annotations)).toStrictEqual(
    expected
  )
})
