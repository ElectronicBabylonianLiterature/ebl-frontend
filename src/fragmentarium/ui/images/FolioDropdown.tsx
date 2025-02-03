import React from 'react'
import { Dropdown, Nav } from 'react-bootstrap'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import FragmentService from 'fragmentarium/application/FragmentService'
import { TabController } from 'fragmentarium/ui/images/Images'

interface FolioDropdownProps {
  fragmentService: FragmentService
  fragment: Fragment
  folios: readonly Folio[]
  controller: TabController
}

export default function FolioDropdown({
  fragmentService,
  fragment,
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
