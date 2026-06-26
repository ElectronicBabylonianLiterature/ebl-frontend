import React from 'react'
import _ from 'lodash'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LemmaAnnotationForm from './LemmaAnnotationForm'
import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { atfTokenKur, kurToken } from 'test-support/test-tokens'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()

let token: EditableToken | null
const word: Word = wordFactory.build({
  _id: 'foo I',
  lemma: ['foo'],
  homonym: 'I',
})
const nounWord: Word = wordFactory.build({
  _id: 'common I',
  lemma: ['common'],
  homonym: 'I',
  pos: ['N'],
})
const properNounWord: Word = wordFactory.build({
  _id: 'marduk DN',
  lemma: ['marduk'],
  homonym: 'I',
  pos: [],
  namedEntityTags: ['DN'],
})
const secondProperNounWord: Word = wordFactory.build({
  _id: 'babylon GN',
  lemma: ['babylon'],
  homonym: 'I',
  pos: ['N'],
  namedEntityTags: ['GN'],
})
const mixedWords = [nounWord, properNounWord, secondProperNounWord]

const onTab = jest.fn()
const onShiftTab = jest.fn()
const onChange = jest.fn()

function createToken(language: string): EditableToken {
  const editableToken = new EditableToken(
    { ...atfTokenKur, language },
    0,
    0,
    0,
    [],
  )
  editableToken.isSelected = true
  return editableToken
}

const renderLemmaAnnotationForm = () => {
  render(
    <LemmaAnnotationForm
      token={token}
      wordService={wordServiceMock}
      onChange={onChange}
      onTab={onTab}
      onShiftTab={onShiftTab}
    />,
  )
}

async function searchForLemma(inputValue = 'lem') {
  const input = screen.getByLabelText('edit-token-lemmas')
  fireEvent.change(input, { target: { value: inputValue } })
  await waitFor(() =>
    expect(wordServiceMock.searchLemma).toHaveBeenCalledWith(inputValue),
  )
}

async function expectOnlyProperNounResults() {
  expect(await screen.findByText('marduk')).toBeInTheDocument()
  expect(await screen.findByText('babylon')).toBeInTheDocument()
  expect(screen.queryByText('common')).not.toBeInTheDocument()
}

describe('LemmaAnnotationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    token = new EditableToken(kurToken, 0, 0, 0, [])
    token.isSelected = true
    wordServiceMock.searchLemma.mockResolvedValue([word])
  })
  it('renders the select component', () => {
    renderLemmaAnnotationForm()
    expect(screen.getByLabelText('edit-token-lemmas')).toBeInTheDocument()
  })

  it('calls loadOptions when searching', async () => {
    renderLemmaAnnotationForm()
    await searchForLemma()
    expect(await screen.findByText('foo')).toBeInTheDocument()
  })

  it('keeps all lemma results for Akkadian tokens', async () => {
    wordServiceMock.searchLemma.mockResolvedValue(mixedWords)

    renderLemmaAnnotationForm()
    await searchForLemma()

    expect(await screen.findByText('common')).toBeInTheDocument()
    expect(await screen.findByText('marduk')).toBeInTheDocument()
    expect(await screen.findByText('babylon')).toBeInTheDocument()
  })

  it.each(['SUMERIAN', 'EMESAL'])(
    'only shows proper noun lemma results for %s tokens',
    async (language) => {
      token = createToken(language)
      wordServiceMock.searchLemma.mockResolvedValue(mixedWords)

      renderLemmaAnnotationForm()
      await searchForLemma()

      await expectOnlyProperNounResults()
    },
  )

  it('shows no options for Sumerian tokens without proper noun matches', async () => {
    token = createToken('SUMERIAN')
    wordServiceMock.searchLemma.mockResolvedValue([nounWord])

    renderLemmaAnnotationForm()
    await searchForLemma()

    expect(await screen.findByText('No options')).toBeInTheDocument()
    expect(screen.queryByText('common')).not.toBeInTheDocument()
  })

  it('treats words without namedEntityTags as non-proper-nouns (pre-migration data)', async () => {
    token = createToken('SUMERIAN')
    const legacyWord = _.omit(
      wordFactory.build({ _id: 'legacy I', lemma: ['legacy'], pos: ['N'] }),
      'namedEntityTags',
    ) as Word
    wordServiceMock.searchLemma.mockResolvedValue([legacyWord])

    renderLemmaAnnotationForm()
    await searchForLemma()

    expect(await screen.findByText('No options')).toBeInTheDocument()
    expect(screen.queryByText('legacy')).not.toBeInTheDocument()
  })

  it('keeps all lemma results for null tokens', async () => {
    token = null
    wordServiceMock.searchLemma.mockResolvedValue([nounWord, properNounWord])
    const callback = jest.fn()
    const form = new LemmaAnnotationForm({
      token,
      wordService: wordServiceMock,
      onChange,
      onTab,
      onShiftTab,
    })

    form.loadOptions('lem', callback)

    await waitFor(() => expect(callback).toHaveBeenCalled())
    expect(callback.mock.calls[0][0].map((option) => option.value)).toEqual([
      nounWord._id,
      properNounWord._id,
    ])
  })

  it('disables the select when token is not selected', () => {
    token?.unselect()
    renderLemmaAnnotationForm()
    expect(screen.getByLabelText('edit-token-lemmas')).toBeDisabled()
  })

  it('calls onChange when selecting a lemma', async () => {
    renderLemmaAnnotationForm()
    await searchForLemma()
    fireEvent.click(await screen.findByText('foo'))
    expect(onChange).toHaveBeenCalled()
  })

  it('selects the next or previous token', async () => {
    renderLemmaAnnotationForm()
    const input = screen.getByLabelText('edit-token-lemmas')
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })
    expect(onTab).toHaveBeenCalled()

    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab', shiftKey: true })
    expect(onShiftTab).toHaveBeenCalled()
  })
})
