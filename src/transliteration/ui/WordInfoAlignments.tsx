import React from 'react'
import { LineDetails } from 'corpus/domain/line-details'
import WordService from 'dictionary/application/WordService'
import withData from 'http/withData'
import _ from 'lodash'
import { Container, Row, Col } from 'react-bootstrap'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'
import DisplayToken from './DisplayToken'
import { LineToken } from './line-tokens'
import { LineGroup } from './LineGroup'
import LemmaInfo from './WordInfoLemmas'
import { Token } from 'transliteration/domain/token'

function AlignedTokens({
  manuscripts,
  tokenIndex,
  dictionary,
  lineGroup,
}: {
  manuscripts: LineToken[][]
  tokenIndex: number
  dictionary: WordService
  lineGroup: LineGroup
}) {
  const alignedTokens = manuscripts.flatMap((tokens) =>
    tokens.filter((token) => token.alignment === tokenIndex)
  )
  let variantNumber = 1
  return (
    <Container className="word-info__aligned-tokens">
      {_(alignedTokens)
        .groupBy((token) => token.cleanValue)
        .map((tokens, index) => {
          const lineToken = tokens[0]
          const sigla = tokens
            .map((token: LineToken) => token.siglum)
            .join(', ')
          return (
            <React.Fragment key={index}>
              {lineToken.isVariant && (
                <Row className="word-info__words">
                  <Col className="word-info__variant-heading">{`Variant${numberToUnicodeSubscript(
                    variantNumber++
                  )}:`}</Col>
                </Row>
              )}
              <Row className="word-info__words">
                <Col className="word-info__sigla">{sigla}</Col>
                <Col>
                  <DisplayToken
                    key={index}
                    token={lineToken.token as Token}
                    isInPopover={true}
                  />
                </Col>
              </Row>
              {lineToken.isVariant && (
                <Row className="word-info__words">
                  <Col>
                    <LemmaInfo
                      word={lineToken.token}
                      dictionary={dictionary}
                      manuscriptLines={lineGroup.manuscriptLines || [[]]}
                    />
                  </Col>
                </Row>
              )}
            </React.Fragment>
          )
        })
        .value()}
    </Container>
  )
}

const AlignmentsWithData = withData<
  { lineGroup: LineGroup; tokenIndex: number; dictionary: WordService },
  {
    lineGroup: LineGroup
  },
  LineDetails
>(
  ({ data: line, lineGroup, tokenIndex, dictionary }): JSX.Element => {
    lineGroup.setLineDetails(line)

    return (
      <AlignedTokens
        manuscripts={lineGroup.manuscriptLines || [[]]}
        tokenIndex={tokenIndex}
        dictionary={dictionary}
        lineGroup={lineGroup}
      />
    )
  },
  ({ lineGroup }) => lineGroup.findChapterLine()
)

export function Alignments({
  tokenIndex,
  lineGroup,
  dictionary,
}: {
  tokenIndex: number
  lineGroup: LineGroup
  dictionary: WordService
}): JSX.Element {
  const AlignmentComponent = lineGroup.hasManuscriptLines
    ? AlignedTokens
    : AlignmentsWithData
  return (
    <AlignmentComponent
      manuscripts={lineGroup.manuscriptLines || [[]]}
      tokenIndex={tokenIndex}
      lineGroup={lineGroup}
      dictionary={dictionary}
    />
  )
}
