import React from 'react'
import _ from 'lodash'

import FragmentList from 'fragmentarium/ui/FragmentList'
import withData from 'http/withData'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

export default withData<
  {
    id: string | null | undefined
    pages: string | null | undefined
  },
  { fragmentSearchService },
  readonly FragmentInfo[]
>(
  ({ id, pages, data }) =>
    id || pages ? (
      <FragmentList
        fragments={data}
        columns={{
          Accession: 'Accession',
          'CDLI Number': 'cdliNumber',
          Description: 'description',
        }}
      />
    ) : null,
  (props) => props.fragmentSearchService.searchReference(props.id, props.pages),
  {
    watch: (props) => [props.id, props.pages],
    filter: (props) => !_.isEmpty(props.id),
    defaultData: [],
  }
)
