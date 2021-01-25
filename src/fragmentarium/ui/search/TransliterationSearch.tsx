import React from 'react'
import _ from 'lodash'

import withData from 'http/withData'
import FragmentList from 'fragmentarium/ui/FragmentList'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

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

function TransliterationSearchResult({
  fragmentInfos,
}: {
  fragmentInfos: readonly FragmentInfo[]
}) {
  function makeLine(fragment: FragmentInfo) {
    return <Lines fragment={fragment} />
  }
  return (
    <FragmentList
      fragments={fragmentInfos}
      columns={{
        Script: 'script',
        'Matching lines': makeLine,
      }}
    />
  )
}

export default withData<
  { transliteration: string | null | undefined },
  { fragmentSearchService },
  readonly FragmentInfo[]
>(
  ({ transliteration, data }) =>
    transliteration ? (
      <TransliterationSearchResult fragmentInfos={data} />
    ) : null,
  (props) =>
    props.fragmentSearchService.searchTransliteration(props.transliteration),
  {
    watch: (props) => [props.transliteration],
    filter: (props) => !_.isEmpty(props.transliteration),
    defaultData: [],
  }
)
