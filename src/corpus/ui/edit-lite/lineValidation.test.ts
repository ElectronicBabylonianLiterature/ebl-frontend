import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'
import { editLiteManuscripts } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  findLineProblem,
  missingSiglumMessage,
  missingVariantMessage,
} from 'corpus/ui/edit-lite/lineValidation'

function lineWith(...manuscriptIds: readonly number[]): Line {
  return createLine({
    number: '1',
    variants: [
      createVariant({ reconstruction: 'kur' }),
      createVariant({
        manuscripts: manuscriptIds.map((manuscriptId) =>
          createManuscriptLine({ manuscriptId }),
        ),
      }),
    ],
  })
}

test('says in plain words what is missing', () => {
  expect(missingSiglumMessage).toBe(
    'Choose a siglum for every manuscript line before saving.',
  )
  expect(missingVariantMessage).toBe(
    'A line needs at least one variant before it can be saved.',
  )
})

test.each<[string, Line, string | null]>([
  ['has no manuscript lines', lineWith(), null],
  ['uses manuscripts of the chapter', lineWith(1, 2), null],
  [
    'has a manuscript line without a siglum',
    lineWith(1, 0),
    missingSiglumMessage,
  ],
  [
    'uses a manuscript the chapter does not have',
    lineWith(99),
    missingSiglumMessage,
  ],
  ['has no variant', createLine({ number: '1' }), missingVariantMessage],
])('a line that %s', (_name, line, problem) => {
  expect(findLineProblem(line, editLiteManuscripts)).toBe(problem)
})
