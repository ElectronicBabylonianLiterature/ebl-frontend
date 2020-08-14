import React from 'react'
import FragmentList from 'fragmentarium/ui/FragmentList'
import withData from 'http/withData'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import Promise from 'bluebird'

function NeedsRevision({ data }: { data: readonly FragmentInfo[] }) {
  return (
    <section>
      <h3 className="SubsectionHeading--indented">Needs revision:</h3>
      <FragmentList
        fragments={data}
        columns={{
          Accession: 'accession',
          Editor: 'editor',
          Description: 'description',
        }}
      />
    </section>
  )
}

export default withData<
  unknown,
  {
    fragmentSearchService: {
      fetchNeedsRevision: () => Promise<readonly FragmentInfo[]>
    }
  },
  readonly FragmentInfo[]
>(NeedsRevision, (props) => props.fragmentSearchService.fetchNeedsRevision())
