import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignService from 'signs/application/SignService'
import Sign from 'signs/domain/Sign'
import 'signs/ui/display/SignDisplay.css'
import WordService from 'dictionary/application/WordService'
import SignInformation from 'signs/ui/display/SignInformation'
import SignHeading from 'signs/ui/display/SignHeading'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import MesZlContent from 'signs/ui/search/MesZLContent'
import FosseyContent from 'signs/ui/display/SignFossey'
import { LiteratureRedirectBox } from 'common/LiteratureRedirectBox'

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
    <SessionContext.Consumer>
      {(session: Session): JSX.Element => (
        <AppContent
          crumbs={[
            new SectionCrumb('Signs'),
            new TextCrumb(sign.displaySignName),
          ]}
          title={' '}
        >
          {session.isAllowedToReadWords() ? (
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
              {sign.fossey && <Fossey fossey={sign.fossey} />}
              {sign.fossey && (
                <LiteratureRedirectBox
                  authors="Fossey, Ch."
                  book="Manuel d’assyriologie, Tome deuxième: Evolution des cunéiformes"
                  subtitle="Paris: Conard, 1926"
                  notelink=""
                  note="In the public domain"
                  link="https://www.europeana.eu/en/rights/public-domain-charter"
                  icon="pointer__hover my-2 fas fa-external-link-square-alt"
                />
              )}
            </Container>
          ) : (
            <p>Please log in to browse the Signs.</p>
          )}
        </AppContent>
      )}
    </SessionContext.Consumer>
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

function Fossey({ fossey }: { fossey: any }): JSX.Element | null {
  return (
    <Row className={'mt-5'}>
      <Row>
        <Col>
          <h3>&#8546;. Fossey, Manuel d’assyriologie &#8545;</h3>
        </Col>
      </Row>
      <div className={'ml-5'}>
        <Row>
          <Col className={'ml-4 mt-3'}>
            <FosseyContent fossey={fossey} />
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
  (props) =>
    props.signService.find(decodeURIComponent(props.match.params['id']))
)
