import React from 'react'
import FragmentList from 'fragmentarium/ui/FragmentList'
import withData from 'http/withData'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

function LatestTransliterations({ data }) {
  return (
    <section>
      <h3 className="SubsectionHeading--indented">Latest additions:</h3>
      <FragmentList
        fragments={data}
        columns={{
          Accession: 'accession',
          Script: 'script',
          Description: 'description',
        }}
      />
    </section>
  )
}

export default withData<{}, { fragmentSearchService }, readonly FragmentInfo[]>(
  LatestTransliterations,
  (props) => props.fragmentSearchService.fetchLatestTransliterations()
)
