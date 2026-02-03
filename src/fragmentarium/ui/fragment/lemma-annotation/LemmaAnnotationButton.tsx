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
  onCreateProperNoun: () => void
}

export default function LemmaActionButton({
  token,
  onResetCurrent,
  onMouseEnter,
  onMouseLeave,
  onMultiApply,
  onMultiReset,
  onCreateProperNoun,
}: {
  token: EditableToken
} & LemmaActionCallbacks): JSX.Element {
  const hoverHandlers = { onMouseEnter, onMouseLeave }

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
        <Dropdown.Item {...hoverHandlers} onClick={onMultiApply}>
          Update all instances of <DisplayToken token={token.token} />
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          {...hoverHandlers}
          onClick={onMultiReset}
          disabled={!token.isDirty}
        >
          Reset all instances of <DisplayToken token={token.token} />
        </Dropdown.Item>
        <Dropdown.Item
          {...hoverHandlers}
          onClick={onCreateProperNoun}
          disabled={!token.isDirty}
        >
          Create a new proper noun for <DisplayToken token={token.token} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
