import React from 'react'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryResult } from 'query/QueryResult'
import { FragmentLines } from 'fragmentarium/ui/search/FragmentariumSearchResultComponents'

function LatestTransliterations({
  data,
  fragmentService,
  dossiersService,
}: {
  data: QueryResult
  fragmentService: FragmentService
  dossiersService: DossiersService
}) {
  return (
    <section>
      <h3 className="SubsectionHeading--indented">Latest additions:</h3>
      {data.items.map((fragment, index) => (
        <React.Fragment key={index}>
          <FragmentLines
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={fragment}
            linesToShow={3}
            includeLatestRecord={true}
          />
        </React.Fragment>
      ))}
    </section>
  )
}

export default withData<
  {
    fragmentService: FragmentService
    dossiersService: DossiersService
  },
  unknown,
  QueryResult
>(
  ({ data, fragmentService, dossiersService }): JSX.Element => {
    return (
      <LatestTransliterations
        data={data}
        fragmentService={fragmentService}
        dossiersService={dossiersService}
      />
    )
  },
  (props) => props.fragmentService.queryLatest(),
)
