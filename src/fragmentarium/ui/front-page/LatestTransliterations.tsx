import React from 'react'
import { Link } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryResult } from 'query/QueryResult'
import { FragmentLines } from 'fragmentarium/ui/search/FragmentariumSearchResultComponents'
import { CompactFragmentCard } from 'fragmentarium/ui/front-page/LatestTransliterationCard'

export const LATEST_PREVIEW_COUNT = 5

function LatestTransliterationsPreview({
  data,
  fragmentService,
}: {
  data: QueryResult
  fragmentService: FragmentService
}): JSX.Element {
  const previewItems = data.items.slice(0, LATEST_PREVIEW_COUNT)
  return (
    <section className="latest-additions-preview">
      <Container>
        <div className="latest-additions-preview__header">
          <h2 className="latest-additions-preview__title">Latest Additions</h2>
          <Link
            to="/library"
            className="latest-additions-preview__view-all-btn"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            View all in Library
          </Link>
        </div>
        <div className="latest-additions-preview__list">
          {previewItems.map((queryItem) => (
            <CompactFragmentCard
              key={queryItem.museumNumber}
              queryItem={queryItem}
              fragmentService={fragmentService}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}

function LatestTransliterationsAll({
  data,
  fragmentService,
  dossiersService,
}: {
  data: QueryResult
  fragmentService: FragmentService
  dossiersService: DossiersService
}): JSX.Element {
  return (
    <section className="library-latest">
      <h2 className="library-latest__title">Latest Additions</h2>
      <div className="library-latest__list">
        {data.items.map((fragment) => (
          <div key={fragment.museumNumber} className="library-fragment-card">
            <FragmentLines
              fragmentService={fragmentService}
              dossiersService={dossiersService}
              queryItem={fragment}
              linesToShow={3}
              includeLatestRecord={true}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default withData<
  {
    fragmentService: FragmentService
    dossiersService: DossiersService
    preview?: boolean
  },
  unknown,
  QueryResult
>(
  ({ data, fragmentService, dossiersService, preview }): JSX.Element => {
    if (preview) {
      return (
        <LatestTransliterationsPreview
          data={data}
          fragmentService={fragmentService}
        />
      )
    }
    return (
      <LatestTransliterationsAll
        data={data}
        fragmentService={fragmentService}
        dossiersService={dossiersService}
      />
    )
  },
  (props) => props.fragmentService.queryLatest(),
)
