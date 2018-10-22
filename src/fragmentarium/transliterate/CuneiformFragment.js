import React, { Component, Fragment } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Folios from './Folios'
import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/PioneersButton'

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

  MiddleColumn = () => (
    <Fragment>
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
    </Fragment>
  )

  RightColumn = () => (
    <Folios
      fragment={this.fragment}
      fragmentService={this.props.fragmentService}
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
