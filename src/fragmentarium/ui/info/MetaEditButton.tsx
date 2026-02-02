import React, { ReactNode } from 'react'
import classNames from 'classnames'
import { Button, ButtonProps } from 'react-bootstrap'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'

export function MetaEditButton({
  buttonRef,
  ...props
}: {
  buttonRef?: React.RefObject<HTMLButtonElement>
} & ButtonProps): JSX.Element {
  return (
    <SessionContext.Consumer>
      {(session: Session): ReactNode =>
        session.isAllowedToTransliterateFragments() ? (
          <Button
            variant="light"
            {...props}
            className={classNames([
              'mh-100',
              'Details__meta-button',
              'far fa-edit',
              props.className,
            ])}
            ref={buttonRef}
          />
        ) : null
      }
    </SessionContext.Consumer>
  )
}

export function MetaAddButton({
  buttonRef,
  ...props
}: {
  buttonRef?: React.RefObject<HTMLButtonElement>
} & ButtonProps): JSX.Element {
  return (
    <SessionContext.Consumer>
      {(session: Session): ReactNode =>
        session.isAllowedToTransliterateFragments() ? (
          <Button
            variant="light"
            {...props}
            className={classNames([
              'mh-100',
              'Details__meta-button',
              'far fa-plus',
              props.className,
            ])}
            ref={buttonRef}
          />
        ) : null
      }
    </SessionContext.Consumer>
  )
}

export function MetaDeleteButton({
  buttonRef,
  ...props
}: {
  buttonRef?: React.RefObject<HTMLButtonElement>
} & ButtonProps): JSX.Element {
  return (
    <SessionContext.Consumer>
      {(session: Session): ReactNode =>
        session.isAllowedToTransliterateFragments() ? (
          <Button
            variant="light"
            {...props}
            className={classNames([
              'mh-100',
              'Details__meta-button',
              'fas fa-trash',
              props.className,
            ])}
            ref={buttonRef}
          />
        ) : null
      }
    </SessionContext.Consumer>
  )
}
