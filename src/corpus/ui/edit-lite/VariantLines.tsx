import React, { useMemo } from 'react'
import AccordionLines from 'corpus/ui/edit-lite/AccordionLines'
import { EditLiteParameters } from 'corpus/ui/edit-lite/editLiteParameters'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import PagedLines, { findLineIndex } from 'corpus/ui/edit-lite/PagedLines'
import ScoreLines from 'corpus/ui/edit-lite/ScoreLines'
import SplitLines from 'corpus/ui/edit-lite/SplitLines'

interface Props {
  readonly state: EditLiteState
  readonly parameters: EditLiteParameters
}

export default function VariantLines({
  state,
  parameters,
}: Props): JSX.Element {
  const { variant, line, size } = parameters
  const lines = state.outline.lines
  const initialLine = useMemo<number | undefined>(() => {
    const index = line === null ? -1 : findLineIndex(lines, line)
    return index < 0 ? undefined : index
  }, [lines, line])

  switch (variant) {
    case 'pages':
      return (
        <PagedLines
          state={state}
          initialLine={initialLine}
          initialPageSize={size}
        />
      )
    case 'split':
      return <SplitLines state={state} initialLine={initialLine} />
    case 'score':
      return <ScoreLines state={state} />
    default:
      return <AccordionLines state={state} initialLine={initialLine} />
  }
}
