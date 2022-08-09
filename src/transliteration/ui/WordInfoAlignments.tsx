import React, { useMemo } from 'react'
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

const AlignedTokens = withData<
  {
    lineGroup: LineGroup
    tokenIndex: number
    lemma: readonly string[]
    dictionary: WordService
  },
  {
    lineGroup: LineGroup
  },
  LineDetails
>(
  ({
    data: line,
    lineGroup,
    tokenIndex,
    lemma: reconstructionLemma,
    dictionary,
  }): JSX.Element => {
    if (!lineGroup.hasManuscriptLines) {
      lineGroup.setLineDetails(line)
    }
    const manuscripts = lineGroup.manuscriptLines
    const alignedTokens = useMemo(
      () =>
        _(manuscripts)
          .flatMap((tokens) =>
            tokens.filter((token) => token.alignment === tokenIndex)
          )
          .sortBy((token) => token.isVariant)
          .groupBy((token) => token.cleanValue),
      [manuscripts, tokenIndex]
    )

    let variantNumber = 1

    return (
      <Container className="word-info__aligned-tokens">
        {alignedTokens
          .map((tokens, index) => {
            const lineToken = tokens[0]
            const sigla = tokens
              .map((token: LineToken) => token.siglum)
              .join(', ')
            const isSameLemma = !_.isEqual(
              reconstructionLemma,
              lineToken.token.uniqueLemma
            )
            return (
              <React.Fragment key={index}>
                {lineToken.isVariant && (
                  <Row className="word-info__words word-info__variant--heading">
                    <Col xs="auto">
                      {`Variant${numberToUnicodeSubscript(variantNumber++)}:`}
                      &nbsp;
                    </Col>
                    <Col>
                      <span className="word-info__variant--guideword">
                        <span>{lineToken.token.variant?.value}</span>
                        {isSameLemma && (
                          <>
                            {';'}
                            &nbsp;
                          </>
                        )}
                      </span>
                      {isSameLemma && (
                        <LemmaInfo
                          word={lineToken.token}
                          dictionary={dictionary}
                          manuscriptLines={manuscripts}
                        />
                      )}
                    </Col>
                  </Row>
                )}
                <Row className="word-info__words">
                  <Col className="word-info__aligned-word">
                    <DisplayToken
                      key={index}
                      token={lineToken.token as Token}
                      isInPopover={true}
                    />
                  </Col>
                  <Col className="word-info__sigla">{sigla}</Col>
                </Row>
              </React.Fragment>
            )
          })
          .value()}
      </Container>
    )
  },
  ({ lineGroup }) => lineGroup.findChapterLine(),
  {
    filter: (props) => !props.lineGroup.hasManuscriptLines,
    defaultData: (props) => props.lineGroup.lineDetails,
  }
)

export function Alignments({
  tokenIndex,
  lemma,
  lineGroup,
  dictionary,
}: {
  tokenIndex: number
  lemma: readonly string[]
  lineGroup: LineGroup
  dictionary: WordService
}): JSX.Element {
  return (
    <AlignedTokens
      tokenIndex={tokenIndex}
      lemma={lemma}
      lineGroup={lineGroup}
      dictionary={dictionary}
    />
  )
}
