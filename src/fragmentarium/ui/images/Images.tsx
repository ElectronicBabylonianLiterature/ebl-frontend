import React from 'react'
import { Nav, Tab } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'

import withData from 'http/withData'
import Photo from 'fragmentarium/ui/images/Photo'
import FolioDetails from 'fragmentarium/ui/images/FolioDetails'
import {
  createFragmentUrlWithFolio,
  createFragmentUrlWithTab,
} from 'fragmentarium/ui/FragmentLink'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import CdliImages from 'fragmentarium/ui/images/CdliImages'
import { SelectCallback } from 'react-bootstrap/helpers'
import FragmentService from 'fragmentarium/application/FragmentService'
import FolioDropdown from 'fragmentarium/ui/images/FolioDropdown'
import FolioTooltip from 'fragmentarium/ui/images/FolioTooltip'

const FOLIO = 'folio'
const PHOTO = 'photo'
const CDLI = 'cdli'

export class TabController {
  readonly fragment: Fragment
  readonly tab: string | null
  readonly activeFolio: Folio | null
  readonly navigate: (url: string) => void

  constructor(
    fragment: Fragment,
    tab: string | null,
    activeFolio: Folio | null,
    navigate: (url: string) => void,
  ) {
    this.fragment = fragment
    this.tab = tab
    this.activeFolio = activeFolio
    this.navigate = navigate
  }

  get defaultKey(): string {
    return (
      _([
        this.fragment.hasPhoto && PHOTO,
        ...this.fragment.folios.map((folio, index) => String(index)),
      ])
        .compact()
        .head() ?? CDLI
    )
  }

  get activeKey(): string {
    if (this.tab === FOLIO) {
      const index = this.fragment.folios.findIndex((folio) =>
        _.isEqual(folio, this.activeFolio),
      )
      return index >= 0 ? String(index) : '0'
    } else {
      return this.tab ?? this.defaultKey
    }
  }

  openTab: SelectCallback = (
    eventKey: string | null,
    event: React.SyntheticEvent<unknown, Event>,
  ): void => {
    if (eventKey !== null) {
      const index = Number.parseInt(eventKey, 10)
      const isFolioKey = !isNaN(index) && this.fragment.folios[index]

      const url = isFolioKey
        ? this.createFolioTabUrl(eventKey)
        : createFragmentUrlWithTab(this.fragment.number, eventKey)

      this.navigate(url)
    }
  }

  private createFolioTabUrl(key: string): string {
    const index = Number.parseInt(key, 10)
    const folio = this.fragment.folios[index]
    return createFragmentUrlWithFolio(this.fragment.number, folio)
  }
}

export const FragmentPhoto = withData<
  { fragment: Fragment },
  { fragmentService: FragmentService },
  Blob
>(
  ({ data, fragment }) => <Photo fragment={fragment} photo={data} />,
  ({ fragment, fragmentService }) => fragmentService.findPhoto(fragment),
)

interface TabPaneProps {
  eventKey: string
  children: React.ReactNode
}

const TabPane: React.FC<TabPaneProps> = ({ eventKey, children }) => (
  <Tab.Pane eventKey={eventKey}>{children}</Tab.Pane>
)

interface NavItemProps {
  eventKey: string
  label: string
  folioInitials?: string
  folioName?: string
}

const NavItem: React.FC<NavItemProps> = ({
  eventKey,
  label,
  folioInitials,
  folioName,
}) => (
  <Nav.Item>
    <Nav.Link eventKey={eventKey}>
      {label}
      {folioInitials && folioName && (
        <span>
          <FolioTooltip folioInitials={folioInitials} folioName={folioName} />
        </span>
      )}
    </Nav.Link>
  </Nav.Item>
)

function Images({
  fragment,
  fragmentService,
  tab,
  activeFolio,
}: Props): JSX.Element {
  const navigate = useNavigate()
  const controller = new TabController(fragment, tab, activeFolio, navigate)
  const folios = fragment.folios
  const FOLIO_DROPDOWN_THRESHOLD = 3

  return (
    <Tab.Container
      activeKey={controller.activeKey}
      onSelect={controller.openTab}
    >
      <Nav variant="tabs" id="folio-container">
        {fragment.hasPhoto && <NavItem eventKey={PHOTO} label="Photo" />}
        {fragment.cdliImages && fragment.cdliImages.length > 0 && (
          <NavItem eventKey={CDLI} label="CDLI" />
        )}
        {folios.length > FOLIO_DROPDOWN_THRESHOLD ? (
          <Nav.Item>
            <FolioDropdown folios={folios} controller={controller} />
          </Nav.Item>
        ) : (
          folios.map((folio, index) => {
            const label = `${folio.humanizedName} Folio ${folio.number}`
            return (
              <NavItem
                key={index}
                eventKey={String(index)}
                label={label}
                folioInitials={folio.name}
                folioName={folio.humanizedName}
              />
            )
          })
        )}
      </Nav>

      <Tab.Content>
        {fragment.hasPhoto && (
          <TabPane eventKey={PHOTO}>
            <FragmentPhoto
              fragment={fragment}
              fragmentService={fragmentService}
            />
          </TabPane>
        )}
        {fragment.getExternalNumber('cdliNumber') && (
          <TabPane eventKey={CDLI}>
            <CdliImages fragment={fragment} fragmentService={fragmentService} />
          </TabPane>
        )}
        {folios.map((folio, index) => (
          <TabPane key={index} eventKey={String(index)}>
            <FolioDetails
              fragmentService={fragmentService}
              fragmentNumber={fragment.number}
              folio={folio}
            />
          </TabPane>
        ))}
      </Tab.Content>
    </Tab.Container>
  )
}

interface Props {
  fragment: Fragment
  fragmentService: FragmentService
  tab: string | null
  activeFolio: Folio | null
}

export default Images
