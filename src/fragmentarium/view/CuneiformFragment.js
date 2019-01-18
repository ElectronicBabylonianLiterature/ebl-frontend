import React, { Component, Fragment } from 'react'
import { Grid, Row, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'

import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Edition from 'fragmentarium/transliterate/Edition'
import Lemmatizer from 'fragmentarium/lemmatization/Lemmatizer'
import Display from 'fragmentarium/view/Display'
import Folios from './Folios'

import './CuneiformFragment.css'

class CuneiformFragment extends Component {
  constructor (props) {
    super(props)
    this.tabsId = _.uniqueId('fragment-container-')
  }

  get fragment () {
    return this.props.fragment
  }

  LeftColumn = () => (
    <Fragment>
      <Details fragment={this.fragment} />
      <Record record={this.fragment.record} />
      <OrganizationLinks
        cdliNumber={this.fragment.cdliNumber}
        bmIdNumber={this.fragment.bmIdNumber} />
    </Fragment>
  )

  MiddleColumn = () => {
    const defaultActiveKey = this.props.fragmentService.isAllowedToTransliterate() ? 2 : 1
    const editionDisabled = !this.props.fragmentService.isAllowedToTransliterate()
    const lemmatizationDisabled = _.isEmpty(this.fragment.text.lines) || !this.props.fragmentService.isAllowedToLemmatize()
    return (
      <Tabs id={this.tabsId} defaultActiveKey={defaultActiveKey}>
        <Tab eventKey={1} title='Display'>
          <section className='CuneiformFragment__content'>
            <Display fragment={this.fragment} />
          </section>
        </Tab>
        <Tab eventKey={2} title='Edition' disabled={editionDisabled}>
          <section className='CuneiformFragment__content'>
            <Edition
              activeFolio={this.props.activeFolio}
              fragment={this.fragment}
              fragmentService={this.props.fragmentService}
              onChange={this.props.onChange} />
          </section>
        </Tab>
        <Tab eventKey={3} title='Lemmatization' disabled={lemmatizationDisabled}>
          <section className='CuneiformFragment__content'>
            <Lemmatizer
              fragmentService={this.props.fragmentService}
              number={this.fragment._id}
              text={this.fragment.text}
              autoFocusLemmaSelect
            />
          </section>
        </Tab>
      </Tabs>
    )
  }

  RightColumn = () => (
    <Folios
      fragment={this.fragment}
      fragmentService={this.props.fragmentService}
      activeFolio={this.props.activeFolio}
    />
  )

  render () {
    return (
      <Grid fluid>
        <Row>
          <Col md={2}>
            <this.LeftColumn />
          </Col>
          <Col md={5}>
            <this.MiddleColumn />
          </Col>
          <Col md={5}>
            <this.RightColumn />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default CuneiformFragment
