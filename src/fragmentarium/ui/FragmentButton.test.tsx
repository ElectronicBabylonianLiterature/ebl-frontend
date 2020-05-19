import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render, act } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import _ from 'lodash'
import { whenClicked, clickNth } from 'test-helpers/utils'
import FragmentButton from './FragmentButton'

const buttonText = "I'm feeling lucky"
const message = 'Error'

let history
let query
let element

beforeEach(() => {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  query = jest.fn()
  act(() => {
    element = render(
      <Router history={history}>
        <FragmentButton query={query}>{buttonText}</FragmentButton>
      </Router>
    )
  })
})

describe('On successful request', () => {
  let fragment

  beforeEach(async () => {
    fragment = await factory.build('fragment')
    query.mockReturnValueOnce(Promise.resolve(fragment))
  })

  it('Redirects to the fragment when clicked', async () => {
    await whenClicked(element, buttonText)
      .expect(history.push)
      .toHaveBeenCalledWith(`/fragmentarium/${fragment.number}`)
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    query.mockReturnValueOnce(Promise.reject(new Error(message)))
    await clickNth(element, buttonText, 0)
    await element.findByText(message)
  })

  it('Does not redirect', async () => {
    expect(history.push).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  it('Cancels fetch', async () => {
    const promise = new Promise(_.noop)
    query.mockReturnValueOnce(promise)
    await clickNth(element, buttonText, 0)
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})
