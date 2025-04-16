import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import React from 'react'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import DisplayToken from 'transliteration/ui/DisplayToken'

export interface LemmaActionCallbacks {
  onResetCurrent: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMultiApply: () => void
  onMultiReset: () => void
}

export default function LemmaActionButton({
  token,
  onResetCurrent,
  onMouseEnter,
  onMouseLeave,
  onMultiApply,
  onMultiReset,
}: {
  token: EditableToken
} & LemmaActionCallbacks): JSX.Element {
  return (
    <Dropdown as={ButtonGroup} className="lemmatizer__editor__action-button">
      <Button
        variant="secondary"
        onClick={onResetCurrent}
        disabled={!token.isDirty}
        aria-label="reset-current-token"
      >
        <i className={'fas fa-rotate-left'}></i>
      </Button>

      <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic">
        <i className={'fas fa-caret-down'}></i>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onMultiApply}
        >
          Update all instances of <DisplayToken token={token.token} />
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onMultiReset}
          disabled={!token.isDirty}
        >
          Reset all instances of <DisplayToken token={token.token} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
