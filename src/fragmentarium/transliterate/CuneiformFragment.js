import React, { Component, Fragment } from 'react'
import { Grid, Row, Col, Tabs, Tab } from 'react-bootstrap'
import _ from 'lodash'

import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Folios from './Folios'
import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/PioneersButton'
import Lemmatizer from 'fragmentarium/lemmatization/Lemmatizer'

import './CuneiformFragment.css'

class CuneiformFragment extends Component {
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
    const lemmatizationDisabled = _.isEmpty(this.fragment.lemmatization) || !this.props.fragmentService.isAllowedToLemmatize()
    return (
      <Tabs id='fragment-container'>
        <Tab eventKey={1} title='Edition'>
          <p className='CuneifromFragment__description'>
            {this.fragment.description}
          </p>
          <p className='CuneifromFragment__publication'>
            (Publication: {this.fragment.publication || '- '})
          </p>
          <TransliteratioForm
            number={this.fragment._id}
            transliteration={this.fragment.transliteration}
            notes={this.fragment.notes}
            fragmentService={this.props.fragmentService}
            onChange={this.props.onChange}
            auth={this.props.auth} />
          <p className='CuneifromFragment__navigation'>
            <PioneersButton auth={this.props.auth} fragmentService={this.props.fragmentService} />
          </p>
        </Tab>
        <Tab eventKey={2} title='Lemmatization' disabled={lemmatizationDisabled}>
          <Lemmatizer
            fragmentService={this.props.fragmentService}
            number={this.fragment._id}
            text={this.fragment.text} />
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
