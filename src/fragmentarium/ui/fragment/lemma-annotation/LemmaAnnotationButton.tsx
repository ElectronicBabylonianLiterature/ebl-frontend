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
  const session = useContext(SessionContext)
  const canCreateProperNouns = session.isAllowedToCreateProperNouns()
  const hoverHandlers = { onMouseEnter, onMouseLeave }

  // ToDo: Continue from here. Find the reason why the scope is not listed.
  console.log('!!!!', session)

  return (
    <Dropdown
      as={ButtonGroup}
      className="lemmatizer__editor__action-button btn-group-sm"
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={onResetCurrent}
        disabled={!token.isDirty}
        aria-label="reset-current-token"
      >
        <i className={'fas fa-rotate-left'}></i>
      </Button>

      <Dropdown.Toggle
        split
        variant="secondary"
        size="sm"
        id="dropdown-split-basic"
      >
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
        {token.isDirty && canCreateProperNouns && (
          <Dropdown.Item {...hoverHandlers} onClick={onCreateProperNoun}>
            Create a new proper noun for <DisplayToken token={token.token} />
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
