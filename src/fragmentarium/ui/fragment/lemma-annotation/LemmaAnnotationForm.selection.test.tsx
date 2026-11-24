import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WordService from 'dictionary/application/WordService'
import LemmaAnnotationForm from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationForm'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { kurToken } from 'test-support/test-tokens'
import { wordFactory } from 'test-support/word-fixtures'

jest.mock('dictionary/application/WordService')

const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const first = new LemmaOption(
  wordFactory.build({ _id: 'first I', lemma: ['first'], homonym: 'I' }),
)
const second = new LemmaOption(
  wordFactory.build({ _id: 'second I', lemma: ['second'], homonym: 'I' }),
)

test('a removed lemma leaves the other lemmas of the token', async () => {
  const token = new EditableToken(kurToken, 0, 0, 0, [first, second])
  const onChange = jest.fn()
  token.isSelected = true
  render(
    <LemmaAnnotationForm
      token={token}
      wordService={wordService}
      onChange={onChange}
      onTab={jest.fn()}
      onShiftTab={jest.fn()}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: /^Remove .*first/ }))

  expect(onChange.mock.calls).toEqual([[[second]]])
})

test('a form without a token stays empty and disabled when it is rendered again', () => {
  const props = {
    token: null,
    wordService,
    onChange: jest.fn(),
    onTab: jest.fn(),
    onShiftTab: jest.fn(),
  }
  const { rerender } = render(<LemmaAnnotationForm {...props} />)
  rerender(<LemmaAnnotationForm {...props} onTab={jest.fn()} />)

  expect(screen.getByLabelText('edit-token-lemmas')).toBeDisabled()
  expect(screen.getByText('---')).toBeVisible()
  expect(props.onChange).not.toHaveBeenCalled()
})
