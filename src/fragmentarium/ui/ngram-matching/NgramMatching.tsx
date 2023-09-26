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
import { GenreInfoRow } from 'corpus/ui/search/CorpusSearchResult'
import _ from 'lodash'

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
      title={`N-Gram Matching for ${number}`}
    >
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToReadFragments() ? (
            <>
              <NgramMatchingHeadTags number={number} />
              <Container>
                {ngramScores.map((score, index) => (
                  <Row key={index}>
                    <Col>
                      {
                        <GenreInfoRow
                          chapterId={_.omit(score, 'overlap', 'textName')}
                          textName={score.textName}
                        />
                      }
                    </Col>
                    <Col>{score.score.toFixed(4)}</Col>
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
