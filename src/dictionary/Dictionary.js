import React, { Component } from 'react'

import WordSearch from './WordSearch'
import Word from './Word'

class Dictionary extends Component {
  render () {
    return (
      <div>
        <WordSearch />
        <Word value={{source: '**lemma**, *form* "meaning" \\[LOGOGRAM\\] **G** (*a*/*u*) \\> derived'}} />
      </div>
    )
  }
}

export default Dictionary
