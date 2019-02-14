import React, { Component } from 'react'
import queryString from 'query-string'
import Breadcrumbs from 'common/Breadcrumbs'
import NumberSearch from 'fragmentarium/search/NumberSearch'
import TransliterationSearch from 'fragmentarium/search/TransliterationSearch'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/SearchGroup'

import 'fragmentarium/Fragmentarium.css'

class FragmentariumSearch extends Component {
  MainHeader = () => {
    return (
      <header>
        <Breadcrumbs section='Fragmentarium' active='Search' />
        <h2>Search</h2>
      </header>
    )
  }

  render () {
    const number = queryString.parse(this.props.location.search).number
    const transliteration = queryString.parse(this.props.location.search).transliteration
    return (
      <section className='App-content'>
        <this.MainHeader />
        <SessionContext.Consumer>
          {session => session.isAllowedToReadFragments()
            ? (
              <section className='Fragmentarium-search'>
                <header className='Fragmentarium-search__header'>
                  <SearchGroup number={number} transliteration={transliteration} fragmentService={this.props.fragmentService} />
                </header>
                <NumberSearch number={number} fragmentService={this.props.fragmentService} />
                <TransliterationSearch transliteration={transliteration} fragmentService={this.props.fragmentService} />
              </section>
            )
            : <p>Please log in to browse the Fragmentarium.</p>
          }
        </SessionContext.Consumer>
      </section>
    )
  }
}

export default FragmentariumSearch
