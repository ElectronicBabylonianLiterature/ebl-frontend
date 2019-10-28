import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import Promise from 'bluebird'

import withData from 'http/withData'
import LinkedImage from 'common/LinkedImage'
import Photo from './Photo'
import FolioDetails from './FolioDetails'
import {
  createFragmentUrlWithFolio,
  createFragmentUrlWithTab
} from 'fragmentarium/ui/FragmentLink'
import { Fragment, Folio } from 'fragmentarium/domain/fragment'
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
  readonly history

  constructor(
    fragment: Fragment,
    cdliInfo: CdliInfo,
    tab: string | null,
    activeFolio: Folio | null,
    history
  ) {
    this.fragment = fragment
    this.cdliInfo = cdliInfo
    this.tab = tab
    this.activeFolio = activeFolio
    this.history = history
  }

  get hasNoImages() {
    return (
      !this.fragment.hasPhoto &&
      this.fragment.folios.every(folio => !folio.hasImage) &&
      (!this.fragment.cdliNumber || _.values(this.cdliInfo).every(_.isNil))
    )
  }

  get defaultKey() {
    return _([
      this.fragment.hasPhoto && PHOTO,
      this.cdliInfo.photoUrl && CDLI_PHOTO,
      this.fragment.folios.map((folio, index) => String(index)),
      this.cdliInfo.lineArtUrl && CDLI_LINE_ART,
      this.cdliInfo.detailLineArtUrl && CDLI_DETAIL_LINE_ART
    ])
      .compact()
      .head()
  }

  get activeKey() {
    if (this.tab === FOLIO) {
      const index = this.fragment.folios.findIndex(folio =>
        _.isEqual(folio, this.activeFolio)
      )
      return index >= 0 ? String(index) : '0'
    } else {
      return this.tab || this.defaultKey
    }
  }

  openTab = key => {
    const isFolioKey = /\d+/.test(key)
    const url = isFolioKey
      ? this.createFolioTabUrl(key)
      : createFragmentUrlWithTab(this.fragment.number, key)
    this.history.push(url)
  }

  createFolioTabUrl(key) {
    const index = Number.parseInt(key, 10)
    const folio = this.fragment.folios[index]
    return createFragmentUrlWithFolio(this.fragment.number, folio)
  }
}

function createPhotoTab(fragment: Fragment, photo: Blob) {
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
) {
  return (
    <Tab
      key={index}
      eventKey={String(index)}
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

function createCdliTab(eventKey: string, url: string) {
  const title = {
    [CDLI_PHOTO]: 'CDLI Photo',
    [CDLI_LINE_ART]: 'CDLI Line Art',
    [CDLI_DETAIL_LINE_ART]: 'CDLI Detail Line Art'
  }[eventKey]

  return (
    <Tab eventKey={eventKey} title={title}>
      <LinkedImage src={url} alt={title} />
    </Tab>
  )
}

type Props = {
  fragment,
  fragmentService,
  tab,
  activeFolio,
  history,
  cdliInfo,
  photo
}
function Images({
  fragment,
  fragmentService,
  tab,
  activeFolio,
  history,
  cdliInfo,
  photo
}) {
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
          createFolioTab(fragmentService, folio, index, fragment)
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

export default withRouter<any, any>(
  withData<{fragment; fragmentService; tab; activeFolio; history}, { }, [CdliInfo, Blob]>(
    ({ data: [cdliInfo, photo], ...props }) => (
      <Images {...props} cdliInfo={cdliInfo} photo={photo} />
    ),
    ({ fragment, fragmentService }) =>
      Promise.all([
        fragmentService.fetchCdliInfo(fragment),
        fragmentService.findPhoto(fragment)
      ])
  )
)
