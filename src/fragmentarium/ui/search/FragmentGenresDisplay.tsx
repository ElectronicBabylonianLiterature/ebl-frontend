import React from 'react'
import { Genres } from 'fragmentarium/domain/Genres'

export default function FragmentGenresDisplay({
  genres,
}: {
  genres: Genres
}): JSX.Element {
  return (
    <ul>
      {genres.genres.map((genreItem, index) => (
        <ul key={index}>
          <small>{genreItem.toString()}</small>
        </ul>
      ))}
    </ul>
  )
}
