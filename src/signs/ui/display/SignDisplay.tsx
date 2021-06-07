import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignsService from 'signs/application/SignsService'
import Sign from 'signs/domain/Sign'

function SignDisplay({ sign }: { sign: Sign }): JSX.Element {
  return (
    <Row>
      <Col>{JSON.stringify(sign)}</Col>
    </Row>
  )
}
type Props = {
  data: Sign
  signsService: SignsService
} & RouteComponentProps<{ id: string }>

export default withData<WithoutData<Props>, { match; signsService }, Sign>(
  ({ data }) => <SignDisplay sign={data} />,
  (props) => props.signsService.find(props.match.params['id'])
)
