import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignService from 'signs/application/SignService'
import SignsSearch, { displayUnicode } from 'signs/ui/search/SignsSearch'
import { signFactory } from 'test-support/sign-fixtures'
import { OrderedSign } from 'signs/domain/Sign'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const sign = signFactory.build({ name: 'BA' })
const before: OrderedSign = { name: 'AB', unicode: [0x12000], mzl: '1' }
const center: OrderedSign = { name: 'BA', unicode: [0x12040], mzl: '2' }
const after: OrderedSign = { name: 'ZU', unicode: [0x12100], mzl: '3' }

beforeEach(() => {
  signService.search.mockResolvedValue([sign])
  signService.findSignsByOrder.mockResolvedValue([[before, center, after]])
})

function renderSignsSearch(): void {
  render(
    <MemoryRouter>
      <SignsSearch
        signQuery={{ value: 'ba', isIncludeHomophones: true }}
        signService={signService}
      />
    </MemoryRouter>,
  )
}

async function findFirstSignRow(): Promise<HTMLElement> {
  renderSignsSearch()
  const [firstRow] = await screen.findAllByRole('row')
  return firstRow
}

it('labels the first row with the era direction and script', async () => {
  const row = await findFirstSignRow()

  expect(
    within(row).getByText(/Similar beginning \(Neo-Assyrian\)/),
  ).toBeVisible()
})

it('links the neighbouring signs to their MZL entries', async () => {
  const row = await findFirstSignRow()

  expect(
    within(row).getByRole('link', { name: displayUnicode(before.unicode) }),
  ).toHaveAttribute('href', '/tools/signs?listsName=MZL&listsNumber=1')
  expect(
    within(row).getByRole('link', { name: displayUnicode(after.unicode) }),
  ).toHaveAttribute('href', '/tools/signs?listsName=MZL&listsNumber=3')
})

it('shows the searched sign itself unlinked in the centre', async () => {
  const row = await findFirstSignRow()

  const [, , centerCell] = within(row).getAllByRole('cell')
  expect(centerCell).toHaveClass('center')
  expect(centerCell).toHaveTextContent(displayUnicode(center.unicode))
  expect(within(centerCell).queryByRole('link')).not.toBeInTheDocument()
})

it('shows no sign order table when there are no neighbouring signs', async () => {
  signService.findSignsByOrder.mockResolvedValue([])
  renderSignsSearch()

  await screen.findByRole('link', { name: sign.displaySignName })
  await waitFor(() =>
    expect(signService.findSignsByOrder).toHaveBeenCalledTimes(4),
  )
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})

it('omits the readings of a sign without values', async () => {
  signService.search.mockResolvedValue([
    signFactory.build({ name: 'BA', values: [] }),
  ])
  renderSignsSearch()

  await screen.findAllByRole('row')
  expect(screen.queryByText(/—/)).not.toBeInTheDocument()
  expect(screen.queryByText(/^\(/)).not.toBeInTheDocument()
})
