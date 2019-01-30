import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'
import queryString from 'query-string'
import Breadcrumbs from 'common/Breadcrumbs'
import NumberSearchForm from './search/NumberSearchForm'
import TransliterationSearchForm from './search/TransliterationSearchForm'
import RandomButton from './RandomButton'
import PioneersButton from './PioneersButton'
import Statistics from './search/Statistics'
import Image from './Image'

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

  LeftColumn = ({ number, transliteration }) => {
    return (
      <header className='Fragmentarium-search__header'>
        <NumberSearchForm number={number} />
        <TransliterationSearchForm transliteration={transliteration} />
        <div className='Fragmentarium-search__button-bar'>
          <RandomButton fragmentService={this.props.fragmentService} method='random'>
            I'm feeling lucky
          </RandomButton>
          {' '}
          <PioneersButton fragmentService={this.props.fragmentService} />
        </div>
      </header>
    )
  }

  RightColumn = () => {
    return <Image
      fragmentService={this.props.fragmentService} />
  }

  render () {
    const number = queryString.parse(this.props.location.search).number
    const transliteration = queryString.parse(this.props.location.search).transliteration
    return (

      <section className='App-content'>
        <this.MainHeader />
        {this.props.fragmentService.isAllowedToRead()

          ? (
            <Grid fluid>
              <Row>
                <Col md={6}>
                  <this.LeftColumn number={number} transliteration={transliteration} />
                  <Statistics fragmentService={this.props.fragmentService} />
                </Col>
                <Col md={6}>
                  <this.RightColumn />
                </Col>
              </Row>
            </Grid>
          )
          : <>
            <p>You do not have the rights to access the fragmentarium.</p>
            <Statistics fragmentService={this.props.fragmentService} />
          </>
        }
      </section>
    )
  }
}

export default Fragmentarium
