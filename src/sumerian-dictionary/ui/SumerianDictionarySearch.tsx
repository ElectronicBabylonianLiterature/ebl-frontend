import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import withData from 'http/withData'
import usePromiseEffect from 'common/hooks/usePromiseEffect'
import ErrorAlert from 'common/errors/ErrorAlert'
import Spinner from 'common/ui/Spinner'
import SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import {
  sumerianSearchPageSize,
  SumerianSearchResult,
  SumerianWordSummary,
} from 'sumerian-dictionary/domain/SumerianWordSummary'
import { formatCount } from 'sumerian-dictionary/domain/sumerianWordHelpers'
import { SumerianSearchState } from 'sumerian-dictionary/ui/sumerianDictionaryPage'
import SumerianDictionaryResultsList from 'sumerian-dictionary/ui/SumerianDictionaryResultsList'

interface SearchProps {
  state: SumerianSearchState
  sumerianDictionaryService: SumerianDictionaryService
}

function searchPage(
  { state, sumerianDictionaryService }: SearchProps,
  offset: number,
  signal: AbortSignal,
): Promise<SumerianSearchResult> {
  return sumerianDictionaryService.search(
    { ...state, limit: sumerianSearchPageSize, offset },
    signal,
  )
}

function SearchResults({
  data,
  ...props
}: SearchProps & { data: SumerianSearchResult }): JSX.Element {
  const [more, setMore] = useState<readonly SumerianWordSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [run] = usePromiseEffect()
  const entries = [...data.entries, ...more]
  const remaining = data.total - entries.length

  function showMore(): void {
    setLoading(true)
    setError(null)
    run((signal) =>
      searchPage(props, entries.length, signal).then((result) => {
        setMore((previous) => [...previous, ...result.entries])
        setLoading(false)
      }),
    ).catch((searchError: Error) => {
      setError(searchError)
      setLoading(false)
    })
  }

  if (data.total === 0) {
    return <p>No results found.</p>
  }
  return (
    <>
      <p className="SumerianDictionary__results-header">
        {formatCount(data.total)} {data.total === 1 ? 'lemma' : 'lemmas'}
      </p>
      <SumerianDictionaryResultsList summaries={entries} />
      <ErrorAlert error={error} />
      {remaining > 0 && (
        <div className="SumerianDictionary__more">
          {loading ? (
            <Spinner />
          ) : (
            <Button variant="outline-primary" onClick={showMore}>
              Show more ({formatCount(remaining)} left)
            </Button>
          )}
        </div>
      )}
    </>
  )
}

export default withData<SearchProps, unknown, SumerianSearchResult>(
  SearchResults,
  (props, signal) => searchPage(props, 0, signal),
  {
    watch: ({ state }) => [state.query, state.kind, state.source],
  },
)
