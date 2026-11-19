import React from 'react'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  countManuscriptLines,
  pluralize,
  summarizeReconstruction,
  summarizeTranslation,
} from 'corpus/ui/edit-lite/lineSummary'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly line: LineOutline
  readonly isDirty?: boolean
}

function LineSummaryRow({ line, isDirty = false }: Props): JSX.Element {
  return (
    <span className="edit-lite-summary">
      <span className="edit-lite-summary__number">{line.number}</span>
      <span className="edit-lite-summary__text">
        <span className="edit-lite-summary__reconstruction" dir="auto">
          {summarizeReconstruction(line)}
        </span>
        <span className="edit-lite-summary__translation" dir="auto">
          {summarizeTranslation(line)}
        </span>
      </span>
      <span className="edit-lite-summary__badges">
        {line.variants.length > 1 && (
          <span className="edit-lite-badge edit-lite-badge--variants">
            {pluralize(line.variants.length, 'variant')}
          </span>
        )}
        <span className="edit-lite-badge">
          {pluralize(countManuscriptLines(line), 'manuscript')}
        </span>
        {isDirty && (
          <span className="edit-lite-badge edit-lite-badge--edited">
            edited
          </span>
        )}
      </span>
    </span>
  )
}

export default React.memo(LineSummaryRow)
