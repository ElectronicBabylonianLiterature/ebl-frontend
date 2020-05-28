import React from 'react'
import _ from 'lodash'

import FragmentList from 'fragmentarium/ui/FragmentList'
import withData from 'http/withData'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

export default withData<
  {
    id: string | null | undefined
    page: string | null | undefined
  },
  { fragmentSearchService },
  readonly FragmentInfo[]
>(
  ({ id, page, data }) =>
    id || page ? (
      <FragmentList
        fragments={data}
        columns={{
          Accession: 'Accession',
          'CDLI Number': 'cdliNumber',
          Description: 'description',
        }}
      />
    ) : null,
  (props) => props.fragmentSearchService.searchReference(props.page),
  {
    watch: (props) => [props.page],
    filter: (props) => !_.isEmpty(props.page),
    defaultData: [],
  }
)
