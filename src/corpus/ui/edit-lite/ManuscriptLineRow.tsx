import React, { useId, useState } from 'react'
import _ from 'lodash'
import { ManuscriptSummary } from 'corpus/application/edit-lite/chapterOutline'
import { ManuscriptLine } from 'corpus/domain/line'
import LazyAtfEditor from 'corpus/ui/edit-lite/LazyAtfEditor'
import LazySiglumSelect from 'corpus/ui/edit-lite/LazySiglumSelect'
import {
  formatLabels,
  parseLabels,
  setManuscriptAtf,
  setManuscriptId,
  setManuscriptLabels,
  setManuscriptNumber,
} from 'corpus/ui/edit-lite/lineDraft'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/ManuscriptLineRow.sass'

interface LabelsInputProps {
  readonly labels: readonly string[]
  readonly onChange: (labels: readonly string[]) => void
  readonly disabled: boolean
}

function LabelsInput({
  labels,
  onChange,
  disabled,
}: LabelsInputProps): JSX.Element {
  const [text, setText] = useState<string>(formatLabels(labels))
  const isTextCurrent = _.isEqual(parseLabels(text), labels)

  return (
    <input
      className="edit-lite-input"
      type="text"
      aria-label="Labels"
      value={isTextCurrent ? text : formatLabels(labels)}
      disabled={disabled}
      onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
        setText(event.target.value)
        onChange(parseLabels(event.target.value))
      }}
    />
  )
}

interface Props {
  readonly manuscriptIndex: number
  readonly manuscriptLine: ManuscriptLine
  readonly manuscripts: readonly ManuscriptSummary[]
  readonly onChange: (
    manuscriptIndex: number,
    manuscriptLine: ManuscriptLine,
  ) => void
  readonly onDelete: (manuscriptIndex: number) => void
  readonly disabled: boolean
  readonly readOnly: boolean
}

function ManuscriptLineRow({
  manuscriptIndex,
  manuscriptLine,
  manuscripts,
  onChange,
  onDelete,
  disabled,
  readOnly,
}: Props): JSX.Element {
  const id = useId()
  const caption = `manuscript line ${manuscriptIndex + 1}`
  const change = (changedLine: ManuscriptLine): void =>
    onChange(manuscriptIndex, changedLine)

  return (
    <div
      className="edit-lite-manuscript"
      role="group"
      aria-label={_.upperFirst(caption)}
    >
      <LazySiglumSelect
        value={manuscriptLine.manuscriptId}
        manuscripts={manuscripts}
        onChange={(manuscriptId: number): void =>
          change(setManuscriptId(manuscriptLine, manuscriptId))
        }
        disabled={disabled}
        readOnly={readOnly}
      />
      <LabelsInput
        labels={manuscriptLine.labels}
        onChange={(labels: readonly string[]): void =>
          change(setManuscriptLabels(manuscriptLine, labels))
        }
        disabled={disabled}
      />
      <input
        className="edit-lite-input"
        type="text"
        aria-label="Line number"
        value={manuscriptLine.number}
        disabled={disabled}
        onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
          change(setManuscriptNumber(manuscriptLine, event.target.value))
        }
      />
      <div className="edit-lite-manuscript__text">
        <LazyAtfEditor
          name={`Text-${id}`}
          label="Text"
          value={manuscriptLine.atf}
          onChange={(atf: string): void =>
            change(setManuscriptAtf(manuscriptLine, atf))
          }
          disabled={disabled}
        />
      </div>
      {!readOnly && (
        <button
          type="button"
          className="edit-lite-link-button edit-lite-manuscript__delete"
          aria-label={`Delete ${caption}`}
          disabled={disabled}
          onClick={(): void => onDelete(manuscriptIndex)}
        >
          Delete
        </button>
      )}
    </div>
  )
}

export default React.memo(ManuscriptLineRow)
