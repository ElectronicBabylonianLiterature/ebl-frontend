import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import SignService from 'signs/application/SignService'
import Signs from 'signs/ui/search/Signs'
import { OrderedSignFactory, signFactory } from 'test-support/sign-fixtures'

jest.mock('signs/application/SignService')

const SignsWithRouter = withRouter<any, typeof Signs>(Signs)

const signs = signFactory.buildList(2)
const orderedSigns = OrderedSignFactory.buildList(2)
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
let session: MemorySession

describe('Searching for word', () => {
  beforeEach(() => {
    session = new MemorySession(['read:words'])
    signService.search.mockReturnValue(Promise.resolve(signs))
    signService.findSignsByOrder.mockReturnValue(Promise.resolve(orderedSigns))
  })
  it('returns ordered signs from signService', async () => {
    const result = await signService.findSignsByOrder(
      'BAR',
      'neoBabylonianOnset'
    )
    expect(result).toEqual(orderedSigns)
  })
  it('displays result on successfull query', async () => {
    const value = signs[1].values[0]
    await renderSigns(
      `/signs?sign=${value.value}&subIndex=1&value=${value.value}`
    )
    expect(
      screen.getAllByText(new RegExp(`${value.value}`))[0]
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Query')).toHaveValue(value.value)
  })
  it('displays empty search if no query', async () => {
    await renderSigns('/signs')
    expect(screen.getByLabelText('Query')).toHaveValue('')
  })
})

it('Displays a message if user is not logged in', async () => {
  session = new MemorySession([])
  await renderSigns('/signs')
  expect(screen.getByText('Please log in to search for Signs.')).toBeVisible()
})

async function renderSigns(path: string): Promise<void> {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <SignsWithRouter signService={signService} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await screen.findAllByText('Signs')
}
