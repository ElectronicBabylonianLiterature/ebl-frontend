import { FragmentInfo } from '../../domain/fragment'
import FragmentList from '../FragmentList'
import withData from '../../../http/withData'
import _ from 'lodash'
import React from 'react'

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

function FragmentariumSearchResult({
  fragmentInfos,
}: {
  fragmentInfos: readonly FragmentInfo[]
}) {
  function makeLine(fragment: FragmentInfo) {
    return <Lines fragment={fragment} />
  }
  console.log('')
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
  {
    number: string | null | undefined
    transliteration: string | null | undefined
    id: string | null | undefined
    pages: string | null | undefined
  },
  { fragmentSearchService },
  readonly FragmentInfo[]
>(
  ({ data }) => <FragmentariumSearchResult fragmentInfos={data} />,
  (props) =>
    props.fragmentSearchService.searchFragmentarium(
      props.number,
      props.transliteration,
      props.id,
      props.pages
    ),
  {
    watch: (props) => [
      props.number,
      props.transliteration,
      props.id,
      props.pages,
    ],
    filter: (props) =>
      !_.isEmpty(props.number) || !_.isEmpty(props.transliteration),
    defaultData: [],
  }
)
