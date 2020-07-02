import React from 'react'
import _ from 'lodash'

import FragmentList from 'fragmentarium/ui/FragmentList'
import withData from 'http/withData'
import Reference from '../../../bibliography/domain/Reference'
import ReferenceList from '../../../bibliography/ui/ReferenceList'
import BibliographyEntry from '../../../bibliography/domain/BibliographyEntry'
import { FragmentInfo } from '../../domain/fragment'

function ReferenceSearchResult({ data }) {
  function makeReferences(data) {
    const references: Reference[] = []
    for (const i of data.references) {
      const ref = new Reference(
        i.type || Reference.DEFAULT_TYPE,
        i.pages || '',
        i.notes || '',
        i.linesCited || [],
        new BibliographyEntry(i.document)
      )
      references.push(ref)
    }
    data.references = references
    return <ReferenceList references={data.references} />
  }
  return (
    <FragmentList
      fragments={data}
      columns={{
        References: (data) => makeReferences(data),
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
