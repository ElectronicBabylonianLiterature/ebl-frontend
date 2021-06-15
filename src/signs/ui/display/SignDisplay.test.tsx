import React, { ReactNode } from 'react'
import { render, RenderResult } from '@testing-library/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import SignDisplay from 'signs/ui/display/SignDisplay'
import MemorySession from 'auth/Session'
import SignsService from 'signs/application/SignsService'
import Bluebird from 'bluebird'
import Sign from 'signs/domain/Sign'

jest.mock('signs/application/SignsService')
const signsService = new (SignsService as jest.Mock<
  jest.Mocked<SignsService>
>)()
const session = new MemorySession(['read:words'])
const sign = new Sign({ name: 'BAR' })
let element: RenderResult

function renderSignDisplay() {
  return render(
    <MemoryRouter initialEntries={['signs/BAR']}>
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
    signsService.find.mockReturnValue(Bluebird.resolve(sign))
    element = renderSignDisplay()
    await element.findByText(sign.name)
    expect(sign.find).toBeCalledWith(sign.name)
  })
  it('Sign Display Snapshot', async () => {
    expect(element.container).toMatchSnapshot()
  })
})
