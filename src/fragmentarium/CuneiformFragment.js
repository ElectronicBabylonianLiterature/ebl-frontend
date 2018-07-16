import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Folio from './Folio'
import TransliteratioForm from './TransliterationForm'

import './CuneiformFragment.css'

class CuneiformFragment extends Component {
  get fragment () {
    return this.props.fragment
  }

  render () {
    return (
      <Grid fluid>
        <Row>
          <Col md={2}>
            <Details fragment={this.fragment} />
            <Record record={this.fragment.record} />
            <OrganizationLinks
              cdliNumber={this.fragment.cdliNumber}
              bmIdNumber={this.fragment.bmIdNumber} />
          </Col>
          <Col md={5}>
            <p className='CuneifromFragment__description'>{this.fragment.description}</p>
            <p className='CuneifromFragment__publication'>
              (Publication: {this.fragment.publication || '- '})
            </p>
            <TransliteratioForm
              number={this.fragment._id}
              transliteration={this.fragment.transliteration}
              notes={this.fragment.notes}
              apiClient={this.props.apiClient}
              onChange={this.props.onChange} />
          </Col>
          <Col md={5}>
            <Folio
              folio={this.fragment.folio}
              apiClient={this.props.apiClient}
              cdliNumber={this.fragment.cdliNumber} />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default CuneiformFragment
