import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { History } from 'history'
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

const FOLIO = 'folio'
const PHOTO = 'photo'
const CDLI = 'cdli'

class TabController {
  readonly fragment: Fragment
  readonly tab: string | null
  readonly activeFolio: Folio | null
  readonly history: History

  constructor(
    fragment: Fragment,
    tab: string | null,
    activeFolio: Folio | null,
    history: History
  ) {
    this.fragment = fragment
    this.tab = tab
    this.activeFolio = activeFolio
    this.history = history
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
        _.isEqual(folio, this.activeFolio)
      )
      return index >= 0 ? String(index) : '0'
    } else {
      return this.tab ?? this.defaultKey
    }
  }

  openTab: SelectCallback = (eventKey: string | null): void => {
    if (eventKey !== null) {
      const isFolioKey = /\d+/.test(eventKey)
      const url = isFolioKey
        ? this.createFolioTabUrl(eventKey)
        : createFragmentUrlWithTab(this.fragment.number, eventKey)
      this.history.push(url)
    }
  }

  private createFolioTabUrl(key: string): string {
    const index = Number.parseInt(key, 10)
    const folio = this.fragment.folios[index]
    return createFragmentUrlWithFolio(this.fragment.number, folio)
  }
}

const FragmentPhoto = withData<
  { fragment: Fragment },
  { fragmentService: FragmentService },
  Blob
>(
  ({ data, fragment }) => <Photo fragment={fragment} photo={data} />,
  ({ fragment, fragmentService }) => fragmentService.findPhoto(fragment)
)

function createPhotoTab(
  fragment: Fragment,
  fragmentService: FragmentService
): JSX.Element {
  return (
    <Tab eventKey={PHOTO} title="Photo">
      <FragmentPhoto fragment={fragment} fragmentService={fragmentService} />
    </Tab>
  )
}

function createFolioTab(
  fragmentService: FragmentService,
  folio: Folio,
  eventKey: string,
  fragment: Fragment
): JSX.Element {
  return (
    <Tab
      key={eventKey}
      eventKey={eventKey}
      title={`${folio.humanizedName} Folio ${folio.number}`}
      disabled={!folio.hasImage}
    >
      <FolioDetails
        fragmentService={fragmentService}
        fragmentNumber={fragment.number}
        folio={folio}
      />
    </Tab>
  )
}

function Images({
  fragment,
  fragmentService,
  tab,
  activeFolio,
  history,
}: Props & RouteComponentProps): JSX.Element {
  const controller = new TabController(fragment, tab, activeFolio, history)

  return (
    <Tabs
      id="folio-container"
      activeKey={controller.activeKey}
      onSelect={controller.openTab}
    >
      {fragment.hasPhoto && createPhotoTab(fragment, fragmentService)}{' '}
      {fragment.getExternalNumber('cdliNumber') && (
        <Tab eventKey={CDLI} title="CDLI">
          <CdliImages fragment={fragment} fragmentService={fragmentService} />
        </Tab>
      )}
      {fragment.folios.map((folio, index) =>
        createFolioTab(fragmentService, folio, String(index), fragment)
      )}
    </Tabs>
  )
}

interface Props {
  fragment: Fragment
  fragmentService: FragmentService
  tab: string | null
  activeFolio: Folio | null
}

export default withRouter<
  Props & RouteComponentProps,
  React.ComponentType<Props & RouteComponentProps>
>(Images)
