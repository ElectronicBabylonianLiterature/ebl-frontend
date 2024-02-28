import React from 'react'
import { render, screen } from '@testing-library/react'
import { Router, Switch } from 'react-router-dom'
import FragmentariumRoutes from './fragmentariumRoutes'
import { getServices } from 'test-support/AppDriver'
import { createMemoryHistory } from 'history'

describe('NotFoundPage rendering in FragmentariumRoutes', () => {
  const nonExistentRoutes = [
    '/fragmentarium/search/non-existent',
    '/fragmentarium/Fragment.12345/match/non-existent',
    '/fragmentarium/Fragment.12345/annotate/non-existent',
    '/fragmentarium/Fragment.12345/non-existent',
  ]
  nonExistentRoutes.forEach((path) => {
    const history = createMemoryHistory({ initialEntries: [path] })
    test(`renders NotFoundPage for "${path}"`, () => {
      render(
        <Router history={history}>
          <Switch>
            {[...FragmentariumRoutes({ ...getServices(), sitemap: false })]}
          </Switch>
        </Router>
      )
      expect(
        screen.getByText(/The page you are looking for does not exist./i)
      ).toBeInTheDocument()
    })
  })
})
