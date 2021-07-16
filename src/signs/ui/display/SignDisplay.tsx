import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignService from 'signs/application/SignService'
import Sign from 'signs/domain/Sign'
import './signDisplay.css'
import WordService from 'dictionary/application/WordService'
import SignInformation from 'signs/ui/display/SignInformation'
import SignHeading from 'signs/ui/display/SignHeading'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import MesZlContent from 'signs/ui/search/MesZLContent'

function SignDisplay({
  sign,
  wordService,
  signService,
}: {
  sign: Sign
  signService: SignService
  wordService: WordService
}): JSX.Element {
  return (
    <AppContent
      crumbs={[new SectionCrumb('Signs'), new TextCrumb(sign.displaySignName)]}
      title={' '}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <Container>
              <SignHeading
                signName={sign.displaySignName}
                cuneiformLetters={sign.displayCuneiformSigns}
              />
              <SignInformation
                signService={signService}
                sign={sign}
                wordService={wordService}
              />
              {sign.mesZl && <MesZl signName={sign.name} mesZl={sign.mesZl} />}
            </Container>
          ) : (
            <p>Please log in to browse the Signs.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

function MesZl({
  signName,
  mesZl,
}: {
  signName: string
  mesZl: string
}): JSX.Element | null {
  return (
    <Row className={'mt-5'}>
      <Row>
        <Col>
          <h3>&#8545;. Mesopotamisches Zeichenlexikon</h3>
        </Col>
      </Row>
      <div className={'ml-5'}>
        <Row>
          <Col className={'ml-4 mt-3'}>
            <MesZlContent signName={signName} mesZl={mesZl} />
          </Col>
        </Row>
      </div>
    </Row>
  )
}

type Props = {
  data: Sign
  wordService: WordService
  signService: SignService
} & RouteComponentProps<{ id: string }>

export default withData<WithoutData<Props>, { match }, Sign>(
  ({ data, wordService, signService }) => (
    <SignDisplay
      sign={data}
      wordService={wordService}
      signService={signService}
    />
  ),
  (props) => props.signService.find(props.match.params['id'])
)