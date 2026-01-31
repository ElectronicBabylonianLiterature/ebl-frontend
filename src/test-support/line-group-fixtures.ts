import { LineGroup, LineInfo } from 'transliteration/ui/LineGroup'
import TextService from 'corpus/application/TextService'
import { Token } from 'transliteration/domain/token'

export const lemmatizableToken: Token = {
  value: 'ušrāti',
  cleanValue: 'ušrāti',
  enclosureType: [],
  erasure: 'NONE',
  parts: [
    {
      value: 'ušrāti',
      cleanValue: 'ušrāti',
      enclosureType: [],
      erasure: 'NONE',
      type: 'ValueToken',
    },
  ],
  language: 'AKKADIAN',
  normalized: true,
  lemmatizable: true,
  alignable: true,
  uniqueLemma: ['ušurtu I'],
  alignment: null,
  variant: null,
  hasVariantAlignment: true,
  hasOmittedAlignment: true,
  type: 'AkkadianWord',
  modifiers: [],
}

export const alignedManuscriptToken: Token = {
  value: 'uš-ra-a-tu₂',
  cleanValue: 'uš-ra-a-tu₂',
  enclosureType: [],
  erasure: 'NONE',
  variant: null,
  parts: [
    {
      value: 'uš',
      cleanValue: 'uš',
      enclosureType: [],
      erasure: 'NONE',
      name: 'uš',
      nameParts: [
        {
          value: 'testlemma',
          cleanValue: 'uš',
          enclosureType: [],
          erasure: 'NONE',
          type: 'ValueToken',
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      sign: null,
      type: 'Reading',
    },
  ],
  language: 'AKKADIAN',
  normalized: false,
  lemmatizable: true,
  alignable: true,
  uniqueLemma: ['ušurtu I'],
  alignment: 1,
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
  type: 'Word',
}

jest.mock('corpus/application/TextService')

const MockTextService = TextService as jest.Mock<jest.Mocked<TextService>>
const textServiceMock = new MockTextService()

export const lineInfo: LineInfo = {
  chapterId: {
    textId: { genre: '', category: 0, index: 0 },
    stage: '',
    name: '',
  },
  lineNumber: 0,
  variantNumber: 0,
  textService: textServiceMock,
}

export const highlightIndexSetterMock = jest.fn()

export const lineGroup = new LineGroup(
  [lemmatizableToken],
  lineInfo,
  highlightIndexSetterMock,
)
