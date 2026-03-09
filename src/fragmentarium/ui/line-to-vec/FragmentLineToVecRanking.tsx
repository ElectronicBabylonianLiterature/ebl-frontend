import React, { ReactNode } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import withData from 'http/withData'
import { LineToVecRanking, LineToVecScore } from '../../domain/lineToVecRanking'
import { HeadTags } from 'router/head'

function FragmentLineToVecRankingHeadTags({
  number,
}: {
  number: string
}): JSX.Element {
  return (
    <HeadTags
      title={`Fragment ${number} ranking: eBL`}
      description={`Fragment ${number} line-to-vector ranking in the electronic Babylonian Library (eBL) Library.`}
    />
  )
}

function FragmentLineToVecRanking({
  lineToVecRanking,
  number,
}: {
  number: string
  lineToVecRanking: LineToVecRanking
}): JSX.Element {
  const RankingList = ({
    scores,
  }: {
    scores: readonly LineToVecScore[]
  }): JSX.Element => {
    const listOfScores = scores.map((score, index) => (
      <li key={index}>
        <a href={`/library/${score.museumNumber}`}>{score.museumNumber}</a>
        ,&nbsp;
        {score.script.period.name}:&nbsp;{score.score}
      </li>
    ))
    return <ul>{listOfScores}</ul>
  }
  const LineToVecDisplay = ({
    lineToVecRanking,
  }: {
    lineToVecRanking: LineToVecRanking
  }) => (
    <Container>
      <Row>
        <Col>
          <Row>Score</Row>
          <RankingList scores={lineToVecRanking.score} />
        </Col>
        <Col>
          <Row>Weighted Score</Row>
          <RankingList scores={lineToVecRanking.scoreWeighted} />
        </Col>
      </Row>
    </Container>
  )

  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Library'),
        new FragmentCrumb(number),
        new TextCrumb('Ranking LineToVec Matches'),
      ]}
      title={`LineToVec Ranking for ${number}`}
    >
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToReadFragments() ? (
            <>
              <FragmentLineToVecRankingHeadTags number={number} />
              <LineToVecDisplay lineToVecRanking={lineToVecRanking} />
            </>
          ) : (
            'Please log in to look up matching Fragments'
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default withData<
  { fragmentService; number: string },
  { number: string },
  LineToVecRanking
>(
  ({ data, ...props }) => (
    <FragmentLineToVecRanking lineToVecRanking={data} number={props.number} />
  ),
  (props) => props.fragmentService.lineToVecRanking(props.number),
  {
    watch: (props) => [props.number],
  },
)
