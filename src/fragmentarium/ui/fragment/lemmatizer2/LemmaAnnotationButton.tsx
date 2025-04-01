import React from 'react'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import { Token } from 'transliteration/domain/token'
import DisplayToken from 'transliteration/ui/DisplayToken'

export default function LemmaActionButton({
  token,
  disabled,
  onResetCurrent,
  onMouseEnter,
  onMouseLeave,
  onMultiApply,
  onMultiReset,
}: {
  token: Token
  disabled: boolean
  onResetCurrent: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMultiApply: () => void
  onMultiReset: () => void
}): JSX.Element {
  return (
    <Dropdown as={ButtonGroup} className="lemmatizer__editor__action-button">
      <Button variant="secondary" onClick={onResetCurrent} disabled={disabled}>
        <i className={'fas fa-rotate-left'}></i>
      </Button>

      <Dropdown.Toggle
        split
        variant="secondary"
        id="dropdown-split-basic"
        disabled={disabled}
      >
        <i className={'fas fa-caret-down'}></i>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onMultiApply}
        >
          Update all instances of <DisplayToken token={token} />
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onMultiReset}
        >
          Reset all instances of <DisplayToken token={token} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
