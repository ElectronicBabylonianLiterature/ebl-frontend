import React, { Component, Fragment } from 'react'
import { Alert, Breadcrumb, Grid, Row, Col } from 'react-bootstrap'
import moment from 'moment'

import Spinner from '../Spinner'

class CuneiformFragment extends Component {
  state = {
    fragment: null,
    error: null
  }

  get fragment () {
    return this.state.fragment
  }

  get fragmentUrl () {
    return `${process.env.REACT_APP_DICTIONARY_API_URL}/fragments/${this.props.match.params.id}`
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
                  {this.fragment.museum}<br />
                  ({this.fragment.collection} Collection)<br />
                  Joins: <ul>
                    {this.fragment.joins.map(join =>
                      <li key={join}>{join}</li>
                    )}
                  </ul>
                  {this.fragment.length} x {this.fragment.width} x {this.fragment.thickness} cm<br />
                  CDLI: {this.fragment.cdliNumber}<br />
                  Accession: {this.fragment.accession}
                  <h3>Record</h3>
                  <ol>
                    {this.fragment.record.map((record, index) =>
                      <li key={index}>{record.user} ({record.type}, {moment(record.date).format('D/M/YYYY')})</li>
                    )}
                  </ol>
                </Col>
                <Col md={5}>
                  ({this.fragment.publication})<br />
                  (Publication: {this.fragment.genre})
                  <pre>{this.fragment.transliteration}</pre>
                </Col>
                <Col md={5}>
                  <ul>
                    {this.fragment.folio.map(folio =>
                      <li key={folio}>{folio}</li>
                    )}
                  </ul>
                  {this.fragment.cdliNumber && <img width='20%' src={`https://cdli.ucla.edu/dl/photo/${this.fragment.cdliNumber}.jpg`} />}
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
