import { toLinesDto } from 'corpus/application/toDtos'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  EditStatus,
} from 'corpus/domain/line'

const variant = createVariant({
  reconstruction: 'kur',
  intertext: 'intertext',
  manuscripts: [
    createManuscriptLine({
      manuscriptId: 1,
      labels: ['o'],
      number: '1',
      atf: 'kur',
      omittedWords: [2],
    }),
  ],
})

const expectedLineDto = {
  number: '1',
  isSecondLineOfParallelism: false,
  isBeginningOfSection: false,
  translation: '',
  variants: [
    {
      reconstruction: 'kur',
      intertext: 'intertext',
      manuscripts: [
        {
          manuscriptId: 1,
          labels: ['o'],
          number: '1',
          atf: 'kur',
          omittedWords: [2],
        },
      ],
    },
  ],
}

test('toLinesDto groups edited, deleted and new lines', () => {
  const lines = [
    createLine({ number: '1', variants: [variant], status: EditStatus.EDITED }),
    createLine({ number: '2', status: EditStatus.DELETED }),
    createLine({ number: '3', status: EditStatus.CLEAN }),
    createLine({ number: '1', variants: [variant], status: EditStatus.NEW }),
  ]

  expect(toLinesDto(lines)).toEqual({
    edited: [{ line: expectedLineDto, index: 0 }],
    deleted: [1],
    new: [expectedLineDto],
  })
})
