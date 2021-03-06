import { Col, Container, Row } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import React, { ReactNode } from 'react'
import withData from 'http/withData'
import { LineToVecRanking } from '../../domain/lineToVecRanking'

function FragmentLineToVecRanking({
  lineToVecRanking,
  number,
}: {
  number: string
  lineToVecRanking: LineToVecRanking
}): JSX.Element {
  const RankingList = ({ score }) => {
    return score.map((score, index) => (
      <li key={index}>
        <a href={`fragmentarium/${score.id}`}>{score.museumNumber}</a>,&nbsp;
        {score.script}:&nbsp;{score.score}
      </li>
    ))
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
          <RankingList score={lineToVecRanking.score} />
        </Col>
        <Col>
          <Row>Weighted Score</Row>
          <RankingList score={lineToVecRanking.scoreWeighted} />
        </Col>
      </Row>
    </Container>
  )

  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Fragmentarium'),
        new FragmentCrumb(number),
        new TextCrumb('Ranking LineToVec Matches'),
      ]}
      title={`LineToVec Ranking for ${number}`}
    >
      <SessionContext.Consumer>
        {(session: Session): ReactNode =>
          session.isAllowedToReadFragments() ? (
            <LineToVecDisplay lineToVecRanking={lineToVecRanking} />
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
  }
)
