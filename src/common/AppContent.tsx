import React, { FunctionComponent, PropsWithChildren } from 'react'
import { ButtonToolbar } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import Breadcrumbs, { Crumb } from 'common/Breadcrumbs'

import './AppContent.css'

type Props = {
  crumbs?: readonly Crumb[]
  title?: React.ReactNode
  actions?: React.ReactNode
  wide?: boolean
}
const AppContent: FunctionComponent<Props> = ({
  crumbs = [],
  title,
  children,
  actions,
  wide = false,
}: PropsWithChildren<Props>) => {
  return (
    <section
      className={classNames({
        'App-content': true,
        'App-content--wide': wide,
      })}
    >
      <header className="App-content__header">
        <Breadcrumbs crumbs={crumbs} />
        <ButtonToolbar className="float-right">{actions}</ButtonToolbar>
        <h2>{title || _.last(crumbs)?.text}</h2>
      </header>
      {children}
    </section>
  )
}
export default AppContent
