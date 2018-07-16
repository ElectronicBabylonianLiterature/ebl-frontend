import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import Details from './Details'
import Record from './Record'
import OrganizationLinks from './OrganizationLinks'
import Folio from './Folio'
import TransliteratioForm from './TransliterationForm'

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
            <h3>Record</h3>
            <Record record={this.fragment.record} />
            <OrganizationLinks
              cdliNumber={this.fragment.cdliNumber}
              bmIdNumber={this.fragment.bmIdNumber} />
          </Col>
          <Col md={5}>
            <p>{this.fragment.description}</p>
            <p>(Publication: {this.fragment.publication || '- '})</p>
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
