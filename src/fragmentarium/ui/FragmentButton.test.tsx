import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render, RenderResult, screen } from '@testing-library/react'
import Promise from 'bluebird'
import _ from 'lodash'
import { whenClicked, clickNth } from 'test-support/utils'
import FragmentButton from './FragmentButton'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'

const buttonText = "I'm feeling lucky"
const message = 'Error'

let history
let query
let element: RenderResult

beforeEach(() => {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  query = jest.fn()
  element = render(
    <Router history={history}>
      <FragmentButton query={query}>{buttonText}</FragmentButton>
    </Router>
  )
})

describe('On successful request', () => {
  let fragment: Fragment

  beforeEach(() => {
    fragment = fragmentFactory.build()
    query.mockReturnValueOnce(Promise.resolve(fragment))
  })

  it('Redirects to the fragment when clicked', async () => {
    await whenClicked(screen, buttonText)
      .expect(history.push)
      .toHaveBeenCalledWith(`/library/${fragment.number}`)
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    query.mockReturnValueOnce(Promise.reject(new Error(message)))
    clickNth(screen, buttonText, 0)
    await screen.findByText(message)
  })

  it('Does not redirect', async () => {
    expect(history.push).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  it('Cancels fetch', async () => {
    const promise = new Promise(_.noop)
    query.mockReturnValueOnce(promise)
    clickNth(screen, buttonText, 0)
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})
