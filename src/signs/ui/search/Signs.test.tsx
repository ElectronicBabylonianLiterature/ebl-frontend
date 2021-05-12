import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import Sign from 'signs/domain/Sign'
import SignsService from 'signs/application/SignsService'
import Signs from 'signs/ui/search/Signs'

jest.mock('signs/application/SignsService')

const SignsWithRouter = withRouter<any, typeof Signs>(Signs)

let signs: Sign[]
const signsService = new (SignsService as jest.Mock<
  jest.Mocked<SignsService>
>)()
let session: MemorySession

beforeEach(async () => {
  signs = await factory.buildMany('sign', 2)
})

describe('Searching for word', () => {
  beforeEach(() => {
    session = new MemorySession(['read:words'])
    signsService.search.mockReturnValue(Promise.resolve(signs))
  })

  it('displays result on successfull query', async () => {
    const value = signs[1].values[0]
    await renderSigns(
      `/signs?sign=${value.value}&subIndex=1&value=${value.value}`
    )
    expect(
      screen.getAllByText(new RegExp(`${value.value}~${value.subIndex}`))[0]
    ).toBeInTheDocument()
    expect((screen.getByLabelText('Query') as HTMLInputElement).value).toEqual(
      value.value
    )
  })
  it('displays empty search if no query', async () => {
    await renderSigns('/signs')
    expect((screen.getByLabelText('Query') as HTMLInputElement).value).toEqual(
      ''
    )
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
        <SignsWithRouter signsService={signsService} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await screen.findAllByText('Signs')
}
