import React, { Component, Fragment } from 'react'
import { Alert, Breadcrumb, Grid, Row, Col } from 'react-bootstrap'

import Spinner from '../Spinner'
import Details from './Details'
import Record from './Record'
import Folio from './Folio'

class CuneiformFragment extends Component {
  state = {
    fragment: null,
    error: null
  }

  get fragment () {
    return this.state.fragment
  }

  get fragmentUrl () {
    return `/fragments/${this.props.match.params.id}`
  }

  get isLoading () {
    return !this.state.fragment && !this.state.error
  }

  componentDidMount () {
    this.props.httpClient
      .fetchJson(this.fragmentUrl)
      .then(json => this.setState({fragment: json, error: null}))
      .catch(error => this.setState({fragment: null, error: error}))
  }

  render () {
    return this.isLoading
      ? <section><Spinner /></section>
      : (
        <section className='Fragment'>
          <header>
            <Breadcrumb separator='/'>
              <Breadcrumb.Item href='/'>eBL</Breadcrumb.Item>
              <Breadcrumb.Item>Fragmentarium</Breadcrumb.Item>
              <Breadcrumb.Item active>{this.props.match.params.id}</Breadcrumb.Item>
            </Breadcrumb>
            {!this.fragment && <h2>{this.props.match.params.id}</h2>}
          </header>
          {this.fragment && <Fragment>
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
                  {this.fragment.cdliNumber && (
                    <img width='20%' src={`https://cdli.ucla.edu/dl/photo/${this.fragment.cdliNumber}.jpg`} alt={`${this.fragment.cdliNumber}.jpg`} />
                  )}
                </Col>
              </Row>
            </Grid>
            {process.env.NODE_ENV === 'development' && <pre>{JSON.stringify(this.state.fragment, null, 2)}</pre>}
          </Fragment>}
          {this.state.error && <Alert bsStyle='danger'>{this.state.error.message}</Alert>}
        </section>
      )
  }
}

export default CuneiformFragment
