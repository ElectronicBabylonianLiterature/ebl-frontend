import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import { render, RenderResult, screen } from '@testing-library/react'
import _ from 'lodash'
import { whenClicked, clickNth } from 'test-support/utils'
import FragmentButton from './FragmentButton'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'

const buttonText = "I'm feeling lucky"
const message = 'Error'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

let query
let element: RenderResult

const routerFuture = Object.fromEntries([
  ['v7_startTransition', true],
  ['v7_relativeSplatPath', true],
])

const setup = (): void => {
  query = jest.fn()
  element = render(
    <MemoryRouter future={routerFuture}>
      <FragmentButton query={query}>{buttonText}</FragmentButton>
    </MemoryRouter>,
  )
}

describe('On successful request', () => {
  let fragment: Fragment

  beforeEach(() => {
    setup()
    fragment = fragmentFactory.build()
    query.mockReturnValueOnce(Promise.resolve(fragment))
  })

  it('Redirects to the fragment when clicked', async () => {
    await whenClicked(screen, buttonText)
      .expect(mockNavigate)
      .toHaveBeenCalledWith(`/library/${fragment.number}`)
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    setup()
    query.mockReturnValueOnce(Promise.reject(new Error(message)))
    clickNth(screen, buttonText, 0)
    await screen.findByText(message)
  })

  it('Does not redirect', async () => {
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  it('Does not navigate after unmount', async () => {
    setup()
    const fragment = fragmentFactory.build()
    let resolveQuery: (info: Fragment) => void = _.noop
    query.mockReturnValueOnce(
      new Promise<Fragment>((resolve) => {
        resolveQuery = resolve
      }),
    )
    clickNth(screen, buttonText, 0)
    element.unmount()
    resolveQuery(fragment)
    await Promise.resolve()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
