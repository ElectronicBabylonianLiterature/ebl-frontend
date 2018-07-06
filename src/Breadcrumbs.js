import React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const sections = {
  Dictionary: '/dictionary',
  Fragmentarium: '/fragmentarium/K.1'
}

export default function Breadcrumbs ({section, active}) {
  return (
    <Breadcrumb separator='/'>
      <LinkContainer to='/'>
        <Breadcrumb.Item>eBL</Breadcrumb.Item>
      </LinkContainer>
      <LinkContainer to={sections[section]}>
        <Breadcrumb.Item active={!active}>{section}</Breadcrumb.Item>
      </LinkContainer>
      {active && <Breadcrumb.Item active>{active}</Breadcrumb.Item>}
    </Breadcrumb>
  )
}
