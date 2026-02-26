import React from 'react'
import {
  Navigate,
  matchPath,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom'

type MatchParams = Record<string, string | undefined>

type MatchResult = {
  params: MatchParams
  path?: string
  url?: string
  isExact?: boolean
}

type RouteComponentProps = {
  match: MatchResult
  location: ReturnType<typeof useLocation>
}

type RouteProps = {
  path?: string
  exact?: boolean
  component?: React.ComponentType<RouteComponentProps>
  render?: (props: RouteComponentProps) => React.ReactNode
  children?: React.ReactNode | ((props: RouteComponentProps) => React.ReactNode)
  computedMatch?: ReturnType<typeof matchPath> | null
}

export function Route({
  path,
  exact,
  component: Component,
  render,
  children,
  computedMatch,
}: RouteProps): JSX.Element | null {
  const location = useLocation()
  const matchPattern = useMatch('*')
  const match =
    computedMatch ??
    (path
      ? matchPath({ path, end: exact ?? true }, location.pathname)
      : { params: {} })

  if (!match) return null

  const matchResult: MatchResult = {
    params: match.params ?? {},
    path: path ?? matchPattern?.pattern.path ?? undefined,
    url: location.pathname,
    isExact: true,
  }

  const routeProps: RouteComponentProps = {
    match: matchResult,
    location,
  }

  if (render) return <>{render(routeProps)}</>
  if (Component) return <Component {...routeProps} />
  if (typeof children === 'function') return <>{children(routeProps)}</>
  return <>{children}</>
}

type SwitchProps = {
  children: React.ReactNode
}

export function Switch({ children }: SwitchProps): JSX.Element | null {
  const location = useLocation()
  let element: React.ReactElement | null = null

  React.Children.forEach(children, (child) => {
    if (element || !React.isValidElement(child)) return
    const { path, from, exact } = child.props as {
      path?: string
      from?: string
      exact?: boolean
    }
    const targetPath = path ?? from
    const match = targetPath
      ? matchPath({ path: targetPath, end: exact ?? true }, location.pathname)
      : { params: {} }
    if (match) {
      element = React.cloneElement(child, { computedMatch: match })
    }
  })

  return element
}

type RedirectProps = {
  to: string
  from?: string
  exact?: boolean
  push?: boolean
  computedMatch?: ReturnType<typeof matchPath> | null
}

export function Redirect({
  to,
  from,
  exact,
  push = false,
  computedMatch,
}: RedirectProps): JSX.Element | null {
  const location = useLocation()
  const match =
    computedMatch ??
    (from
      ? matchPath({ path: from, end: exact ?? true }, location.pathname)
      : { params: {} })

  if (!match) return null
  return <Navigate to={to} replace={!push} />
}

type HistoryLocation = ReturnType<typeof useLocation>
type ToLike = string | { pathname?: string; search?: string; hash?: string }

export function useHistory(): {
  push: (to: ToLike) => void
  replace: (to: ToLike) => void
  location: HistoryLocation
} {
  const navigate = useNavigate()
  const location = useLocation()
  return {
    push: (to: ToLike) => navigate(to),
    replace: (to: ToLike) => navigate(to, { replace: true }),
    location,
  }
}
