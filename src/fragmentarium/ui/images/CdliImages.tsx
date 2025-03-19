import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

import withData from 'http/withData'
import LinkedImage from 'common/LinkedImage'
import { Fragment } from 'fragmentarium/domain/fragment'

import './CdliImages.css'

const CDLI_PHOTO = 'cdli_photo'
const CDLI_LINE_ART = 'cdli_line_art'
const CDLI_DETAIL_LINE_ART = 'cdli_detail_line_art'
const CDLI_DETAIL_PHOTO = 'cdli_detail_photo'

const titles: ReadonlyMap<string, string> = new Map([
  [CDLI_PHOTO, 'Photo'],
  [CDLI_LINE_ART, 'Line Art'],
  [CDLI_DETAIL_LINE_ART, 'Detail Line Art'],
  [CDLI_DETAIL_PHOTO, 'Detail Photo'],
])

function getImageType(url: string): string {
  if (url.endsWith('_l.jpg')) {
    return CDLI_LINE_ART
  } else if (url.endsWith('_d.jpg')) {
    return CDLI_DETAIL_PHOTO
  } else if (url.endsWith('_ld.jpg')) {
    return CDLI_DETAIL_LINE_ART
  } else {
    return CDLI_PHOTO
  }
}

function cdliTab(eventKey: string, url: string | null): JSX.Element | null {
  const title = titles.get(eventKey)

  return _.isNil(url) ? null : (
    <Tab eventKey={eventKey} title={title} tabClassName="Images__cdli-tab">
      <LinkedImage src={url} alt={`CDLI ${title}`} />
    </Tab>
  )
}

interface CdliImagesProps {
  cdliPhotos: string[]
}

function CdliImages({ cdliPhotos }: CdliImagesProps): JSX.Element {
  const imageUrls = {
    [CDLI_PHOTO]: null,
    [CDLI_LINE_ART]: null,
    [CDLI_DETAIL_LINE_ART]: null,
    [CDLI_DETAIL_PHOTO]: null,
  }

  cdliPhotos.forEach((url) => {
    const type = getImageType(url)
    imageUrls[type] = `https://cdli.mpiwg-berlin.mpg.de/${url}`
  })

  return (
    <>
      <Tabs id={_.uniqueId('cdli-images-container-')} variant="pills">
        {cdliTab(CDLI_PHOTO, imageUrls[CDLI_PHOTO])}
        {cdliTab(CDLI_LINE_ART, imageUrls[CDLI_LINE_ART])}
        {cdliTab(CDLI_DETAIL_LINE_ART, imageUrls[CDLI_DETAIL_LINE_ART])}
        {cdliTab(CDLI_DETAIL_PHOTO, imageUrls[CDLI_DETAIL_PHOTO])}
      </Tabs>
      {_(imageUrls).values().every(_.isNil) && 'No images'}
    </>
  )
}

interface Props {
  fragment: Fragment
  fragmentService
}

export default withData<unknown, Props, { cdliPhotos: string[] }>(
  ({ data }) => <CdliImages cdliPhotos={data.cdliPhotos} />,
  ({ fragment, fragmentService }) =>
    fragmentService.fetchCdliPhotos(fragment).catch(() => ({
      cdliPhotos: [],
    }))
)
