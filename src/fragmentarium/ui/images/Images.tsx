import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { History } from 'history'
import _ from 'lodash'
import Promise from 'bluebird'

import withData from 'http/withData'
import LinkedImage from 'common/LinkedImage'
import Photo from './Photo'
import FolioDetails from './FolioDetails'
import {
  createFragmentUrlWithFolio,
  createFragmentUrlWithTab,
} from 'fragmentarium/ui/FragmentLink'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import { CdliInfo } from 'fragmentarium/application/FragmentService'

const FOLIO = 'folio'
const PHOTO = 'photo'
const CDLI_PHOTO = 'cdli_photo'
const CDLI_LINE_ART = 'cdli_line_art'
const CDLI_DETAIL_LINE_ART = 'cdli_detail_line_art'

class TabController {
  readonly fragment: Fragment
  readonly cdliInfo: CdliInfo
  readonly tab: string | null
  readonly activeFolio: Folio | null
  readonly history: History

  constructor(
    fragment: Fragment,
    cdliInfo: CdliInfo,
    tab: string | null,
    activeFolio: Folio | null,
    history: History
  ) {
    this.fragment = fragment
    this.cdliInfo = cdliInfo
    this.tab = tab
    this.activeFolio = activeFolio
    this.history = history
  }

  get hasNoImages(): boolean {
    return (
      !this.fragment.hasPhoto &&
      this.fragment.folios.every((folio) => !folio.hasImage) &&
      (!this.fragment.cdliNumber || _.values(this.cdliInfo).every(_.isNil))
    )
  }

  get defaultKey(): string | null {
    return (
      _([
        this.fragment.hasPhoto && PHOTO,
        this.cdliInfo.photoUrl && CDLI_PHOTO,
        ...this.fragment.folios.map((folio, index) => String(index)),
        this.cdliInfo.lineArtUrl && CDLI_LINE_ART,
        this.cdliInfo.detailLineArtUrl && CDLI_DETAIL_LINE_ART,
      ])
        .compact()
        .head() ?? null
    )
  }

  get activeKey(): string | null {
    if (this.tab === FOLIO) {
      const index = this.fragment.folios.findIndex((folio) =>
        _.isEqual(folio, this.activeFolio)
      )
      return index >= 0 ? String(index) : '0'
    } else {
      return this.tab || this.defaultKey
    }
  }

  openTab = (key: string): void => {
    const isFolioKey = /\d+/.test(key)
    const url = isFolioKey
      ? this.createFolioTabUrl(key)
      : createFragmentUrlWithTab(this.fragment.number, key)
    this.history.push(url)
  }

  createFolioTabUrl(key: string): string {
    const index = Number.parseInt(key, 10)
    const folio = this.fragment.folios[index]
    return createFragmentUrlWithFolio(this.fragment.number, folio)
  }
}

function createPhotoTab(fragment: Fragment, photo: Blob): JSX.Element {
  return (
    <Tab eventKey={PHOTO} title="Photo">
      <Photo fragment={fragment} photo={photo} />
    </Tab>
  )
}

function createFolioTab(
  fragmentService,
  folio: Folio,
  index: string,
  fragment: Fragment
): JSX.Element {
  return (
    <Tab
      key={index}
      eventKey={index}
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

function createCdliTab(eventKey: string, url: string): JSX.Element {
  const title = {
    [CDLI_PHOTO]: 'CDLI Photo',
    [CDLI_LINE_ART]: 'CDLI Line Art',
    [CDLI_DETAIL_LINE_ART]: 'CDLI Detail Line Art',
  }[eventKey]

  return (
    <Tab eventKey={eventKey} title={title}>
      <LinkedImage src={url} alt={title} />
    </Tab>
  )
}

interface ImagesProps extends Props {
  cdliInfo: CdliInfo
  photo: Blob
}
function Images({
  fragment,
  fragmentService,
  tab,
  activeFolio,
  history,
  cdliInfo,
  photo,
}: ImagesProps & RouteComponentProps): JSX.Element {
  const controller = new TabController(
    fragment,
    cdliInfo,
    tab,
    activeFolio,
    history
  )

  return (
    <>
      <Tabs
        id="folio-container"
        activeKey={controller.activeKey}
        onSelect={controller.openTab}
      >
        {fragment.hasPhoto && createPhotoTab(fragment, photo)}
        {fragment.folios.map((folio, index) =>
          createFolioTab(fragmentService, folio, String(index), fragment)
        )}
        {cdliInfo.photoUrl && createCdliTab(CDLI_PHOTO, cdliInfo.photoUrl)}
        {cdliInfo.lineArtUrl &&
          createCdliTab(CDLI_LINE_ART, cdliInfo.lineArtUrl)}
        {cdliInfo.detailLineArtUrl &&
          createCdliTab(CDLI_DETAIL_LINE_ART, cdliInfo.detailLineArtUrl)}
      </Tabs>
      {controller.hasNoImages && 'No images'}
    </>
  )
}

interface Props {
  fragment: Fragment
  fragmentService
  tab: string | null
  activeFolio: Folio | null
}

export default withRouter<
  Props & RouteComponentProps,
  React.ComponentType<Props & RouteComponentProps>
>(
  withData<Props & RouteComponentProps, {}, [CdliInfo, Blob]>(
    ({ data: [cdliInfo, photo], ...props }) => (
      <Images {...props} cdliInfo={cdliInfo} photo={photo} />
    ),
    ({ fragment, fragmentService }) =>
      Promise.all([
        fragmentService.fetchCdliInfo(fragment).catch(() => ({
          photoUrl: null,
          lineArtUrl: null,
          detailLineArtUrl: null,
        })),
        fragmentService.findPhoto(fragment),
      ])
  )
)
