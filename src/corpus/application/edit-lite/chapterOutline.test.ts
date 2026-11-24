import { toLineOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'

const line: Line = createLine({
  number: '2',
  isSecondLineOfParallelism: true,
  isBeginningOfSection: true,
  translation: '#tr.en: Nor below',
  variants: [
    createVariant({
      reconstruction: '%n šapliš',
      manuscripts: [
        createManuscriptLine({ manuscriptId: 1, atf: 'šap-liš' }),
        createManuscriptLine({ manuscriptId: 33 }),
      ],
    }),
    createVariant({ reconstruction: '%n ammatu' }),
  ],
})

it('outlines a line at its position', () => {
  expect(toLineOutline(line, 4)).toEqual({
    index: 4,
    number: '2',
    isSecondLineOfParallelism: true,
    isBeginningOfSection: true,
    translation: '#tr.en: Nor below',
    variants: [
      { reconstruction: '%n šapliš', manuscriptIds: [1, 33] },
      { reconstruction: '%n ammatu', manuscriptIds: [] },
    ],
  })
})
