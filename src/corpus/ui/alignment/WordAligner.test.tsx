import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WordAligner from 'corpus/ui/alignment/WordAligner'
import { AlignmentToken } from 'corpus/domain/alignment'
import { chapter } from 'test-support/test-corpus-text'

const token: AlignmentToken = {
  value: 'kur',
  alignment: 1,
  variant: null,
  isAlignable: true,
  suggested: false,
}
const onChange = jest.fn<void, [AlignmentToken]>()

async function openAligner(): Promise<void> {
  render(
    <WordAligner
      token={token}
      reconstructionTokens={chapter.lines[0].variants[0].reconstructionTokens}
      onChange={onChange}
    />,
  )
  await userEvent.click(screen.getByText('kur'))
}

beforeEach(() => {
  onChange.mockClear()
})

it('aligns a word without a variant', async () => {
  await openAligner()
  await userEvent.click(screen.getByRole('button', { name: 'Set alignment' }))

  expect(onChange).toHaveBeenCalledWith({ ...token, alignment: 1 })
})

it('removes the alignment when no ideal word is selected', async () => {
  await openAligner()
  await userEvent.selectOptions(screen.getByLabelText('Ideal word'), [''])
  await userEvent.click(screen.getByRole('button', { name: 'Set alignment' }))

  expect(onChange).toHaveBeenCalledWith({ ...token, alignment: null })
})
