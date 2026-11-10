import React from 'react'
import { Genres } from 'fragmentarium/domain/Genres'

export default function FragmentGenresDisplay({
  genres,
}: {
  genres: Genres
}): JSX.Element {
  return (
    <ul className="list-unstyled">
      {genres.genres.map((genreItem, index) => (
        <li key={index}>
          <small>{genreItem.toString()}</small>
        </li>
      ))}
    </ul>
  )
}
