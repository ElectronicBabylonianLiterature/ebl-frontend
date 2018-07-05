import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import Details from './Details'
import Record from './Record'
import Folio from './Folio'
import CdliImage from './CdliImage'

class CuneiformFragment extends Component {
  get fragment () {
    return this.props.fragment
  }

  render () {
    return (
      <Grid>
        <Row>
          <Col md={2}>
            <h2>{this.fragment._id}</h2>
            <Details fragment={this.fragment} />
            <h3>Record</h3>
            <Record record={this.fragment.record} />
          </Col>
          <Col md={5}>
            <p>{this.fragment.description}</p>
            <p>(Publication: {this.fragment.publication || '- '})</p>
            <pre>{this.fragment.transliteration}</pre>
          </Col>
          <Col md={5}>
            <Folio folio={this.fragment.folio} />
            <CdliImage cdliNumber={this.fragment.cdliNumber} />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default CuneiformFragment
