import React from 'react'
import _ from 'lodash'

import FragmentList from 'fragmentarium/FragmentList'
import withData from 'http/withData'

export default withData(
  ({ number, data }) =>
    number ? (
      <FragmentList
        fragments={data}
        columns={{
          Accession: 'Accession',
          'CDLI Number': 'cdliNumber',
          Description: 'description'
        }}
      />
    ) : null,
  props => props.fragmentSearchService.searchNumber(props.number),
  {
    watch: props => [props.number],
    filter: props => !_.isEmpty(props.number),
    defaultData: []
  }
)
