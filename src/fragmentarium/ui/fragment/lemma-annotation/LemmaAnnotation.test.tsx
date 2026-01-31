import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
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
const mockWord = wordFactory.build({
  _id: 'mockLemma',
  lemma: ['mockLemma'],
  homonym: 'I',
})
const suggestion = new LemmaOption(mockWord)
const updateAnnotationMock = jest.fn()
const setTextMock = jest.fn()

let container
let editableTokens: EditableToken[]
let props: LemmaAnnotatorProps
let raUnselectSpy: jest.SpyInstance
let kurSelectSpy: jest.SpyInstance

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

function getTokenMarkable(searchString: RegExp | string) {
  return screen.getByRole('button', { name: searchString })
}

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

describe('LemmaAnnotation', () => {
  beforeEach(() => {
    editableTokens = [
      new EditableToken(raToken, 0, 0, 0, []),
      new EditableToken(kurToken, 1, 1, 0, []),
      new EditableToken(brokenKurToken, 2, 0, 1, []),
    ]
    raUnselectSpy = jest.spyOn(editableTokens[0], 'select')
    kurSelectSpy = jest.spyOn(editableTokens[0], 'select')

    props = {
      wordService: wordServiceMock,
      text,
      editableTokens,
      museumNumber: 'A.38',
      fragmentService: fragmentServiceMock,
      setText: setTextMock,
      updateAnnotation: updateAnnotationMock,
    }
  })
  it('renders the lemmatizer component', () => {
    container = render(<LemmaAnnotation {...props} />).container
    expect(container).toMatchSnapshot()
  })
  describe('Token Selection', () => {
    it('selects the first token by default', () => {
      container = render(<LemmaAnnotation {...props} />).container
      expect(getTokenMarkable(/ra/)).toHaveClass('selected')
      expect(getTokenMarkable(/kur/)).not.toHaveClass('selected')
    })
    it('sets the active token on click', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      await act(async () => {
        screen.getByText('kur').click()
      })

      expect(raUnselectSpy).toHaveBeenCalled()
      expect(kurSelectSpy).toHaveBeenCalled()

      expect(getTokenMarkable(/ra/)).not.toHaveClass('selected')
      expect(getTokenMarkable(/kur/)).toHaveClass('selected')
    })
    it('unsets the active token on click', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      await act(async () => {
        screen.getByText('kur').click()
      })
      expect(getTokenMarkable(/kur/)).toHaveClass('selected')

      await act(async () => {
        screen.getByText('kur').click()
      })
      expect(getTokenMarkable(/kur/)).not.toHaveClass('selected')
    })
    it('selects the next token on Tab', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      const input = screen.getByLabelText('edit-token-lemmas')
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })
      expect(getTokenMarkable(/kur/)).toHaveClass('selected')
    })
    it('selects the previous token on Shift+Tab', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      await act(async () => {
        screen.getByText('kur').click()
      })
      expect(getTokenMarkable(/kur/)).toHaveClass('selected')
      const input = screen.getByLabelText('edit-token-lemmas')
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab', shiftKey: true })
      expect(getTokenMarkable(/ra/)).toHaveClass('selected')
    })
  })
  describe('Token Editing', () => {
    beforeEach(() => {
      wordServiceMock.searchLemma.mockReturnValue(Promise.resolve([mockWord]))
    })
    it('searches for lemmas on user input', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      const input = screen.getByLabelText('edit-token-lemmas')
      fireEvent.change(input, { target: { value: 'mock' } })
      expect(wordServiceMock.searchLemma).toHaveBeenCalledWith('mock')
    })
    it('applies the suggestion on confirmation', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      const input = screen.getByLabelText('edit-token-lemmas')

      fireEvent.change(input, { target: { value: 'mock' } })

      const suggestion = await screen.findByText('mockLemma')
      fireEvent.click(suggestion)

      screen.getByText('ra').click()

      expect(screen.getByText('mockLemma')).toHaveTextContent(/mockLemma\s*New/)
    })
    it('saves the changes on clicking Save', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      const input = screen.getByLabelText('edit-token-lemmas')
      updateAnnotationMock.mockResolvedValue({ text })

      fireEvent.change(input, { target: { value: 'mock' } })

      const suggestion = await screen.findByText('mockLemma')
      fireEvent.click(suggestion)

      await act(async () => {
        screen.getByText('Save').click()
      })
      expect(updateAnnotationMock).toHaveBeenCalledWith({
        '0': { '0': ['mockLemma'] },
      })
      expect(setTextMock).toHaveBeenCalledWith(text)
    })
  })
  describe('Autofill Lemmas', () => {
    it('calls collectLemmaSuggestions', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      fragmentServiceMock.collectLemmaSuggestions.mockResolvedValue(
        new Map([['kur', [suggestion]]]),
      )
      await act(async () => {
        screen.getByText('Autofill').click()
      })
      expect(fragmentServiceMock.collectLemmaSuggestions).toHaveBeenCalledWith(
        'A.38',
      )
    })
    it('applies the suggestions to relevant tokens', async () => {
      container = render(<LemmaAnnotation {...props} />).container
      fragmentServiceMock.collectLemmaSuggestions.mockResolvedValue(
        new Map([['kur', [suggestion]]]),
      )
      await act(async () => {
        screen.getByText('Autofill').click()
      })
      expect(screen.getAllByText('mockLemma')).toHaveLength(2)
    })
  })
})
