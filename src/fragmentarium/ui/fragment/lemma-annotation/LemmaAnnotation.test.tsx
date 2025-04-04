import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { Text } from 'transliteration/domain/text'
import LemmaAnnotation, {
  LemmaAnnotatorProps,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { TextLine } from 'transliteration/domain/text-line'
import { lineNumberFactory } from 'test-support/linenumber-factory'
import { kurToken, raToken } from 'test-support/test-tokens'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { AkkadianWord } from 'transliteration/domain/token'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import Promise from 'bluebird'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { wordFactory } from 'test-support/word-fixtures'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const suggestion = new LemmaOption(wordFactory.build({ _id: 'mockLemma' }))

let container

const brokenKurToken = {
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

const text = new Text({
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

const editableTokens = [
  new EditableToken(raToken, 0, 0, 0, []),
  new EditableToken(kurToken, 1, 1, 0, []),
  new EditableToken(brokenKurToken, 2, 0, 1, []),
]

const props: LemmaAnnotatorProps = {
  wordService: wordServiceMock,
  text,
  editableTokens,
  museumNumber: 'A.38',
  fragmentService: fragmentServiceMock,
  setText: jest.fn(),
  updateAnnotation: jest.fn(),
}

describe('LemmaAnnotation', () => {
  beforeEach(() => {
    container = render(<LemmaAnnotation {...props} />).container
  })
  it('renders the lemmatizer component', () => {
    expect(container).toMatchSnapshot()
  })
  it('selects the first token by default', () => {
    expect(screen.getByRole('button', { name: /ra/ })).toHaveClass('selected')
    expect(screen.getByRole('button', { name: /kur/ })).not.toHaveClass(
      'selected'
    )
  })
  it('sets the active token on click', async () => {
    await act(async () => {
      screen.getByText('kur').click()
    })

    expect(screen.getByRole('button', { name: /kur/ })).toHaveClass('selected')
    expect(screen.getByRole('button', { name: /ra/ })).not.toHaveClass(
      'selected'
    )
  })
  it('unsets the active token on click', async () => {
    await act(async () => {
      screen.getByText('kur').click()
    })
    expect(screen.getByRole('button', { name: /kur/ })).toHaveClass('selected')

    await act(async () => {
      screen.getByText('kur').click()
    })
    expect(screen.getByRole('button', { name: /kur/ })).not.toHaveClass(
      'selected'
    )
  })
  describe('Autofill Lemmas', () => {
    beforeEach(async () => {
      fragmentServiceMock.collectLemmaSuggestions.mockReturnValue(
        Promise.resolve(new Map([['kur', [suggestion]]]))
      )
      await act(async () => {
        screen.getByText('Autofill').click()
      })
    })
    it('calls collectLemmaSuggestions', async () => {
      expect(fragmentServiceMock.collectLemmaSuggestions).toHaveBeenCalledWith(
        'A.38'
      )
    })
    it('applies the suggestions to relevant tokens', async () => {
      expect(screen.getAllByText('mockLemma')).toHaveLength(2)
    })
    // it('resets the active token on clicking reset', async () => {
    //   await act(async () => {
    //     screen.getByText('ku[r').click()
    //     screen.getByLabelText('reset-current-token').click()
    //   })
    //   expect(screen.getByText('mockLemma')).toBeInTheDocument()
    // })
  })
})
