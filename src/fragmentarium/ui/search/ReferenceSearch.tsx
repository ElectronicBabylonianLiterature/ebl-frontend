import React from 'react'
import _ from 'lodash'

import FragmentList from 'fragmentarium/ui/FragmentList'
import withData from 'http/withData'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

function References({
  references,
  referencesKey,
}: {
  references: ReadonlyArray<any>
  referencesKey: string
}) {
  return (
    <ul className="list-unstyled">
      {references.map((reference, index) => (
        <ul key={index}>{reference[referencesKey]}</ul>
      ))}
    </ul>
  )
}

function ReferenceSearchResult({ data }) {
  function makeReferences(fragment, key) {
    return (
      <References
        references={fragment.references}
        referencesKey={key}
      ></References>
    )
  }
  return (
    <FragmentList
      fragments={data}
      columns={{
        'References.Id': (data) => makeReferences(data, 'id'),
        'References.Pages': (data) => makeReferences(data, 'pages'),
        Description: 'description',
      }}
    />
  )
}

export default withData<
  {
    id: string | null | undefined
    pages: string | null | undefined
  },
  { fragmentSearchService },
  readonly FragmentInfo[]
>(
  ({ id, pages, data }) =>
    id || pages ? <ReferenceSearchResult data={data} /> : null,
  (props) => props.fragmentSearchService.searchReference(props.id, props.pages),
  {
    watch: (props) => [props.id, props.pages],
    filter: (props) => !_.isEmpty(props.id),
    defaultData: [],
  }
)
