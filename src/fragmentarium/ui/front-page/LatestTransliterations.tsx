import React from 'react'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryResult } from 'query/QueryResult'
import { FragmentLines } from '../search/FragmentariumSearchResult'

function LatestTransliterations({
  data,
  fragmentService,
}: {
  data: QueryResult
  fragmentService: FragmentService
}) {
  return (
    <section>
      <h3 className="SubsectionHeading--indented">Latest additions:</h3>
      {data.items.map((fragment, index) => (
        <React.Fragment key={index}>
          <FragmentLines
            fragmentService={fragmentService}
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
  },
  unknown,
  QueryResult
>(
  ({ data, fragmentService }): JSX.Element => {
    return (
      <LatestTransliterations data={data} fragmentService={fragmentService} />
    )
  },
  (props) => props.fragmentService.query({ latest: true })
)
