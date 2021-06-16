import React, { ReactNode } from 'react'
import { render, RenderResult } from '@testing-library/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import SignDisplay from 'signs/ui/display/SignDisplay'
import MemorySession from 'auth/Session'
import SignsService from 'signs/application/SignsService'
import Bluebird from 'bluebird'
import Sign from 'signs/domain/Sign'
import { factory } from 'factory-girl'

jest.mock('signs/application/SignsService')
const signsService = new (SignsService as jest.Mock<
  jest.Mocked<SignsService>
>)()
const session = new MemorySession(['read:words'])
let sign: Sign
let element: RenderResult

function renderSignDisplay(signName: string): RenderResult {
  return render(
    <MemoryRouter initialEntries={[`/signs/${signName}`]}>
      <SessionContext.Provider value={session}>
        <Route
          path="/signs/:id"
          render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
            <SignDisplay signsService={signsService} {...props} />
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
}

describe('Sign Display', () => {
  beforeEach(async () => {
    sign = await factory.build('sign')
    signsService.find.mockReturnValue(Bluebird.resolve(sign))
    element = renderSignDisplay(sign.name)
    await element.findByText(sign.name)
    expect(signsService.find).toBeCalledWith(sign.name)
  })
  it('Sign Display Snapshot', async () => {
    expect(element.container).toMatchSnapshot()
  })
})
