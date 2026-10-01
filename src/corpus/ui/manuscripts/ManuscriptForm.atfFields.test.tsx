import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ManuscriptForm from 'corpus/ui/manuscripts/ManuscriptForm'
import { manuscriptFactory } from 'test-support/manuscript-fixtures'
import { Manuscript } from 'corpus/domain/manuscript'
import Reference from 'bibliography/domain/Reference'
import { Provenance } from 'corpus/domain/provenance'
import userEvent from '@testing-library/user-event'

jest.mock('editor/Editor', () => {
  return function EditorMock({
    name,
    value,
    onChange,
  }: {
    name: string
    value: string
    onChange: (value: string) => void
  }): JSX.Element {
    return (
      <textarea
        aria-label={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }
})

const manuscript = manuscriptFactory.build()
const onChange = jest.fn<void, [Manuscript]>()

function renderForm(provenanceOptions: readonly Provenance[] = []): void {
  render(
    <ManuscriptForm
      manuscript={manuscript}
      provenanceOptions={provenanceOptions}
      onChange={onChange}
      searchBibliography={jest.fn().mockResolvedValue([])}
    />,
  )
}

beforeEach(() => {
  onChange.mockClear()
})

it.each([
  ['colophon', /^colophon-editor-/],
  ['unplacedLines', /^unplaced-lines-editor-/],
] as const)('updates %s from its ATF editor', (property, editorLabel) => {
  renderForm()

  fireEvent.change(screen.getByLabelText(editorLabel), {
    target: { value: '1. kur' },
  })

  expect(onChange).toHaveBeenCalledTimes(1)
  expect(onChange.mock.calls[0][0][property]).toEqual('1. kur')
})

it('adds a reference', async () => {
  renderForm()

  await userEvent.click(screen.getByText('References'))
  await userEvent.click(screen.getByRole('button', { name: 'Add Reference' }))

  expect(onChange).toHaveBeenCalledWith({
    ...manuscript,
    references: [...manuscript.references, new Reference()],
  })
})

it('indents provenances that belong to a region', () => {
  renderForm([
    { name: 'Babylonia', abbreviation: 'Bab', parent: null },
    { name: 'Babylon', abbreviation: 'Bab', parent: 'Babylonia' },
  ])

  expect(
    screen.getAllByRole('option').map((option) => option.textContent),
  ).toEqual(
    expect.arrayContaining(['Babylonia', '\u00A0'.repeat(4) + 'Babylon']),
  )
})
