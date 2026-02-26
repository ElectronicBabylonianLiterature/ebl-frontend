import React, { ReactNode } from 'react'
import classNames from 'classnames'
import { Button, ButtonProps } from 'react-bootstrap'
import { Session } from 'auth/Session'
import SessionContext from 'auth/SessionContext'

function MetaButton({
  buttonRef,
  iconClassName,
  ...props
}: {
  buttonRef?: React.RefObject<HTMLButtonElement>
  iconClassName: string
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
              props.className,
            ])}
            ref={buttonRef}
          >
            <i className={iconClassName}></i>
          </Button>
        ) : null
      }
    </SessionContext.Consumer>
  )
}

export function MetaEditButton(
  props: {
    buttonRef?: React.RefObject<HTMLButtonElement>
  } & ButtonProps,
): JSX.Element {
  return <MetaButton {...props} iconClassName="fa-regular fa-pen-to-square" />
}

export function MetaAddButton(
  props: {
    buttonRef?: React.RefObject<HTMLButtonElement>
  } & ButtonProps,
): JSX.Element {
  return <MetaButton {...props} iconClassName="fa-solid fa-plus" />
}

export function MetaDeleteButton(
  props: {
    buttonRef?: React.RefObject<HTMLButtonElement>
  } & ButtonProps,
): JSX.Element {
  return <MetaButton {...props} iconClassName="fa-solid fa-trash-can" />
}
