import React, { Fragment } from 'react'
import Bluebird from 'bluebird'
import { Col, Row } from 'react-bootstrap'
import SignService from 'signs/application/SignService'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
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
            unicode: logogram.unicode,
            note: logogram.schrammLogogramme,
          }
        })
    )
  )
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
      {filteredLogograms.map((logogram, index) => (
        <Row className="ml-5" key={`logogram_${index}`}>
          <Col>
            <span className="unicode-large">
              <a href={`/signs/${logogram.firstSignName}`}>
                {logogram.unicode}
              </a>
            </span>
            &emsp;
            <MarkdownAndHtmlToHtml
              markdownAndHtml={logogram.note}
              container="span"
            />
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
  { wordId: string },
  Sign[]
>(
  ({ data: signs, wordId, ...props }) => {
    return <LogogramsDisplay signs={signs} wordId={wordId} {...props} />
  },
  ({ signService, wordId }) => {
    return Bluebird.all(
      signService.search({ wordId: decodeURIComponent(wordId) })
    )
  }
)
