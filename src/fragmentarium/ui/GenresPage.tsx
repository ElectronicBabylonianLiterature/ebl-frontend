import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Markdown } from 'common/ui/Markdown'

function GenresIntroduction(): JSX.Element {
  return (
    <Markdown
      className="genres-page__introduction"
      text="The eBL genre taxonomy was initially developed by B. Schnitzlein,
      building on a pre-existing collection compiled by J. Taylor. First released in 2021
      as part of the project “Reading the Library of Ashurbanipal: A Multi-sectional Analysis
      of Assyriology's Foundational Corpus” (DFG/AHRC, 2019–2026), it was subsequently reviewed
      by W. Sallaberger, E. Jiménez, and the eBL team. It now underpins the classification of
      all Library manuscripts and has been refined through years of iterative use."
    />
  )
}

function GenreTree({ genres }: { genres: string[][] }): JSX.Element {
  const grouped = _.groupBy(genres, (genre) => genre[0])

  return (
    <div className="genres-page__tree">
      {Object.entries(grouped).map(([topLevel, genreItems]) => {
        const subItems = genreItems.filter((genre) => genre.length > 1)
        return (
          <div key={topLevel} className="genres-page__category">
            <h4 className="genres-page__category-title">{topLevel}</h4>
            {subItems.length > 0 && (
              <ul className="genres-page__subcategory-list">
                {subItems.map((genre) => (
                  <li
                    key={genre.join(' ')}
                    className="genres-page__subcategory-item"
                  >
                    {genre.slice(1).join(' \u279d ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

const GenresContentWithData = withData<
  object,
  { fragmentService: FragmentService },
  string[][]
>(
  ({ data }) => <GenreTree genres={data} />,
  (props) => props.fragmentService.fetchGenres(),
)

export default function GenresPage({
  fragmentService,
}: {
  fragmentService: FragmentService
}): JSX.Element {
  return (
    <>
      <GenresIntroduction />
      <GenresContentWithData fragmentService={fragmentService} />
    </>
  )
}
