import React, { ReactNode } from 'react'
import classNames from 'classnames'
import { Button } from 'react-bootstrap'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'

export default function MetaEditButton({
  onClick,
  target,
}: {
  onClick: React.MouseEventHandler<HTMLElement>
  target?: React.RefObject<HTMLButtonElement>
}): JSX.Element {
  return (
    <SessionContext.Consumer>
      {(session: Session): ReactNode =>
        session.isAllowedToTransliterateFragments() ? (
          <Button
            aria-label="Browse genres button"
            variant="light"
            ref={target}
            className={classNames([
              'far fa-edit',
              'mh-100',
              'Details__edit-button',
            ])}
            onClick={onClick}
          />
        ) : null
      }
    </SessionContext.Consumer>
  )
}
