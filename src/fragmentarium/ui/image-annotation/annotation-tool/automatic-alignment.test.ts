import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import Annotation, {
  AnnotationTokenType,
} from 'fragmentarium/domain/annotation'
import automaticAlignment from 'fragmentarium/ui/image-annotation/annotation-tool/automatic-alignment'

const tokens = [
  [
    AnnotationToken.initDeactive('1.', AnnotationTokenType.Disabled, [0]),
    new AnnotationToken(
      'one-one',
      AnnotationTokenType.HasSign,
      'one-one',
      [1],
      true,
    ),
    new AnnotationToken(
      'one-two',
      AnnotationTokenType.HasSign,
      'one-two',
      [2],
      true,
    ),
  ],
  [
    AnnotationToken.initDeactive('2.', AnnotationTokenType.Disabled, [3]),
    new AnnotationToken(
      'two-one',
      AnnotationTokenType.HasSign,
      'two-one',
      [4],
      true,
    ),
    new AnnotationToken(
      'two-three',
      AnnotationTokenType.HasSign,
      'two-three',
      [5],
      true,
      {
        name: 'testname-2-3',
        displayCuneiformSigns: 'testsign-2-3',
        unicode: [],
      },
    ),
    new AnnotationToken(
      'two-four',
      AnnotationTokenType.HasSign,
      'two-four',
      [6],
      true,
      {
        name: 'testname-2-4',
        displayCuneiformSigns: 'testsign-2-4',
        unicode: [],
      },
    ),
    new AnnotationToken(
      'two-five',
      AnnotationTokenType.HasSign,
      'two-five',
      [7],
      true,
      {
        name: 'testname-2-5',
        displayCuneiformSigns: 'testsign-2-5',
        unicode: [],
      },
    ),
  ],
]

const annotations = [
  new Annotation(
    { type: 'RECTANGLE', x: 0, y: 0, width: 1, height: 1 },
    {
      id: '1',
      value: 'one-one',
      type: AnnotationTokenType.HasSign,
      signName: '',
      path: [1],
    },
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 1, y: 0, width: 1, height: 1 },
    {
      id: '2',
      value: 'one-two',
      type: AnnotationTokenType.HasSign,
      signName: '',
      path: [2],
    },
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 0, y: 2, width: 1, height: 1 },
    {
      id: '3',
      value: 'two-one',
      type: AnnotationTokenType.HasSign,
      signName: 'testname-2-1',
      path: [4],
    },
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 1, y: 2, width: 1, height: 1 },
    {
      id: '4',
      value: 'two-three',
      type: AnnotationTokenType.HasSign,
      signName: 'testname-2-3',
      path: [5],
    },
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 2, y: 2, width: 5, height: 5 },
    {
      id: '5',
      value: AnnotationTokenType.Blank,
      type: AnnotationTokenType.Blank,
      signName: '',
      path: [-1],
    },
  ),
  new Annotation(
    { type: 'RECTANGLE', x: 3, y: 2, width: 1, height: 1 },
    {
      id: '6',
      value: AnnotationTokenType.Blank,
      type: AnnotationTokenType.Blank,
      signName: '',
      path: [-1],
    },
  ),
]

it('automaticAlignment', () => {
  const expected = [
    new Annotation(
      { type: 'RECTANGLE', x: 0, y: 0, width: 1, height: 1 },
      {
        id: '1',
        value: 'one-one',
        type: AnnotationTokenType.HasSign,
        signName: '',
        path: [1],
      },
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 1, y: 0, width: 1, height: 1 },
      {
        id: '2',
        value: 'one-two',
        type: AnnotationTokenType.HasSign,
        signName: '',
        path: [2],
      },
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 0, y: 2, width: 1, height: 1 },
      {
        id: '3',
        value: 'two-one',
        type: AnnotationTokenType.HasSign,
        signName: 'testname-2-1',
        path: [4],
      },
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 1, y: 2, width: 1, height: 1 },
      {
        id: '4',
        value: 'two-three',
        type: AnnotationTokenType.HasSign,
        signName: 'testname-2-3',
        path: [5],
      },
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 2, y: 2, width: 5, height: 5 },
      {
        id: '5',
        value: 'two-four',
        type: AnnotationTokenType.HasSign,
        signName: 'testname-2-4',
        path: [6],
      },
    ),
    new Annotation(
      { type: 'RECTANGLE', x: 3, y: 2, width: 1, height: 1 },
      {
        id: '6',
        value: 'two-five',
        type: AnnotationTokenType.HasSign,
        signName: 'testname-2-5',
        path: [7],
      },
    ),
  ]
  const selection = new Annotation(
    { type: 'RECTANGLE', x: 1, y: 2, width: 1, height: 1 },
    {
      id: '4',
      value: 'two-three',
      type: AnnotationTokenType.HasSign,
      signName: 'testname-2-3',
      path: [5],
    },
  )
  expect(automaticAlignment(tokens, selection, annotations)).toStrictEqual(
    expected,
  )
})
