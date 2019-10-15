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

function isFolioKey(key) {
  return /\d+/.test(key)
}

function createFolioTabUrl(fragment, key) {
  const index = Number.parseInt(key, 10)
  const folio = fragment.folios[index]
  return createFragmentUrlWithFolio(fragment.number, folio)
}

function openTab(history, fragment) {
  return key =>
    history.push(
      isFolioKey(key)
        ? createFolioTabUrl(fragment, key)
        : createFragmentUrlWithTab(fragment.number, key)
    )
}

function getDefaultKey(tab, fragment, cdliInfo) {
  return (
    tab ||
    (fragment.hasPhoto && 'photo') ||
    (cdliInfo.photoUrl && 'cdli_photo') ||
    '0'
  )
}

function getFolioKey(fragment, activeFolio, defaultKey) {
  const index = fragment.folios.findIndex(folio =>
    _.isEqual(folio, activeFolio)
  )
  if (index >= 0) {
    return String(index)
  } else {
    return defaultKey
  }
}

function getActiveKey(tab, fragment, activeFolio, cdliInfo) {
  const defaultKey = getDefaultKey(tab, fragment, cdliInfo)
  if (tab === 'folio') {
    return getFolioKey(fragment, activeFolio, defaultKey)
  } else {
    return defaultKey
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
  const activeKey = getActiveKey(tab, fragment, activeFolio, cdliInfo)

  return (
    <>
      <Tabs
        id="folio-container"
        activeKey={activeKey}
        onSelect={openTab(history, fragment)}
      >
        {fragment.hasPhoto && (
          <Tab eventKey="photo" title="Photo">
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
          <Tab eventKey="cdli_photo" title="CDLI Photo">
            <LinkedImage src={cdliInfo.photoUrl} alt="CDLI Photo" />
          </Tab>
        )}
        {cdliInfo.lineArtUrl && (
          <Tab eventKey="cdli_line_art" title="CDLI Line Art">
            <LinkedImage src={cdliInfo.lineArtUrl} alt="CDLI Line Art" />
          </Tab>
        )}
        {cdliInfo.detailLineArtUrl && (
          <Tab eventKey="cdli_line_art_detail" title="CDLI Detail Line Art">
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
        fragmentService.fetchCdliInfo(fragment.cdliNumber),
        fragment.hasPhoto
          ? fragmentService.findPhoto(fragment.number)
          : Promise.resolve(null)
      ])
  )
)
