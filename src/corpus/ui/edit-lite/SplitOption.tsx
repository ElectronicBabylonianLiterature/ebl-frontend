import React from 'react'
import classNames from 'classnames'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import { LineState } from 'corpus/ui/edit-lite/editLiteState'
import { hasLineFailed } from 'corpus/ui/edit-lite/lineStates'
import LineSummaryRow from 'corpus/ui/edit-lite/LineSummaryRow'
import 'corpus/ui/edit-lite/SplitLines.sass'

interface Props {
  readonly id: string
  readonly line: LineOutline
  readonly lineState: LineState | undefined
  readonly isSelected: boolean
  readonly isNew?: boolean
  readonly onSelect: (index: number) => void
}

function SplitOption({
  id,
  line,
  lineState,
  isSelected,
  isNew = false,
  onSelect,
}: Props): JSX.Element {
  return (
    <li
      id={id}
      className={classNames('edit-lite-split__option', {
        'edit-lite-split__option--selected': isSelected,
      })}
      role="option"
      aria-selected={isSelected}
      onClick={(): void => onSelect(line.index)}
    >
      <LineSummaryRow
        line={line}
        isNew={isNew}
        isDirty={!isNew && isLineDirty(lineState)}
        isFailed={hasLineFailed(lineState)}
      />
    </li>
  )
}

export default React.memo(SplitOption)
