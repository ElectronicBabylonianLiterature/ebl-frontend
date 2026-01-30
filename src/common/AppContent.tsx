import React, { PropsWithChildren } from 'react'
import { ButtonToolbar } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import Breadcrumbs, { Crumb } from 'common/Breadcrumbs'

import './AppContent.sass'

interface Props {
  crumbs?: readonly Crumb[]
  title?: React.ReactNode
  actions?: React.ReactNode
  sidebar?: React.ReactNode
  wide?: boolean
}

export default function AppContent({
  crumbs = [],
  title,
  children,
  actions,
  sidebar,
  wide = false,
}: PropsWithChildren<Props>): JSX.Element {
  const showHeader = crumbs.length > 0 || title || actions

  return (
    <main
      className={classNames({
        main: true,
        'main--wide': wide,
      })}
    >
      <div className="main__content">
        {showHeader && (
          <header className="main__header">
            <Breadcrumbs className="main__breadcrumbs" crumbs={crumbs} />
            <h2 className="main__heading">{title || _.last(crumbs)?.text}</h2>
            <ButtonToolbar className="main__toolbar">{actions}</ButtonToolbar>
          </header>
        )}
        {children}
      </div>
      {sidebar && <aside className="main__sidebar">{sidebar}</aside>}
    </main>
  )
}
