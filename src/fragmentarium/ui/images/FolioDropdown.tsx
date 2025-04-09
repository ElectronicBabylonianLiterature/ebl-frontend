import React, { useState } from 'react'
import { Dropdown, Nav } from 'react-bootstrap'
import Folio from 'fragmentarium/domain/Folio'
import { TabController } from 'fragmentarium/ui/images/Images'
import FolioTooltip from 'fragmentarium/ui/images/FolioTooltip'
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
        {folios.map((folio, index) => {
          const label = `${folio.humanizedName} Folio ${folio.number}`
          return (
            <Dropdown.Item
              key={index}
              onClick={(event) => {
                event.preventDefault()
                controller.openTab(String(index), event)
              }}
            >
              {label}
              <span>
                <FolioTooltip
                  folioInitials={folio.name}
                  folioName={folio.humanizedName}
                />
              </span>
            </Dropdown.Item>
          )
        })}
      </Dropdown.Menu>
    </Dropdown>
  )
}
