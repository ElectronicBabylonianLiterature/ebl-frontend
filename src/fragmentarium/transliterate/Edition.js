import React, { Component, Fragment } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import Folios from './Folios'
import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/PioneersButton'

import './Edition.css'

class Edition extends Component {
  get fragment () {
    return this.props.fragment
  }

  LeftColumn = () => (
    <Fragment>
      <p className='Edition__description'>
        {this.fragment.description}
      </p>
      <p className='Edition__publication'>
        (Publication: {this.fragment.publication || '- '})
      </p>
      <TransliteratioForm
        number={this.fragment._id}
        transliteration={this.fragment.atf}
        notes={this.fragment.notes}
        fragmentService={this.props.fragmentService}
        onChange={this.props.onChange}
        auth={this.props.auth} />
      <p className='Edition__navigation'>
        <PioneersButton auth={this.props.auth} fragmentService={this.props.fragmentService} />
      </p>
    </Fragment>
  )

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
          <Col md={6}>
            <this.LeftColumn />
          </Col>
          <Col md={6}>
            <this.RightColumn />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default Edition
