import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAlignmentInput } from 'corpus/ui/alignment/WordAligner'
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

function AlignmentInputHarness(): JSX.Element {
  const { fields, createToken } = useAlignmentInput(
    token,
    chapter.lines[0].variants[0].reconstructionTokens,
  )
  return (
    <>
      {fields}
      <button type="button" onClick={(): void => onChange(createToken())}>
        Set alignment
      </button>
    </>
  )
}

function openAligner(): void {
  render(<AlignmentInputHarness />)
}

beforeEach(() => {
  onChange.mockClear()
})

it('aligns a word without a variant', async () => {
  openAligner()
  await userEvent.click(screen.getByRole('button', { name: 'Set alignment' }))

  expect(onChange).toHaveBeenCalledWith({ ...token, alignment: 1 })
})

it('removes the alignment when no ideal word is selected', async () => {
  openAligner()
  await userEvent.selectOptions(screen.getByLabelText('Ideal word'), [''])
  await userEvent.click(screen.getByRole('button', { name: 'Set alignment' }))

  expect(onChange).toHaveBeenCalledWith({ ...token, alignment: null })
})
