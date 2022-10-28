import React, { Fragment } from 'react'
import Bluebird from 'bluebird'
import { Col, Row } from 'react-bootstrap'
import { Logogram } from 'dictionary/domain/Word'
import SignService from 'signs/application/SignService'
import { Markdown } from 'common/Markdown'
import withData from 'http/withData'
import Sign from 'signs/domain/Sign'
import { flatten } from 'lodash'

function filterLogogramsData(
  signs: readonly Sign[],
  wordId: string
): { firstSignName: string; unicode: string; note: string }[] {
  return flatten(
    signs.map((sign) =>
      sign.logograms
        .filter((logogram) => logogram.wordId.includes(wordId))
        .map((logogram) => {
          return {
            firstSignName: sign.name,
            unicode: sign.displayCuneiformSigns,
            note: logogram.schrammLogogramme,
          }
        })
    )
  )
}

function getBasicSigns(logograms: readonly Logogram[]): string[] {
  return [
    ...new Set(
      logograms
        .filter((logogram) => logogram.logogram.length)
        .map((logogram) => logogram.logogram[0].replace('+', '').split('.')[0])
    ),
  ]
}

function LogogramsDisplay({
  signs,
  wordId,
}: {
  signs: readonly Sign[]
  wordId: string
}): JSX.Element {
  const filteredLogograms = filterLogogramsData(signs, wordId)
  return (
    <Fragment key="akkadischeLogogramme">
      {filteredLogograms.map((logogram, i) => (
        <Row className="ml-5" key={`logogram_${i}`}>
          <Col>
            <a href={`/signs/${logogram.firstSignName}`}>{logogram.unicode}</a>
            &emsp;
            <Markdown text={logogram.note} />
          </Col>
        </Row>
      ))}
    </Fragment>
  )
}

export default withData<
  {
    signService: SignService
    wordId: string
  },
  { logograms: readonly Logogram[] },
  Sign[]
>(
  ({ data: signs, wordId, ...props }) => (
    <LogogramsDisplay signs={signs} wordId={wordId} {...props} />
  ),
  ({ signService, logograms }) => {
    // ToDo: update SignService to query logograms by `wordId` directly.
    const basicSigns = getBasicSigns(logograms)
    return Bluebird.all(
      basicSigns.map((basicSign) => {
        return signService.find(decodeURIComponent(basicSign))
      })
    )
  }
)
