import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ManuscriptForm from 'corpus/ui/manuscripts/ManuscriptForm'
import { manuscriptFactory } from 'test-support/manuscript-fixtures'
import { Manuscript } from 'corpus/domain/manuscript'

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

function renderForm(): void {
  render(
    <ManuscriptForm
      manuscript={manuscript}
      provenanceOptions={[]}
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
