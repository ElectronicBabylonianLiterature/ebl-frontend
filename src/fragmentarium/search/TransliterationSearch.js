import React from 'react'
import _ from 'lodash'

import FragmentList from './FragmentList'
import withData from 'http/withData'

export default withData(
  ({ transliteration, data }) => transliteration
    ? <FragmentList data={data} />
    : null
  ,
  props => `/fragments?transliteration=${encodeURIComponent(props.transliteration)}`,
  {
    shouldUpdate: (prevProps, props) => prevProps.transliteration !== props.transliteration,
    filter: props => !_.isEmpty(props.transliteration),
    defaultData: []
  }
)
