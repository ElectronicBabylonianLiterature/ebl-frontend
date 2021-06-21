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

function SignDisplay({
  sign,
  wordService,
}: {
  sign: Sign
  wordService: WordService
}): JSX.Element {
  return (
    <Container>
      <SignHeading
        signName={sign.name}
        cuneiformLetters={sign.displayCuneiformSigns}
      />
      <SignInformation sign={sign} wordService={wordService} />
      <MesZl signName={sign.name} mesZl={sign.mesZl} />
    </Container>
  )
}
type Props = {
  data: Sign
  wordService: WordService
  signsService: SignsService
} & RouteComponentProps<{ id: string }>

export default withData<WithoutData<Props>, { match; signsService }, Sign>(
  ({ data, wordService }) => (
    <SignDisplay sign={data} wordService={wordService} />
  ),
  (props) => props.signsService.find(props.match.params['id'])
)
