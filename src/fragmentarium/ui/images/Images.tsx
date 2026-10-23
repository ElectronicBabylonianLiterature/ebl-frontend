import React, { useContext } from 'react'
import { MediaGalleryContext } from 'fragmentarium/application/MediaGalleryContext'
import FragmentMediaGallery from 'fragmentarium/ui/images/FragmentMediaGallery'
import { Nav, Tab } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import withData from 'http/withData'
import Photo from 'fragmentarium/ui/images/Photo'
import FolioDetails from 'fragmentarium/ui/images/FolioDetails'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import CdliImages from 'fragmentarium/ui/images/CdliImages'
import { ImageFragmentService } from 'fragmentarium/ui/images/ImageFragmentService'
import FolioDropdown from 'fragmentarium/ui/images/FolioDropdown'
import FolioTooltip from 'fragmentarium/ui/images/FolioTooltip'
import {
  CDLI,
  PHOTO,
  TabController,
  VisitedImageTabs,
  folioTabKey,
  hasUsableCdliTab,
  visitImageTab,
} from 'fragmentarium/ui/images/ImageTabController'

export const FragmentPhoto = withData<
  { fragment: Fragment },
  { fragmentService: ImageFragmentService },
  Blob
>(
  ({ data, fragment }) => <Photo fragment={fragment} photo={data} />,
  ({ fragment, fragmentService }, signal) =>
    fragmentService.findPhoto(fragment, signal),
  { retry: true },
)

interface TabPaneProps {
  eventKey: string
  activeKey: string | undefined
  children: React.ReactNode
}

const TabPane: React.FC<TabPaneProps> = ({ eventKey, activeKey, children }) => (
  <Tab.Pane eventKey={eventKey} hidden={activeKey !== eventKey}>
    {children}
  </Tab.Pane>
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
  const mediaServices = useContext(MediaGalleryContext)
  const hasLegacyPhoto = fragment.legacyHasPhoto ?? fragment.hasPhoto
  const hasMedia = mediaServices
    ? fragment.hasPhoto || Boolean(fragment.mediaSummary?.count)
    : hasLegacyPhoto
  const controller = new TabController(
    fragment,
    tab,
    activeFolio,
    navigate,
    hasMedia,
  )
  const folios = fragment.folios
  const activeKey = controller.activeKey
  const [visitedTabs, setVisitedTabs] = React.useState<VisitedImageTabs>(() =>
    visitImageTab({ namedTabs: new Set(), folioIndexes: new Set() }, activeKey),
  )
  const FOLIO_DROPDOWN_THRESHOLD = 3

  React.useEffect(() => {
    setVisitedTabs((visited) => visitImageTab(visited, activeKey))
  }, [activeKey])

  return (
    <Tab.Container activeKey={activeKey} onSelect={controller.openTab}>
      <Nav variant="tabs" id="folio-container">
        {hasMedia && (
          <NavItem
            eventKey={PHOTO}
            label={mediaServices ? 'Images' : 'Photo'}
          />
        )}
        {hasUsableCdliTab(fragment) && <NavItem eventKey={CDLI} label="CDLI" />}
        {folios.length > FOLIO_DROPDOWN_THRESHOLD ? (
          <Nav.Item>
            <FolioDropdown folios={folios} onOpenFolio={controller.openFolio} />
          </Nav.Item>
        ) : (
          folios.map((folio, index) => {
            const label = `${folio.humanizedName} Folio ${folio.number}`
            return (
              <NavItem
                key={index}
                eventKey={folioTabKey(index)}
                label={label}
                folioInitials={folio.name}
                folioName={folio.humanizedName}
              />
            )
          })
        )}
      </Nav>

      <Tab.Content>
        {hasMedia && (
          <TabPane eventKey={PHOTO} activeKey={activeKey}>
            {visitedTabs.namedTabs.has(PHOTO) &&
              (mediaServices ? (
                <FragmentMediaGallery
                  key={`${mediaServices.sessionKey ?? 'default'}:${fragment.number}`}
                  fragment={fragment}
                  services={mediaServices}
                  fallback={
                    hasLegacyPhoto ? (
                      <FragmentPhoto
                        fragment={fragment}
                        fragmentService={fragmentService}
                      />
                    ) : (
                      <p>No images available.</p>
                    )
                  }
                />
              ) : (
                <FragmentPhoto
                  fragment={fragment}
                  fragmentService={fragmentService}
                />
              ))}
          </TabPane>
        )}
        {hasUsableCdliTab(fragment) && (
          <TabPane eventKey={CDLI} activeKey={activeKey}>
            {visitedTabs.namedTabs.has(CDLI) && (
              <CdliImages fragment={fragment} />
            )}
          </TabPane>
        )}
        {folios.map((folio, index) => (
          <TabPane
            key={index}
            eventKey={folioTabKey(index)}
            activeKey={activeKey}
          >
            {visitedTabs.folioIndexes.has(index) && (
              <FolioDetails
                fragmentService={fragmentService}
                fragmentNumber={fragment.number}
                folio={folio}
              />
            )}
          </TabPane>
        ))}
      </Tab.Content>
    </Tab.Container>
  )
}

interface Props {
  fragment: Fragment
  fragmentService: ImageFragmentService
  tab: string | null
  activeFolio: Folio | null
}

export default Images
