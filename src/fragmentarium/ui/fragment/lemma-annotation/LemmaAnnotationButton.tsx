import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import SessionContext from 'auth/SessionContext'
import React, { useContext } from 'react'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import DisplayToken from 'transliteration/ui/DisplayToken'

export interface LemmaActionCallbacks {
  onResetCurrent: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMultiApply: () => void
  onMultiReset: () => void
  onCreateProperNoun: () => void
}

export interface WordActionProps extends LemmaActionCallbacks {
  readonly word: React.ReactNode
  readonly isDirty: boolean
  readonly hasLemmas: boolean
  readonly canResetAll: boolean
  readonly multiApplyProblem?: string | null
  readonly onFocus?: () => void
  readonly onBlur?: () => void
}

export function WordActionButton({
  word,
  isDirty,
  hasLemmas,
  canResetAll,
  multiApplyProblem = null,
  onResetCurrent,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onMultiApply,
  onMultiReset,
  onCreateProperNoun,
}: WordActionProps): JSX.Element {
  const session = useContext(SessionContext)
  const canCreateProperNouns = session.isAllowedToCreateProperNouns()
  const hoverHandlers = { onMouseEnter, onMouseLeave, onFocus, onBlur }

  return (
    <Dropdown
      as={ButtonGroup}
      className="lemmatizer__editor__action-button btn-group-sm"
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={onResetCurrent}
        disabled={!isDirty}
        aria-label="reset-current-token"
      >
        <i className={'fas fa-rotate-left'} aria-hidden="true"></i>
      </Button>

      <Dropdown.Toggle
        split
        variant="secondary"
        size="sm"
        id="dropdown-split-basic"
        aria-label="Open token actions"
      />

      <Dropdown.Menu>
        <Dropdown.Item
          {...hoverHandlers}
          onClick={onMultiApply}
          disabled={multiApplyProblem !== null}
        >
          Update all instances of {word}
          {multiApplyProblem !== null && (
            <small className="d-block">{multiApplyProblem}</small>
          )}
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          {...hoverHandlers}
          onClick={onMultiReset}
          disabled={!canResetAll}
        >
          Reset all instances of {word}
        </Dropdown.Item>
        {canCreateProperNouns && (isDirty || !hasLemmas) && (
          <Dropdown.Item {...hoverHandlers} onClick={onCreateProperNoun}>
            Create a new proper noun for {word}
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default function LemmaActionButton({
  token,
  ...callbacks
}: {
  token: EditableToken
} & LemmaActionCallbacks): JSX.Element {
  return (
    <WordActionButton
      word={<DisplayToken token={token.token} />}
      isDirty={token.isDirty}
      hasLemmas={token.lemmas.length > 0}
      canResetAll={token.isDirty}
      {...callbacks}
    />
  )
}
