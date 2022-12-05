import { column, object, surface } from 'test-support/lines/at'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import WordService from 'dictionary/application/WordService'
import { Text } from 'transliteration/domain/text'
import GlossaryFactory from './GlossaryFactory'
import {
  createDictionaryWord,
  createGlossaryToken,
} from 'test-support/glossary'
import Label from 'transliteration/domain/Label'
import { Word as WordToken } from 'transliteration/domain/token'
import Word from 'dictionary/domain/Word'
import Promise from 'bluebird'

jest.mock('dictionary/application/WordService')

test('create glossary', async () => {
  const [firstLine, secondLine] = lemmatized
  const hepuI: Word = await createDictionaryWord('hepû I')
  const hepuII: Word = await createDictionaryWord('hepû II')

  const expected = [
    [
      'hepû I',
      [
        createGlossaryToken(
          new Label().setLineNumber(firstLine.lineNumber),
          firstLine.content[0] as WordToken,
          0,
          hepuI
        ),
        createGlossaryToken(
          new Label(
            object.label,
            surface.label,
            column.label,
            secondLine.lineNumber
          ),
          secondLine.content[0] as WordToken,
          0,
          hepuI
        ),
      ],
    ],
    [
      'hepû II',
      [
        createGlossaryToken(
          new Label().setLineNumber(firstLine.lineNumber),
          firstLine.content[0] as WordToken,
          1,
          hepuII
        ),
      ],
    ],
  ]

  const text = new Text({
    lines: [firstLine, object, surface, column, secondLine],
  })

  const wordServiceMock = new (WordService as jest.Mock<
    jest.Mocked<WordService>
  >)()
  jest
    .spyOn(wordServiceMock, 'findAll')
    .mockImplementation(() => Promise.resolve([hepuI, hepuII]))
  const glossaryFactory = new GlossaryFactory(wordServiceMock)
  await expect(glossaryFactory.createGlossary(text)).resolves.toEqual(expected)
})
