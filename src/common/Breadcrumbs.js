import React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const sections = {
  Dictionary: '/dictionary',
  Fragmentarium: '/fragmentarium'
}

export default function Breadcrumbs ({ section, active }) {
  const sectionLink = sections[section]
  const sectionItem = <Breadcrumb.Item active={!active}>{section}</Breadcrumb.Item>
  return (
    <Breadcrumb separator='/'>
      <LinkContainer to='/'>
        <Breadcrumb.Item>eBL</Breadcrumb.Item>
      </LinkContainer>
      {sectionLink
        ? <LinkContainer to={sections[section]}>{sectionItem}</LinkContainer>
        : sectionItem}
      {active && <Breadcrumb.Item active>{active}</Breadcrumb.Item>}
    </Breadcrumb>
  )
}
