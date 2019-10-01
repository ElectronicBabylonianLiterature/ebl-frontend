// @flow
import React from 'react'
import _ from 'lodash'

import withData from '../../http/withData'
import FragmentList from '../FragmentList'
import type { FragmentInfo } from '../fragment'

import './TransliterationSearch.css'

function Lines({ fragment }: { fragment: FragmentInfo }) {
  return (
    <ol className="TransliterationSearch__list">
      {fragment.matchingLines.map((group, index) => (
        <li key={index} className="TransliterationSearch__list_item">
          <ol className="TransliterationSearch__list">
            {group.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  )
}

function TransliterationSearchResult({ data }) {
  return (
    <FragmentList
      fragments={data}
      columns={{
        Script: 'script',
        'Matching lines': fragment => <Lines fragment={fragment} />
      }}
    />
  )
}

export default withData(
  ({ transliteration, data }) =>
    transliteration ? <TransliterationSearchResult data={data} /> : null,
  props =>
    props.fragmentSearchService.searchTransliteration(props.transliteration),
  {
    watch: props => [props.transliteration],
    filter: props => !_.isEmpty(props.transliteration),
    defaultData: []
  }
)
