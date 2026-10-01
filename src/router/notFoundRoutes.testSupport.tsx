import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route, Switch } from 'router/compat'

export function expectRedirectWithLocationPreserved({
  initialEntry,
  targetPath,
  expectedLocation,
  routes,
}: {
  initialEntry: string
  targetPath: string
  expectedLocation: string
  routes: JSX.Element[]
}): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Switch>
        {routes}
        <Route
          path={targetPath}
          render={({ location }) => (
            <div>{`${location.pathname}${location.search}${location.hash}`}</div>
          )}
        />
      </Switch>
    </MemoryRouter>,
  )

  expect(screen.getByText(expectedLocation)).toBeInTheDocument()
}

const redirectTargetText = 'Redirect Target'

export function expectRedirectToTarget({
  initialEntry,
  targetPath,
  routes,
  routesFirst,
}: {
  initialEntry: string
  targetPath: string
  routes: JSX.Element[]
  routesFirst: boolean
}): void {
  const target = (
    <Route
      key={redirectTargetText}
      path={targetPath}
      render={() => <div>{redirectTargetText}</div>}
    />
  )
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Switch>{routesFirst ? [...routes, target] : [target, ...routes]}</Switch>
    </MemoryRouter>,
  )

  expect(screen.getByText(redirectTargetText)).toBeInTheDocument()
}

export const notFoundPagePattern =
  /The page you are looking for does not exist./i

export function renderRoutesAtPath({
  initialEntry,
  routes,
}: {
  initialEntry: string
  routes: JSX.Element[]
}): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Switch>{routes}</Switch>
    </MemoryRouter>,
  )
}

export function expectNotFoundPageForPaths({
  paths,
  getRoutes,
}: {
  paths: readonly string[]
  getRoutes: () => JSX.Element[]
}): void {
  paths.forEach((path) => {
    test(`renders NotFoundPage for "${path}"`, () => {
      renderRoutesAtPath({
        initialEntry: path,
        routes: getRoutes(),
      })
      expect(screen.getByText(notFoundPagePattern)).toBeInTheDocument()
    })
  })
}
