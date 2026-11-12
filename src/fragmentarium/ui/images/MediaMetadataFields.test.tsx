import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import MediaMetadataFields, { emptyMediaMetadata } from './MediaMetadataFields'

function MetadataForm({
  onSubmit,
}: {
  onSubmit: (metadata: MediaMetadata) => void
}): JSX.Element {
  const [metadata, setMetadata] = useState<MediaMetadata>({
    ...emptyMediaMetadata,
    caption: 'Obverse',
    rightsStatement: 'CC BY 4.0',
    permissionAttested: true,
  })
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(metadata)
      }}
    >
      <MediaMetadataFields
        id="metadata-test"
        value={metadata}
        onChange={setMetadata}
      />
      <button type="submit">Save metadata</button>
      <button
        type="button"
        onClick={() =>
          setMetadata((current) => ({
            ...current,
            references: [{ id: 'external-reference' }],
            projects: ['RECC'],
          }))
        }
      >
        Load other metadata
      </button>
    </form>
  )
}

test.each([
  [
    'Bibliography identifiers (comma separated)',
    'RN1, RN2',
    'references',
    [{ id: 'RN1' }, { id: 'RN2' }],
  ],
  [
    'Research projects (CAIC, ALU_GENEVA, AMPS, RECC; comma separated)',
    'CAIC, AMPS',
    'projects',
    ['CAIC', 'AMPS'],
  ],
])(
  'Enter submits the current %s without requiring blur',
  async (label, text, field, expected) => {
    const onSubmit = jest.fn()
    render(<MetadataForm onSubmit={onSubmit} />)
    await userEvent.type(
      screen.getByLabelText(label as string),
      `${text}{Enter}`,
    )
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ [field as string]: expected }),
    )
  },
)

test('keeps comma punctuation while typing, normalizes on blur, and supports clearing', async () => {
  const onSubmit = jest.fn()
  render(<MetadataForm onSubmit={onSubmit} />)
  const references = screen.getByLabelText(
    'Bibliography identifiers (comma separated)',
  )
  await userEvent.type(references, 'RN1, ')
  expect(references).toHaveValue('RN1, ')
  await userEvent.type(references, ' RN2')
  expect(references).toHaveValue('RN1,  RN2')
  await userEvent.tab()
  expect(references).toHaveValue('RN1, RN2')
  await userEvent.clear(references)
  await userEvent.keyboard('{Enter}')
  expect(onSubmit).toHaveBeenLastCalledWith(
    expect.objectContaining({ references: [] }),
  )
})

test('replaces local identifier drafts when external metadata changes', async () => {
  render(<MetadataForm onSubmit={jest.fn()} />)
  const references = screen.getByLabelText(
    'Bibliography identifiers (comma separated)',
  )
  const projects = screen.getByLabelText(/Research projects/)
  await userEvent.type(references, 'RN1, ')
  await userEvent.type(projects, 'CAIC, ')
  await userEvent.click(
    screen.getByRole('button', { name: 'Load other metadata' }),
  )
  expect(references).toHaveValue('external-reference')
  expect(projects).toHaveValue('RECC')
})
