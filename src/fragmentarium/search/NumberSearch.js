import React from 'react'
import _ from 'lodash'

import FragmentList from './FragmentList'
import withData from 'http/withData'

export default withData(
  ({ number, data }) => number
    ? <FragmentList fragments={data} />
    : null
  ,
  props => props.fragmentService.searchNumber(props.number),
  {
    shouldUpdate: (prevProps, props) => prevProps.number !== props.number,
    filter: props => !_.isEmpty(props.number),
    defaultData: []
  }
)
