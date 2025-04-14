import React, { ReactNode } from 'react'
import classNames from 'classnames'
import { Button } from 'react-bootstrap'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'

export function MetaEditButton({
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
            aria-label="Browse genres"
            variant="light"
            ref={target}
            className={classNames([
              'far fa-edit',
              'mh-100',
              'Details__meta-button',
            ])}
            onClick={onClick}
          />
        ) : null
      }
    </SessionContext.Consumer>
  )
}

export function MetaDeleteButton({
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
            aria-label="Delete genre"
            variant="light"
            ref={target}
            className={classNames([
              'fas fa-trash',
              'mh-100',
              'Details__meta-button',
              'show-on-hover',
            ])}
            onClick={onClick}
          />
        ) : null
      }
    </SessionContext.Consumer>
  )
}
