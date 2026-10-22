import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DossierRecord from 'dossiers/domain/DossierRecord'
import {
  DossierRecordDisplay,
  DossierRecordsListDisplay,
} from 'dossiers/ui/DossiersDisplay'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'

test('opens a dossier citation from the keyboard without a nested link', async () => {
  const user = userEvent.setup()
  const reference = referenceDtoFactory.build({
    id: 'Q123',
    pages: '12',
    linesCited: [],
    document: {
      id: 'Q123',
      type: 'article-journal',
      title: 'Study',
      author: [{ family: '[Editor](https://example.org/editor)' }],
      issued: { 'date-parts': [[2020]] },
      URL: 'https://example.org/study',
    },
  })
  const record = new DossierRecord({
    _id: 'Dossier',
    references: [reference],
  })
  render(<DossierRecordsListDisplay data={{ records: [record] }} />)
  await user.click(screen.getByRole('button', { name: 'Dossier' }))
  const dossierPopup = await screen.findByRole('tooltip')
  const citation = within(dossierPopup).getByRole('button', {
    name: /Editor\s*, 2020: 12/,
  })

  expect(within(citation).queryByRole('link')).not.toBeInTheDocument()
  await user.tab()
  expect(citation).toHaveFocus()
  await user.keyboard('{Enter}')

  await waitFor(() => expect(screen.getAllByRole('tooltip')).toHaveLength(2))
  expect(
    screen.getByRole('link', { name: 'Open in a new window.' }),
  ).toHaveAttribute('href', 'https://example.org/study')
})

test.each(['Q123', ''])(
  'names an empty dossier citation with id %s',
  async (id) => {
    const user = userEvent.setup()
    const reference = referenceDtoFactory.build({
      id,
      pages: '',
      linesCited: [],
      notes: 'Reference details',
      document: { id },
    })
    const record = new DossierRecord({
      _id: 'Dossier',
      references: [reference],
    })
    render(<DossierRecordDisplay record={record} index={0} />)
    const citation = await screen.findByRole('button', {
      name: id || 'Reference',
    })

    expect(citation).toBeVisible()
    await user.tab()
    expect(citation).toHaveFocus()
    await user.keyboard(' ')
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Reference details',
    )
  },
)
