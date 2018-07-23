import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Breadcrumbs from 'Breadcrumbs'
import Error from 'Error'
import Spinner from 'Spinner'

import './Fragmentarium.css'

class Fragmentarium extends Component {
  state = {
    statistics: null,
    error: null
  }

  get isLoading () {
    return !this.state.statistics && !this.state.error
  }

  componentDidMount () {
    this.fetchStatistics()
  }

  fetchStatistics = () => {
    this.setState({statistics: null, error: null})
    this.props.apiClient
      .fetchJson('/statistics', false)
      .then(json => this.setState({statistics: json, error: null}))
      .catch(error => this.setState({statistics: null, error: error}))
  }

  header = () => {
    return (
      <header>
        <Breadcrumbs section='Fragmentarium' />
        <h2>Fragmentarium<br /><small><Link to='/fragmentarium/K.1'>Go to the fragments...</Link></small></h2>
      </header>
    )
  }

  render () {
    return (
      <section className='App-content'>
        <this.header />
        <Grid fluid>
          <Row>
            <Col md={7} className='Fragmentarium__statistics'>
              Current size of the corpus:
              {this.isLoading && <section><Spinner /></section>}
              {this.state.statistics && <p className='Fragmentarium__statistics-values'>
                {this.state.statistics.transliteratedFragments.toLocaleString()} tablets transliterated<br />
                {this.state.statistics.lines.toLocaleString()} lines of text
              </p>}
            </Col>
            <Col md={5}>
              <blockquote className='Fragmentarium__quote'>
                “Give me your tired, your poor, Your huddled masses Yearning to breathe free”
              </blockquote>
            </Col>
          </Row>
        </Grid>
        <Error error={this.state.error} />
      </section>
    )
  }
}

export default Fragmentarium
