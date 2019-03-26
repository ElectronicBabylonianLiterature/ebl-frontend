import React from 'react'
import { ButtonGroup } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import Breadcrumbs from 'common/Breadcrumbs'

import './AppContent.css'

export default function AppContent ({ section, active, title, children, actions, wide }) {
  return (
    <section className={classNames({
      'App-content': true,
      'App-content--wide': wide
    })}>
      <header className='App-content__header'>
        <Breadcrumbs crumbs={_.compact([section, active])} />
        <ButtonGroup className='float-right'>{actions}</ButtonGroup>
        <h2>{title || active || section}</h2>
      </header>
      {children}
    </section>
  )
}
