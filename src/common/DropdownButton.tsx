import React from 'react'
import { Dropdown, Button } from 'react-bootstrap'
import _ from 'lodash'

function divMenu(content: React.ReactNode) {
  return React.forwardRef<HTMLDivElement, unknown>(function menu(
    {
      style,
      className,
      'aria-labelledby': labeledBy,
    }: {
      children?: React.ReactNode
      style?: React.CSSProperties
      className?: string
      'aria-labelledby'?: string
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        {content}
      </div>
    )
  })
}
function buttonToggle(content: React.ReactNode, active: boolean) {
  return React.forwardRef<HTMLButtonElement & Button, unknown>(function toggle(
    props,
    ref
  ) {
    return (
      <Button
        ref={ref}
        size="sm"
        variant="outline-dark"
        active={active}
        {...props}
      >
        {content}
      </Button>
    )
  })
}

export default function DropdownButton({
  menu,
  toggle,
  onToggle,
  show,
}: {
  menu: React.ReactNode
  toggle: React.ReactNode
  onToggle: (show: boolean) => void
  show: boolean
}): JSX.Element {
  return (
    <Dropdown as="span" onToggle={onToggle} show={show}>
      <Dropdown.Toggle
        as={buttonToggle(toggle, show)}
        id={_.uniqueId('DropdownPopOver-')}
        bsPrefix="DropdownButton__toggle"
      />
      <Dropdown.Menu as={divMenu(menu)} />
    </Dropdown>
  )
}
