import React, { useState } from 'react'
import { Dropdown, Nav } from 'react-bootstrap'
import Folio from 'fragmentarium/domain/Folio'
import { TabController } from 'fragmentarium/ui/images/Images'
import './FolioDropdown.sass'
import classNames from 'classnames'

interface FolioDropdownProps {
  folios: readonly Folio[]
  controller: TabController
}

export default function FolioDropdown({
  folios,
  controller,
}: FolioDropdownProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dropdown as={Nav.Item} onToggle={(nextShow) => setIsOpen(nextShow)}>
      <Dropdown.Toggle as={Nav.Link} aria-expanded={isOpen}>
        Folios{' '}
        <i
          className={classNames({
            fas: true,
            'fa-angle-down': !isOpen,
            'fa-angle-up': isOpen,
          })}
        />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {folios.map((folio, index) => (
          <Dropdown.Item
            key={index}
            onClick={(event) => {
              event.preventDefault()
              controller.openTab(String(index), event)
            }}
          >
            {`${folio.humanizedName} Folio ${folio.number}`}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
