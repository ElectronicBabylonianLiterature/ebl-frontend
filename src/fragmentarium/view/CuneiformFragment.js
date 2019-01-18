import React from 'react'
import { Grid, Row, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'

import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Edition from 'fragmentarium/edition/Edition'
import Lemmatizer from 'fragmentarium/lemmatization/Lemmatizer'
import Display from 'fragmentarium/view/Display'
import Folios from './Folios'

import './CuneiformFragment.css'

function ContentSection ({ children }) {
  return <section className='CuneiformFragment__content'>
    {children}
  </section>
}

function LeftColumn ({ fragment }) {
  return <>
    <Details fragment={fragment} />
    <Record record={fragment.record} />
    <OrganizationLinks
      cdliNumber={fragment.cdliNumber}
      bmIdNumber={fragment.bmIdNumber} />
  </>
}

function MiddleColumn ({ fragment, fragmentService, onChange, autoFocusLemmaSelect }) {
  const defaultActiveKey = fragmentService.isAllowedToTransliterate() ? 2 : 1
  const editionDisabled = !fragmentService.isAllowedToTransliterate()
  const lemmatizationDisabled = _.isEmpty(fragment.text.lines) || !fragmentService.isAllowedToLemmatize()
  const tabsId = _.uniqueId('fragment-container-')
  return (
    <Tabs id={tabsId} defaultActiveKey={defaultActiveKey}>
      <Tab eventKey={1} title='Display'>
        <ContentSection><Display fragment={fragment} /> </ContentSection>
      </Tab>
      <Tab eventKey={2} title='Edition' disabled={editionDisabled}>
        <ContentSection>
          <Edition
            fragment={fragment}
            fragmentService={fragmentService}
            onChange={onChange} />
        </ContentSection>
      </Tab>
      <Tab eventKey={3} title='Lemmatization' disabled={lemmatizationDisabled}>
        <ContentSection>
          <Lemmatizer
            fragmentService={fragmentService}
            number={fragment._id}
            text={fragment.text}
            autoFocusLemmaSelect />
        </ContentSection>
      </Tab>
    </Tabs>
  )
}

function RightColumn ({ fragment, fragmentService, activeFolio }) {
  return <Folios
    fragment={fragment}
    fragmentService={fragmentService}
    activeFolio={activeFolio}
  />
}

function CuneiformFragment ({ fragment, fragmentService, activeFolio, onChange, autoFocusLemmaSelect }) {
  return (
    <Grid fluid>
      <Row>
        <Col md={2}>
          <LeftColumn fragment={fragment} />
        </Col>
        <Col md={5}>
          <MiddleColumn
            fragment={fragment}
            fragmentService={fragmentService}
            onChange={onChange}
            autoFocusLemmaSelect={autoFocusLemmaSelect} />
        </Col>
        <Col md={5}>
          <RightColumn
            fragment={fragment}
            fragmentService={fragmentService}
            activeFolio={activeFolio} />
        </Col>
      </Row>
    </Grid>
  )
}

export default CuneiformFragment
