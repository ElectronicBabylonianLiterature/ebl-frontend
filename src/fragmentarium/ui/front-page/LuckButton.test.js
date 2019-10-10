import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import { whenClicked } from 'test-helpers/utils'
import SessionContext from 'auth/SessionContext'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import LuckyButton from './LuckyButton'

let fragmentSearchService
let session
let element
let history

beforeEach(async () => {
  fragmentSearchService = {
    random: jest.fn()
  }
  session = {
    isAllowedToReadFragments: jest.fn()
  }
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
})

it('Redirects to interesting when clicked', async () => {
  renderLuckyButton(true)
  const fragment = await factory.build('fragment')
  fragmentSearchService.random.mockReturnValueOnce(Promise.resolve(fragment))
  await whenClicked(element, "I'm feeling lucky")
    .expect(history.push)
    .toHaveBeenCalledWith(`/fragmentarium/${fragment.number}`)
})

it('Hides button if user does not have fragmentarium rights', async () => {
  renderLuckyButton(false)
  expect(element.container.textContent).toEqual('')
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
