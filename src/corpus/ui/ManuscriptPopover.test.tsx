import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import ManuscriptPopOver from './ManuscriptPopover'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provenances } from 'corpus/domain/provenance'
import { Periods } from 'common/period'
import Chance from 'chance'

const chance = new Chance('manuscript-popover-test')

const manuscript = manuscriptLineDisplayFactory.build(
  {},
  {
    associations: {
      provenance: Provenances.Babylon,
      period: Periods['Late Babylonian'],
    },
    transient: { chance: chance },
  }
)
const oldSiglum = manuscript.oldSigla[0]

beforeEach(() =>
  render(
    <MemoryRouter>
      <ManuscriptPopOver manuscript={manuscript} />
    </MemoryRouter>
  )
)

test('Open manuscript line popover', async () => {
  const siglumText = screen.getByText(manuscript.siglum)
  expect(siglumText).toBeVisible()

  userEvent.click(siglumText)
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible())
})

test('Show manuscript line details', async () => {
  userEvent.click(screen.getByText(manuscript.siglum))
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible())

  const heading = screen.getByRole('heading', { level: 3 })
  expect(heading).toHaveTextContent(oldSiglum.siglum)
  expect(heading).toMatchSnapshot()

  const number = manuscript.joins[0][0].museumNumber
  expect(screen.getByText(number)).toBeVisible()
  expect(screen.getByText(number)).toHaveAttribute('href', `/library/${number}`)
})

const manuscriptAttributes = [
  manuscript.provenance.parent ?? 'null',
  manuscript.provenance.name,
  manuscript.type.displayName ?? manuscript.type.name,
  manuscript.period.displayName ?? manuscript.period.name,
  manuscript.period.description,
]

test.each(manuscriptAttributes)('%s', async (attribute) => {
  userEvent.click(screen.getByText(manuscript.siglum))
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible())

  expect(screen.getByRole('tooltip')).toHaveTextContent(attribute)
})
