import React, { Component, Fragment } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Folios from './Folios'
import TransliteratioForm from './TransliterationForm'

import './CuneiformFragment.css'

class CuneiformFragment extends Component {
  get fragment () {
    return this.props.fragment
  }

  leftColumn = () => (
    <Fragment>
      <Details fragment={this.fragment} />
      <Record record={this.fragment.record} />
      <OrganizationLinks
        cdliNumber={this.fragment.cdliNumber}
        bmIdNumber={this.fragment.bmIdNumber} />
    </Fragment>
  )

  middleColumn = () => (
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
        apiClient={this.props.apiClient}
        onChange={this.props.onChange}
        auth={this.props.auth} />
    </Fragment>
  )

  rightColumn = () => (
    <Folios
      folios={this.fragment.folios}
      apiClient={this.props.apiClient}
      cdliNumber={this.fragment.cdliNumber} />
  )

  render () {
    return (
      <Grid fluid>
        <Row>
          <Col md={2}>
            <this.leftColumn />
          </Col>
          <Col md={5}>
            <this.middleColumn />
          </Col>
          <Col md={5}>
            <this.rightColumn />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default CuneiformFragment
