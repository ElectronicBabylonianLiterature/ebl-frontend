import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignsService from 'signs/application/SignsService'
import Sign from 'signs/domain/Sign'
import 'signs/ui/display/signDisplay.css'
import WordService from 'dictionary/application/WordService'
import { Container } from 'react-bootstrap'
import SignInformation from 'signs/ui/display/SignInformation'

function SignDisplay({
  sign,
  wordService,
}: {
  sign: Sign
  wordService: WordService
}): JSX.Element {
  return (
    <Container>
      <SignInformation sign={sign} wordService={wordService} />
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
