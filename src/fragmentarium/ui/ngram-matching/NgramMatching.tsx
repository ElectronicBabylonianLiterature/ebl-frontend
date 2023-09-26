import React, { ReactNode } from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import withData from 'http/withData'
import { HeadTags } from 'router/head'
import FragmentService from 'fragmentarium/application/FragmentService'
import { NgramScore } from 'fragmentarium/domain/ngramMatching'
import { Col, Container, Row } from 'react-bootstrap'
import { chapterIdToString } from 'transliteration/domain/chapter-id'
import _ from 'lodash'
import { Markdown } from 'common/Markdown'
import { genreFromAbbr } from 'corpus/ui/Corpus'

function NgramMatchingHeadTags({ number }: { number: string }): JSX.Element {
  return (
    <HeadTags
      title={`Fragment ${number} N-gram Matching: eBL`}
      description={`Fragment ${number} n-gram matching in the electronic Babylonian Library (eBL) Fragmentarium.`}
    />
  )
}

function NgramMatching({
  number,
  ngramScores,
}: {
  number: string
  ngramScores: readonly NgramScore[]
}): JSX.Element {
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Fragmentarium'),
        new FragmentCrumb(number),
        new TextCrumb('N-Gram Matching'),
      ]}
      title={`Find Similar Chapters for ${number}`}
    >
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToReadFragments() ? (
            <>
              <NgramMatchingHeadTags number={number} />
              <Container>
                {ngramScores.map((score, index) => (
                  <Row key={index}>
                    <Col xs={1}>{index + 1}.</Col>
                    <Col>
                      <Markdown text={genreFromAbbr(score.textId.genre)} />
                      {score.textName && (
                        <>
                          {' > '}
                          <Markdown text={score.textName} />
                        </>
                      )}
                      {' > '}
                      {chapterIdToString(_.omit(score, 'score', 'textName'))}
                    </Col>
                    <Col xs={1}>{score.score.toFixed(4)}</Col>
                  </Row>
                ))}
              </Container>
            </>
          ) : (
            'Please log in to search for matching chapters'
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default withData<
  { fragmentService: FragmentService; number: string },
  { number: string },
  readonly NgramScore[]
>(
  ({ data, ...props }) => (
    <NgramMatching ngramScores={data} number={props.number} />
  ),
  (props) => props.fragmentService.ngramScores(props.number)
)
