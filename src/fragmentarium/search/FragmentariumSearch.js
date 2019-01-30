import React, { Component } from 'react'
import queryString from 'query-string'
import Breadcrumbs from 'common/Breadcrumbs'
import NumberSearchFormResults from 'fragmentarium/search/NumberSearchFormResults'
import NumberSearch from 'fragmentarium/search/NumberSearch'
import TransliterationSearchFormResults from 'fragmentarium/search/TransliterationSearchFormResults'
import TransliterationSearch from 'fragmentarium/search/TransliterationSearch'
import RandomButton from 'fragmentarium/RandomButton'
import PioneersButton from 'fragmentarium/PioneersButton'

import './FragmentariumSearch.css'

class FragmentariumSearch extends Component {
  MainHeader = () => {
    return (
      <header>
        <Breadcrumbs section='Fragmentarium' active='search' />
        <h2>Search</h2>
      </header>
    )
  }

  SectionHeader = ({ number, transliteration }) => {
    return (
      <header className='FragmentariumSearch-search__header'>
        <NumberSearchFormResults number={number} />
        <TransliterationSearchFormResults transliteration={transliteration} />
        <div className='FragmentariumSearch-search__button-bar'>
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
            <section className='FragmentariumSearch-search'>
              <this.SectionHeader number={number} transliteration={transliteration} />
              <NumberSearch number={number} fragmentService={this.props.fragmentService} />
              <TransliterationSearch transliteration={transliteration} fragmentService={this.props.fragmentService} />
            </section>
          )
          : <p>You do not have the rights to access the fragmentarium.</p>
        }
      </section>
    )
  }
}

export default FragmentariumSearch
