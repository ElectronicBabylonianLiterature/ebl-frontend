import React, { Component } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import queryString from 'query-string'
import Breadcrumbs from 'common/Breadcrumbs'
import Statistics from './search/Statistics'
import Image from './Image'
import SessionContext from 'auth/SessionContext'
import SearchGroup from './SearchGroup'

import './Fragmentarium.css'

class Fragmentarium extends Component {
  MainHeader = () => {
    return (
      <header>
        <Breadcrumbs section='Fragmentarium' />
        <h2 className='Fragmentarium-header'>Fragmentarium</h2>
      </header>
    )
  }

  render () {
    const number = queryString.parse(this.props.location.search).number
    const transliteration = queryString.parse(this.props.location.search).transliteration
    return (

      <section className='App-content'>
        <this.MainHeader />

        <Container fluid>
          <Row>
            <Col md={6}>
              <SessionContext.Consumer>
                {session => session.isAllowedToReadFragments()
                  ? (
                    <SearchGroup number={number} transliteration={transliteration} />
                  )
                  : <p> Please log in to browse the Fragmentarium. </p>
                }
              </SessionContext.Consumer>
              <Statistics fragmentService={this.props.fragmentService} />
            </Col>
            <Col md={6}>
              <Image fragmentService={this.props.fragmentService} fileName='Babel_Project_01_cropped.svg' />
            </Col>
          </Row>
        </Container>
      </section>
    )
  }
}

export default Fragmentarium
