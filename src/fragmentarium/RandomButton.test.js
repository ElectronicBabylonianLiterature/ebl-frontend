import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import _ from 'lodash'
import { whenClicked, clickNth } from 'test-helpers/utils'
import RandomButton from './RandomButton'

const buttonText = "I'm feeling lucky"
const message = 'Error'
const method = 'random'

let history
let fragmentService
let element

beforeEach(() => {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  fragmentService = {
    random: jest.fn()
  }
  element = render(
    <Router history={history}>
      <RandomButton fragmentService={fragmentService} method={method}>
        {buttonText}
      </RandomButton>
    </Router>
  )
})

describe('On successful request', () => {
  let fragment

  beforeEach(async () => {
    fragment = await factory.build('fragment')
    fragmentService.random.mockReturnValueOnce(Promise.resolve(fragment))
  })

  it('Redirects to the fragment when clicked', async () => {
    await whenClicked(element, buttonText)
      .expect(history.push)
      .toHaveBeenCalledWith(`/fragmentarium/${fragment.number}`)
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    fragmentService.random.mockReturnValueOnce(
      Promise.reject(new Error(message))
    )
    await clickNth(element, buttonText, 0)
    await waitForElement(() => element.getByText(message))
  })

  it('Does not redirect', async () => {
    expect(history.push).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  it('Cancels fetch', async () => {
    const promise = new Promise(_.noop)
    fragmentService.random.mockReturnValueOnce(promise)
    await clickNth(element, buttonText, 0)
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})
