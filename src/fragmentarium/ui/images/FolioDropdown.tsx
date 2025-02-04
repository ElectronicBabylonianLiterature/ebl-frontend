import React from 'react'
import { Dropdown, Nav } from 'react-bootstrap'
import Folio from 'fragmentarium/domain/Folio'
import { TabController } from 'fragmentarium/ui/images/Images'
import './FolioDropdown.sass'

interface FolioDropdownProps {
  folios: readonly Folio[]
  controller: TabController
}

export default function FolioDropdown({
  folios,
  controller,
}: FolioDropdownProps): JSX.Element {
  return (
    <Dropdown as={Nav.Item}>
      <Dropdown.Toggle as={Nav.Link}>
        Folios <i className="fas fa-angle-down" />
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
