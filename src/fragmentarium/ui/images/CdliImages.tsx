import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

import withData from 'http/withData'
import LinkedImage from 'common/LinkedImage'
import { Fragment } from 'fragmentarium/domain/fragment'
import { CdliInfo } from 'fragmentarium/application/FragmentService'

const CDLI_PHOTO = 'cdli_photo'
const CDLI_LINE_ART = 'cdli_line_art'
const CDLI_DETAIL_LINE_ART = 'cdli_detail_line_art'

const titles: ReadonlyMap<string, string> = new Map([
  [CDLI_PHOTO, 'Photo'],
  [CDLI_LINE_ART, 'Line Art'],
  [CDLI_DETAIL_LINE_ART, 'Detail Line Art'],
])

function cdliTab(eventKey: string, url: string | null): JSX.Element | null {
  const title = titles.get(eventKey)

  return _.isNil(url) ? null : (
    <Tab eventKey={eventKey} title={title}>
      <LinkedImage src={url} alt={`CDLI ${title}`} />
    </Tab>
  )
}

interface CdliImagesProps {
  cdliInfo: CdliInfo
}

function CdliImages({ cdliInfo }: CdliImagesProps): JSX.Element {
  return (
    <>
      <Tabs id={_.uniqueId('cdli-images-container-')}>
        {cdliTab(CDLI_PHOTO, cdliInfo.photoUrl)}
        {cdliTab(CDLI_LINE_ART, cdliInfo.lineArtUrl)}
        {cdliTab(CDLI_DETAIL_LINE_ART, cdliInfo.detailLineArtUrl)}
      </Tabs>
      {_(cdliInfo).values().every(_.isNil) && 'No images'}
    </>
  )
}

interface Props {
  fragment: Fragment
  fragmentService
}

export default withData<{}, Props, CdliInfo>(
  ({ data }) => <CdliImages cdliInfo={data} />,
  ({ fragment, fragmentService }) =>
    fragmentService.fetchCdliInfo(fragment).catch(() => ({
      photoUrl: null,
      lineArtUrl: null,
      detailLineArtUrl: null,
    }))
)
