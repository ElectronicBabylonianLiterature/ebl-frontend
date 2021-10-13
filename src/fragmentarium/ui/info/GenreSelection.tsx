import { Fragment } from 'fragmentarium/domain/fragment'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Button, Overlay, Popover } from 'react-bootstrap'
import Select from 'react-select'
import classNames from 'classnames'
import { usePrevious } from 'common/usePrevious'
import withData from 'http/withData'
import { Genre, Genres } from 'fragmentarium/domain/Genres'
import _ from 'lodash'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'

type Props = {
  fragment: Fragment
  updateGenres: (genres: Genres) => void
  genreOptions: readonly string[][]
}

function GenreSelection({
  fragment,
  updateGenres,
  genreOptions,
}: Props): JSX.Element {
  const [selected, setSelected] = useState<Genre | undefined>(undefined)
  const [genres, setGenres] = useState(fragment.genres)
  const prevGenres = usePrevious(genres)
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [isUncertain, setIsUncertain] = useState(false)
  const target = useRef(null)

  function handleChange(event) {
    const genre = new Genre(event.value, false)
    setSelected(genre)
    if (!genres.isPresent(genre)) {
      setGenres((genres) => genres.insertWithOrder(genre, genreOptions))
    } else {
      const retrievedGenre = genres.find(genre) as Genre
      setSelected(retrievedGenre)
      setIsUncertain(retrievedGenre.uncertain)
    }
  }

  useEffect(() => {
    if (!_.isEqual(genres, prevGenres) && !_.isNil(prevGenres)) {
      updateGenres(genres)
    }
  }, [genres, prevGenres, updateGenres])

  function toggleUncertain() {
    if (selected) {
      setIsUncertain(!isUncertain)
      setGenres(genres.replace(selected.setUncertain(!selected.uncertain)))
      setIsDisplayed(false)
    }
  }

  const options = genreOptions.map((genreItem: string[]) => {
    return {
      value: genreItem,
      label: genreItem.join(' ➝ '),
    }
  })

  const popover = (
    <Popover
      style={{ maxWidth: '600px' }}
      id="popover-select-genre"
      className={'w-100'}
    >
      <Popover.Content>
        <Select
          aria-label="select-genre"
          options={options}
          onChange={(event) => handleChange(event)}
          isSearchable={true}
          autoFocus={true}
        />
        <div
          style={{
            color: 'hsl(0, 0%, 40%)',
            display: 'inline-block',
            fontSize: 12,
            fontStyle: 'italic',
            marginTop: '1em',
            marginLeft: '0.2em',
          }}
        >
          <input
            type="checkbox"
            checked={isUncertain}
            onChange={toggleUncertain}
          />
          &nbsp;Uncertain
        </div>
      </Popover.Content>
    </Popover>
  )

  return (
    <div>
      Genres:
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToTransliterateFragments() && (
            <Button
              aria-label="Browse genres button"
              variant="light"
              ref={target}
              className={classNames(['float-right', 'far fa-edit', 'mh-100'])}
              onClick={() => setIsDisplayed(true)}
            />
          )
        }
      </SessionContext.Consumer>
      <Overlay
        target={target.current}
        placement="right"
        show={isDisplayed}
        rootClose={true}
        rootCloseEvent={'click'}
        onHide={() => {
          setIsDisplayed(false)
          setSelected(undefined)
          setIsUncertain(false)
        }}
      >
        {popover}
      </Overlay>
      <ul className={classNames(['list-group', 'mt-2'])}>
        {genres.genres.map((genreItem) => {
          const uncertain = genreItem.uncertain ? '(?)' : ''
          return (
            <li className="list-group-item" key={genreItem.toString}>
              {`${genreItem.category.join(' ➝ ')} ${uncertain}`}
              <SessionContext.Consumer>
                {(session: Session): ReactNode =>
                  session.isAllowedToTransliterateFragments() && (
                    <Button
                      variant="light"
                      aria-label="Delete genre button"
                      className={classNames([
                        'float-right',
                        'fas fa-trash',
                        'align-top',
                      ])}
                      onClick={() => setGenres(genres.delete(genreItem))}
                    />
                  )
                }
              </SessionContext.Consumer>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default withData<
  { fragment: Fragment; updateGenres: (genres: Genres) => void },
  { fragmentService },
  readonly string[][]
>(
  ({ fragment, updateGenres, data }) => (
    <GenreSelection
      fragment={fragment}
      updateGenres={updateGenres}
      genreOptions={data}
    />
  ),
  (props) => props.fragmentService.fetchGenres()
)
