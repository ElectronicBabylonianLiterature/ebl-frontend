import React from 'react'
import type { ChapterMatchState } from './useCorpusChapterMatches'

export default function CorpusMatchStatus({
  state,
  total,
}: {
  state: ChapterMatchState
  total: number
}): JSX.Element {
  const status = state.loading
    ? 'Loading more matches'
    : state.expanded
      ? `Showing ${Math.min(state.loadedPairs, total)} of ${total} matches`
      : ''
  return (
    <span role="status" className="visually-hidden">
      {status}
    </span>
  )
}
