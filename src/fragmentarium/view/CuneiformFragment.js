import React from 'react'
import { Grid, Row, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'

import References from 'fragmentarium/bibliography/References'
import Edition from 'fragmentarium/edition/Edition'
import Lemmatizer from 'fragmentarium/lemmatization/Lemmatizer'
import Display from 'fragmentarium/view/Display'
import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Folios from './Folios'
import SessionContext from 'auth/SessionContext'

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
  const tabsId = _.uniqueId('fragment-container-')
  return (
    <SessionContext.Consumer>
      {session =>
        <Tabs id={tabsId} defaultActiveKey={session.isAllowedToTransliterateFragments() ? 2 : 1}>
          <Tab eventKey={1} title='Display'>
            <ContentSection><Display fragment={fragment} /> </ContentSection>
          </Tab>
          <Tab eventKey={2} title='Edition' disabled={!session.isAllowedToTransliterateFragments()}>
            <ContentSection>
              <Edition
                fragment={fragment}
                fragmentService={fragmentService}
                onChange={onChange} />
            </ContentSection>
          </Tab>
          <Tab eventKey={3} title='Lemmatization' disabled={
            _.isEmpty(fragment.text.lines) || !session.isAllowedToLemmatizeFragments()
          }>
            <ContentSection>
              <Lemmatizer
                fragmentService={fragmentService}
                number={fragment._id}
                text={fragment.text}
                autoFocusLemmaSelect />
            </ContentSection>
          </Tab>
          <Tab eventKey={4} title='References' disabled={!session.isAllowedToTransliterateFragments()}>
            <ContentSection>
              <References
                fragmentService={fragmentService}
                fragment={fragment} />
            </ContentSection>
          </Tab>
        </Tabs>
      }
    </SessionContext.Consumer>
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
