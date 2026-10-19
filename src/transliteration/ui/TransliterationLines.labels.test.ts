import { getCurrentLabels } from 'transliteration/ui/TransliterationLines'
import { defaultLabels } from 'transliteration/domain/labels'
import { column, heading, object, surface } from 'test-support/lines/at'

test.each([
  ['object', object, { ...defaultLabels, object: object.label }],
  ['surface', surface, { ...defaultLabels, surface: surface.label }],
  ['column', column, { ...defaultLabels, column: column.label }],
  ['heading', heading, defaultLabels],
])('getCurrentLabels after a %s line', (_name, line, expected) => {
  expect(getCurrentLabels(defaultLabels, line)).toEqual(expected)
})
