import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import ManuscriptPopOver from 'corpus/ui/ManuscriptPopover'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provenances } from 'corpus/domain/provenance'
import { Periods } from 'common/utils/period'
import Chance from 'chance'
import { oldSiglumFactory } from 'test-support/old-siglum-fixtures'
import {
  restoreProvenanceState,
  snapshotProvenanceState,
  upsertProvenanceRecords,
} from 'test-support/provenance-state'

const chance = new Chance('manuscript-popover-test')
let provenanceSnapshot = snapshotProvenanceState()

beforeEach(() => {
  provenanceSnapshot = snapshotProvenanceState()
  upsertProvenanceRecords([
    {
      id: 'babylon',
      longName: 'Babylon',
      abbreviation: 'Bab',
      parent: 'Babylonia',
      sortKey: 1,
    },
    {
      id: 'babylonia',
      longName: 'Babylonia',
      abbreviation: 'Bab',
      parent: null,
      sortKey: 2,
    },
  ])
})

afterEach(() => {
  restoreProvenanceState(provenanceSnapshot)
})

const manuscript = manuscriptLineDisplayFactory.build(
  {},
  {
    associations: {
      provenance: Provenances.Babylon,
      period: Periods['Late Babylonian'],
    },
    transient: { chance: chance },
  },
)
const oldSiglum = manuscript.oldSigla[0]

function setup(shown = manuscript) {
  render(
    <MemoryRouter>
      <ManuscriptPopOver manuscript={shown} />
    </MemoryRouter>,
  )
}

test('Open manuscript line popover', async () => {
  setup()
  const siglumText = screen.getByText(manuscript.siglum)
  expect(siglumText).toBeVisible()

  await userEvent.click(siglumText)
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible())
})

test('Show manuscript line details', async () => {
  setup()
  await userEvent.click(screen.getByText(manuscript.siglum))
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible())

  const heading = screen.getByRole('heading', { level: 3 })
  expect(heading).toMatchSnapshot()
  expect(heading).toHaveTextContent(oldSiglum.siglum)

  const number = manuscript.joins[0][0].museumNumber
  expect(screen.getByText(number)).toBeVisible()
  expect(screen.getByText(number)).toHaveAttribute('href', `/library/${number}`)
})

const manuscriptAttributes = [
  manuscript.provenance.parent,
  manuscript.provenance.name,
  manuscript.type.displayName ?? manuscript.type.name,
  manuscript.period.displayName ?? manuscript.period.name,
  manuscript.period.description,
].filter(Boolean) as string[]

test.each(manuscriptAttributes)('%s', async (attribute) => {
  setup()
  await userEvent.click(screen.getByText(manuscript.siglum))
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible())

  expect(screen.getByRole('tooltip')).toHaveTextContent(attribute)
})

async function openPopover(shown: typeof manuscript): Promise<void> {
  setup(shown)
  await userEvent.click(screen.getByText(shown.siglum))
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible())
}

test('Separates several old sigla', async () => {
  const withOldSigla = manuscriptLineDisplayFactory.build(
    {},
    {
      associations: {
        oldSigla: oldSiglumFactory.buildList(2),
        provenance: Provenances.Babylon,
      },
      transient: { chance },
    },
  )
  await openPopover(withOldSigla)

  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
    `${withOldSigla.oldSigla[0].siglum}`,
  )
  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('; ')
})

test('Links the manuscript itself when it has no joins', async () => {
  const unjoined = manuscriptLineDisplayFactory.build(
    {},
    {
      associations: {
        oldSigla: [],
        joins: [],
        isInFragmentarium: true,
        provenance: Provenances.Babylon,
      },
      transient: { chance },
    },
  )
  await openPopover(unjoined)

  expect(screen.getByRole('heading', { level: 3 })).not.toHaveTextContent('(')
  expect(
    screen.getByRole('link', { name: unjoined.museumNumber }),
  ).toHaveAttribute('href', `/library/${unjoined.museumNumber}`)
})
