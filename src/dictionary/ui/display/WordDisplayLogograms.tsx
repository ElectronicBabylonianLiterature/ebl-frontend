import React, { Fragment } from 'react'
import Bluebird from 'bluebird'
import { Col, Row } from 'react-bootstrap'
import SignService from 'signs/application/SignService'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import withData from 'http/withData'
import Sign from 'signs/domain/Sign'
import { flatten } from 'lodash'
import { LiteratureRedirectBox } from 'common/LiteratureRedirectBox'
import { EmptySection } from 'dictionary/ui/display/EmptySection'

function filterLogogramsData(
  signs: readonly Sign[],
  wordId: string,
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
        }),
    ),
  )
}

const SchrammCitation = (
  <LiteratureRedirectBox
    authors="Schramm, W."
    book="Akkadische Logogramme"
    notelink="https://creativecommons.org/licenses/by-nd/3.0/"
    subtitle="Zweite, revidierte Auflage. Göttinger Beiträge zum Alten Orient 5. Göttingen: Universitätsverlag
Göttingen, ²2010"
    note="CC BY-ND 3.0"
    link="https://univerlag.uni-goettingen.de/handle/3/isbn-978-3-941875-65-4"
    icon="pointer__hover my-2 fas fa-external-link-square-alt"
  />
)

function LogogramsDisplay({
  signs,
  wordId,
}: {
  signs: readonly Sign[]
  wordId: string
}): JSX.Element {
  const filteredLogograms = filterLogogramsData(signs, wordId)
  if (filteredLogograms.length > 0) {
    return (
      <Fragment key="akkadischeLogogramme">
        {filteredLogograms.map((logogram, index) => (
          <Row className="ml-5" key={`logogram_${index}`}>
            <Col>
              <span className="unicode-large">
                <a
                  href={`/signs/${encodeURIComponent(logogram.firstSignName)}`}
                >
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
        {SchrammCitation}
      </Fragment>
    )
  } else {
    return <EmptySection key="akkadischeLogogramme" />
  }
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
      signService.search({ wordId: decodeURIComponent(wordId) }),
    )
  },
)
