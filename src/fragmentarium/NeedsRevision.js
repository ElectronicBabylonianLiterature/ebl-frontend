import React from 'react'
import FragmentList from 'fragmentarium/FragmentList'
import withData from 'http/withData'

function NeedsRevision({ data }) {
  return (
    <section>
      <h3 className="SubsectionHeading--indented">Needs revision:</h3>
      <FragmentList
        fragments={data}
        columns={{
          Accession: 'accession',
          Editor: 'editor',
          Description: 'description'
        }}
      />
    </section>
  )
}

export default withData(NeedsRevision, props =>
  props.fragmentSearchService.fetchNeedsRevision()
)
