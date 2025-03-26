import React from 'react'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'

export default function LemmaActionButton({
  disabled,
  onResetCurrent,
  onMouseEnter,
  onMouseLeave,
  onMultiApply,
  onMultiReset,
}: {
  disabled: boolean
  onResetCurrent: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMultiApply: () => void
  onMultiReset: () => void
}): JSX.Element {
  return (
    <Dropdown as={ButtonGroup}>
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
          Apply to All
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onMultiReset}
        >
          Undo All
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
