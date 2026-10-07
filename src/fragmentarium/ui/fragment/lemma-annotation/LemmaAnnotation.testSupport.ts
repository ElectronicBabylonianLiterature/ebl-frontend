import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { lineNumberFactory } from 'test-support/linenumber-factory'
import { kurToken, raToken } from 'test-support/test-tokens'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { AkkadianWord } from 'transliteration/domain/token'
import { wordFactory } from 'test-support/word-fixtures'

export const mockWord = wordFactory.build({
  _id: 'mockLemma',
  lemma: ['mockLemma'],
  homonym: 'I',
})

export const brokenKurToken = {
  ...kurToken,
  value: 'ku[r',
  parts: [
    {
      value: 'ku[r',
      cleanValue: 'kur',
      enclosureType: [],
      erasure: 'NONE',
      type: 'ValueToken',
    },
  ],
} as AkkadianWord

export const text = new Text({
  lines: [
    new TextLine({
      type: 'TextLine',
      lineNumber: lineNumberFactory.build({ number: 1 }),
      prefix: '',
      content: [raToken, kurToken],
    }),
    new TextLine({
      type: 'TextLine',
      lineNumber: lineNumberFactory.build({ number: 1 }),
      prefix: '',
      content: [brokenKurToken],
    }),
  ],
})

export function createEditableTokens(): EditableToken[] {
  return [
    new EditableToken(raToken, 0, 0, 0, []),
    new EditableToken(kurToken, 1, 1, 0, []),
    new EditableToken(brokenKurToken, 2, 0, 1, []),
  ]
}
