import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render, RenderResult } from '@testing-library/react'
import Promise from 'bluebird'
import { whenClicked } from 'test-support/utils'
import SessionContext from 'auth/SessionContext'
import LuckyButton from './LuckyButton'
import { fragmentFactory } from 'test-support/fragment-fixtures'

let fragmentSearchService
let session
let element: RenderResult
let history

beforeEach(async () => {
  fragmentSearchService = {
    random: jest.fn(),
  }
  session = {
    isAllowedToReadFragments: jest.fn(),
  }
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
})

it('Redirects to interesting when clicked', async () => {
  renderLuckyButton(true)
  const fragment = fragmentFactory.build()
  fragmentSearchService.random.mockReturnValueOnce(Promise.resolve(fragment))
  await whenClicked(element, "I'm feeling lucky")
    .expect(history.push)
    .toHaveBeenCalledWith(`/library/${fragment.number}`)
})

it('Hides button if user does not have fragmentarium rights', async () => {
  renderLuckyButton(false)
  expect(element.container).toBeEmptyDOMElement()
})

function renderLuckyButton(isAllowedTo) {
  session.isAllowedToReadFragments.mockReturnValue(isAllowedTo)
  element = render(
    <Router history={history}>
      <SessionContext.Provider value={session}>
        <LuckyButton fragmentSearchService={fragmentSearchService} />
      </SessionContext.Provider>
    </Router>
  )
}
