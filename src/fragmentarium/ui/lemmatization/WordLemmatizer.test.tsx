import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WordLemmatizer from './WordLemmatizer'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import { wordFactory } from 'test-support/word-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import Promise from 'bluebird'

const fragmentService = {
  searchLemma: jest.fn(),
} as unknown as FragmentService

describe('WordLemmatizer', () => {
  beforeEach(() => {
    const word = wordFactory.build()
    fragmentService.searchLemma = jest
      .fn()
      .mockReturnValue(Promise.resolve([word]))
  })

  it('renders non-lemmatizable token as plain text', () => {
    const token = new LemmatizationToken('test', false)
    const onChange = jest.fn()

    render(
      <WordLemmatizer
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />,
    )

    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders lemmatizable token with button', () => {
    const word = wordFactory.build()
    const lemma = new Lemma(word)
    const token = new LemmatizationToken('test', true, [lemma])
    const onChange = jest.fn()

    render(
      <WordLemmatizer
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />,
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('test')
  })

  it('opens modal when button is clicked', async () => {
    const user = userEvent.setup()
    const word = wordFactory.build()
    const lemma = new Lemma(word)
    const token = new LemmatizationToken('test', true, [lemma])
    const onChange = jest.fn()

    render(
      <WordLemmatizer
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeVisible()
    expect(screen.getByLabelText('Lemma')).toBeInTheDocument()
  })

  it('modal content is visible when opened', async () => {
    const user = userEvent.setup()
    const word = wordFactory.build()
    const lemma = new Lemma(word)
    const token = new LemmatizationToken('test', true, [lemma])
    const onChange = jest.fn()

    render(
      <WordLemmatizer
        fragmentService={fragmentService}
        token={token}
        onChange={onChange}
      />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible()
    })

    const lemmaInput = screen.getByLabelText('Lemma')
    expect(lemmaInput).toBeVisible()
    expect(lemmaInput).toBeInTheDocument()
  })
})
