import React from 'react'
import { Container } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignsService from 'signs/application/SignsService'
import Sign from 'signs/domain/Sign'
import './signDisplay.css'
import WordService from 'dictionary/application/WordService'
import SignInformation from 'signs/ui/display/SignInformation'
import SignHeading from 'signs/ui/display/SignHeading'
import MesZl from 'signs/ui/display/MesZl'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'

function SignDisplay({
  sign,
  wordService,
}: {
  sign: Sign
  wordService: WordService
}): JSX.Element {
  return (
    <AppContent crumbs={[new SectionCrumb('Signs')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadWords() ? (
            <Container>
              <SignHeading
                signName={sign.name}
                cuneiformLetters={sign.displayCuneiformSigns}
              />
              <SignInformation sign={sign} wordService={wordService} />
              <MesZl signName={sign.name} mesZl={sign.mesZl} />
            </Container>
          ) : (
            <p>Please log in to browse the Signs.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}
type Props = {
  data: Sign
  wordService: WordService
  signsService: SignsService
} & RouteComponentProps<{ id: string }>

export default withData<WithoutData<Props>, { match }, Sign>(
  ({ data, wordService }) => (
    <SignDisplay sign={data} wordService={wordService} />
  ),
  (props) => props.signsService.find(props.match.params['id'])
)
