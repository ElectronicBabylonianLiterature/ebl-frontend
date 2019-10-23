import React, { Children } from 'react'
import { ButtonGroup } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import Breadcrumbs from 'common/Breadcrumbs'

import './AppContent.css'

type Props = {
  crumbs: readonly string[]
  title: string
  children: React.ReactNode
  actions: React.ReactNode
  wide: boolean
}
export default function AppContent({ crumbs, title, children, actions, wide }) {
  return (
    <section
      className={classNames({
        'App-content': true,
        'App-content--wide': wide
      })}
    >
      <header className="App-content__header">
        <Breadcrumbs crumbs={crumbs} />
        <ButtonGroup className="float-right">{actions}</ButtonGroup>
        <h2>{title || _.last(crumbs)}</h2>
      </header>
      {children}
    </section>
  )
}
AppContent.defaultProps = {
  crumbs: [],
  title: null,
  actions: null,
  wide: false,
  children: null
}
