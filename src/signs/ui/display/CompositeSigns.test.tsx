import SignService from 'signs/application/SignService'
import { signFactory } from 'test-support/sign-fixtures'
import Bluebird from 'bluebird'
import CompositeSigns from 'signs/ui/display/CompositeSigns'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import React, { ReactNode } from 'react'

jest.mock('signs/application/SignService')
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

const sign1 = signFactory.build({ name: 'BAR' })
const sign2 = signFactory.build({ name: 'PI' })

describe('Composite Signs', () => {
  const setup = async (): Promise<void> => {
    signService.search.mockReturnValue(Bluebird.resolve([sign1, sign2]))
    render(
      <MemoryRouter>
        <Route
          render={(): ReactNode => (
            <CompositeSigns
              signService={signService}
              query={{ value: 'test', subIndex: 1, isComposite: true }}
            />
          )}
        />
      </MemoryRouter>,
    )
    await screen.findByText('Composites:')
  }
  test('Composite Sign is link', async () => {
    await setup()
    expect(
      screen.getByRole('link', { name: new RegExp(sign1.name) }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: new RegExp(sign2.name) }),
    ).toBeInTheDocument()
  })
})
