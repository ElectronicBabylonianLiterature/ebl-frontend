import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import LemmaAnnotationForm from './LemmaAnnotationForm'
import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()

let token: EditableToken
const word: Word = wordFactory.build({ _id: 'foo' })

const renderLemmaAnnotationForm = () => {
  render(
    <LemmaAnnotationForm
      token={token}
      wordService={wordServiceMock}
      onChange={jest.fn()}
      onKeyDown={jest.fn()}
    />
  )
}

describe('LemmaAnnotationForm', () => {
  beforeEach(() => {
    token = new EditableToken(kurToken, 0, 0, 0, [])
    token.isSelected = true
    wordServiceMock.findAll.mockReturnValue(Promise.resolve([word]))
    wordServiceMock.searchLemma.mockReturnValue(Promise.resolve([]))
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
      expect(wordServiceMock.searchLemma).toHaveBeenCalledWith('lem')
    )
  })

  it('disables the select when token is not selected', () => {
    token.unselect()
    renderLemmaAnnotationForm()
    expect(screen.getByLabelText('edit-token-lemmas')).toBeDisabled()
  })
})
