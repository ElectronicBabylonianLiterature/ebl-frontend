import { FragmentInfo } from '../../domain/fragment'
import FragmentList from '../FragmentList'
import withData from '../../../http/withData'
import _ from 'lodash'
import React from 'react'
import ReferenceList from '../../../bibliography/ui/ReferenceList'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

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
  function makeReferences(data: FragmentInfo) {
    return <ReferenceList references={data.references} />
  }
  return (
    <FragmentList
      fragments={fragmentInfos}
      columns={{
        Script: 'script',
        References: (fragmentInfo) => makeReferences(fragmentInfo),
        'Matching lines': makeLine,
        Description: 'description',
        Genre: 'genre',
      }}
    />
  )
}

export default withData<
  {
    number: string
    transliteration: string
    bibliographyId: string
    pages: string
  },
  { fragmentSearchService: FragmentSearchService },
  readonly FragmentInfo[]
>(
  ({ data }) => <FragmentariumSearchResult fragmentInfos={data} />,
  (props) =>
    props.fragmentSearchService.searchFragmentarium(
      props.number,
      props.transliteration,
      props.bibliographyId,
      props.pages
    ),
  {
    watch: (props) => [
      props.number,
      props.transliteration,
      props.bibliographyId,
      props.pages,
    ],
    filter: (props) =>
      !_.isEmpty(props.number) ||
      !_.isEmpty(props.transliteration) ||
      !_.isEmpty(props.bibliographyId),
    defaultData: [],
  }
)
