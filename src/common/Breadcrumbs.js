import React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

const sections = {
  eBL: '/',
  Bibliography: '/bibliography',
  Corpus: '/corpus',
  Dictionary: '/dictionary',
  Fragmentarium: '/fragmentarium'
}

function SectionCrumb ({ section }) {
  const sectionLink = sections[section]
  const sectionItem = <Breadcrumb.Item>{section}</Breadcrumb.Item>
  return sectionLink ? (
    <LinkContainer to={sectionLink}>{sectionItem}</LinkContainer>
  ) : (
    sectionItem
  )
}

export default function Breadcrumbs ({ crumbs }) {
  const initial = ['eBL', ..._.initial(crumbs)]
  const last = _.last(crumbs)
  return (
    <Breadcrumb separator='/'>
      {initial.map((section, index) => (
        <SectionCrumb key={index} section={section} />
      ))}
      {last && <Breadcrumb.Item active>{last}</Breadcrumb.Item>}
    </Breadcrumb>
  )
}
