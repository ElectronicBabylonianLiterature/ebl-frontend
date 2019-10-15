// @flow
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
import { Fragment } from 'fragmentarium/domain/fragment'

const FOLIO = 'folio'
const PHOTO = 'photo'
const CDLI_PHOTO = 'cdli_photo'
const CDLI_LINE_ART = 'cdli_line_art'
const CDLI_DETAIL_LINE_ART = 'cdli_detail_line_art'

class TabController {
  +fragment: Fragment
  +cdliInfo: CdliInfo
  +tab: ?string
  +activeFolio: ?Folio
  +history: Any

  constructor(fragment, cdliInfo, tab, activeFolio, history) {
    this.fragment = fragment
    this.cdliInfo = cdliInfo
    this.tab = tab
    this.activeFolio = activeFolio
    this.history = history
  }

  get defaultKey() {
    return _([
      this.fragment.hasPhoto && PHOTO,
      this.cdliInfo.photoUrl && CDLI_PHOTO,
      this.fragment.folios.map((folio, index) => String(index)),
      this.cdliInfo.photoUrl && CDLI_LINE_ART,
      this.cdliInfo.photoUrl && CDLI_DETAIL_LINE_ART
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
        {fragment.hasPhoto && (
          <Tab eventKey={PHOTO} title="Photo">
            <Photo fragment={fragment} photo={photo} />
          </Tab>
        )}
        {fragment.folios.map((folio, index) => (
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
        ))}
        {cdliInfo.photoUrl && (
          <Tab eventKey={CDLI_PHOTO} title="CDLI Photo">
            <LinkedImage src={cdliInfo.photoUrl} alt="CDLI Photo" />
          </Tab>
        )}
        {cdliInfo.lineArtUrl && (
          <Tab eventKey={CDLI_LINE_ART} title="CDLI Line Art">
            <LinkedImage src={cdliInfo.lineArtUrl} alt="CDLI Line Art" />
          </Tab>
        )}
        {cdliInfo.detailLineArtUrl && (
          <Tab eventKey={CDLI_DETAIL_LINE_ART} title="CDLI Detail Line Art">
            <LinkedImage
              src={cdliInfo.detailLineArtUrl}
              alt="CDLI Detail Line Art"
            />
          </Tab>
        )}
      </Tabs>
      {_.isEmpty(fragment.folios) &&
        !fragment.cdliNumber &&
        !fragment.hasPhoto &&
        'No images'}
    </>
  )
}

export default withRouter(
  withData(
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
