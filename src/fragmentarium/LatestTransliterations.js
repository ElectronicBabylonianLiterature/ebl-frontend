import React from 'react'
import FragmentList from 'fragmentarium/FragmentList'
import withData from 'http/withData'

function LatestTransliterations ({ data }) {
  return (<>
    <h3>Latest additions:</h3>
    <FragmentList fragments={data} columns={{
      'Accession': 'accession',
      'Script': 'script',
      'Description': 'description'
    }} />
  </>)
}

export default withData(
  LatestTransliterations,
  props => props.fragmentService.fetchLatestTransliterations()
)
