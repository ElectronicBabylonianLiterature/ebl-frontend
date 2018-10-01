import React, { Component } from 'react'
import queryString from 'query-string'
import Breadcrumbs from 'Breadcrumbs'
import NumberSearchForm from 'fragmentarium/search/NumberSearchForm'
import NumberSearch from 'fragmentarium/search/NumberSearch'
import TransliterationSearchForm from 'fragmentarium/search/TransliterationSearchForm'
import TransliterationSearch from 'fragmentarium/search/TransliterationSearch'
import RandomButton from 'fragmentarium/RandomButton'
import PioneersButton from 'fragmentarium/PioneersButton'
import Statistics from 'fragmentarium/Statistics'

import './Fragmentarium.css'

class Fragmentarium extends Component {
  MainHeader = () => {
    return (
      <header>
        <Breadcrumbs section='Fragmentarium' />
        <h2>Fragmentarium</h2>
      </header>
    )
  }

  SectionHeader = ({ number, transliteration }) => {
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

  render () {
    const number = queryString.parse(this.props.location.search).number
    const transliteration = queryString.parse(this.props.location.search).transliteration
    return (
      <section className='App-content'>
        <this.MainHeader />
        {this.props.fragmentService.isAllowedToRead()
          ? (
            <section className='Fragmentarium-search'>
              <this.SectionHeader number={number} transliteration={transliteration} />
              <NumberSearch number={number} fragmentService={this.props.fragmentService} />
              <TransliterationSearch transliteration={transliteration} fragmentService={this.props.fragmentService} />
            </section>
          )
          : <p>You do not have the rights to access the fragmentarium.</p>
        }
        <Statistics fragmentService={this.props.fragmentService} />
      </section>
    )
  }
}

export default Fragmentarium
