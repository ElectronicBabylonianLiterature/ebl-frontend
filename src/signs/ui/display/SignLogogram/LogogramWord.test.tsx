import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LogogramWord from 'signs/ui/display/SignLogogram/LogogramWord'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'

function renderLogogramWord(find: jest.Mock<Promise<Word>>) {
  return render(
    <MemoryRouter>
      <LogogramWord wordId="lemma I" wordService={{ find }} />
    </MemoryRouter>,
  )
}

it('links to the dictionary entry of the word', async () => {
  const word = wordFactory.build({ attested: false })
  renderLogogramWord(jest.fn().mockResolvedValue(word))

  expect(await screen.findByRole('link')).toHaveAttribute(
    'href',
    `/dictionary/${word._id}`,
  )
  expect(screen.getByRole('link')).toHaveTextContent(`*${word.lemma.join(' ')}`)
})

it('renders nothing when the word cannot be found', async () => {
  const find = jest.fn().mockRejectedValue(new Error('Not found'))
  const { container } = renderLogogramWord(find)

  await waitFor(() => expect(container).toBeEmptyDOMElement())
  expect(find).toHaveBeenCalledWith('lemma I', expect.any(AbortSignal))
})
