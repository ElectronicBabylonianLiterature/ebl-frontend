import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LemmaAnnotationForm from './LemmaAnnotationForm'
import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'
import {} from 'react-dom/test-utils'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()

let token: EditableToken
const word: Word = wordFactory.build({
  _id: 'foo I',
  lemma: ['foo'],
  homonym: 'I',
})

const onTab = jest.fn()
const onShiftTab = jest.fn()
const onChange = jest.fn()

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

describe('LemmaAnnotationForm', () => {
  beforeEach(() => {
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
    const input = screen.getByLabelText('edit-token-lemmas')
    fireEvent.change(input, { target: { value: 'lem' } })
    await waitFor(() =>
      expect(wordServiceMock.searchLemma).toHaveBeenCalledWith('lem'),
    )
    expect(screen.getByText('foo')).toBeInTheDocument()
  })

  it('disables the select when token is not selected', () => {
    token.unselect()
    renderLemmaAnnotationForm()
    expect(screen.getByLabelText('edit-token-lemmas')).toBeDisabled()
  })

  it('calls onChange when selecting a lemma', async () => {
    renderLemmaAnnotationForm()
    const input = screen.getByLabelText('edit-token-lemmas')
    fireEvent.change(input, { target: { value: 'lem' } })
    await waitFor(() =>
      expect(wordServiceMock.searchLemma).toHaveBeenCalledWith('lem'),
    )
    fireEvent.click(screen.getByText('foo'))
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
