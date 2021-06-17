import React from 'react'
import { Col, Container, Popover, Row } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignsService from 'signs/application/SignsService'
import Sign from 'signs/domain/Sign'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import './signDisplay.css'
import MesZlContent from 'signs/ui/search/MesZLContent'

function CuneiformFontsHelpPopover(): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('CuneiformFontsHelpHelp-')}
      title="Cuneiform Form Help"
    >
      <Popover.Content>
        <div>Cuneiform fonts by S. Vanserveren </div>
      </Popover.Content>
    </Popover>
  )
}

function SignHeading({
  signName,
  cuneiformLetters,
}: {
  signName: string
  cuneiformLetters: string
}): JSX.Element {
  const CuneiformFonts = ({
    font = '',
    description,
  }: {
    font?: string
    description: string
  }): JSX.Element => (
    <Col xs={4}>
      <Row>
        <Col xs={3}>
          <h2 className={font}>{cuneiformLetters}</h2>
        </Col>
        <Col>
          <span className={'text-secondary'}>{description}</span>
        </Col>
      </Row>
    </Col>
  )

  return (
    <Row>
      <Col xs={3}>
        <h1>{signName}</h1>
      </Col>
      <Col>
        <Row>
          <CuneiformFonts
            font={'CuneiformFonts__heading-old-babylonian-monumental'}
            description={'Old-Babylonian (Monumental)'}
          />
          <CuneiformFonts
            font={'CuneiformFonts__heading-old-babylonian-cursive'}
            description={'Old-Babylonian Cursive'}
          />
          <CuneiformFonts
            font={'CuneiformFonts__heading-hittite'}
            description={'Hittite'}
          />
          <CuneiformFonts description={'Neo-Assyrian'} />
          <CuneiformFonts
            font={'CuneiformFonts__heading-neo-babylonian'}
            description={'Neo-Babylonian'}
          />
          <HelpTrigger className="ml-3" overlay={CuneiformFontsHelpPopover()} />
        </Row>
      </Col>
    </Row>
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
    <>
      <Row>
        <Col>
          <h1>&#8544;. MesZL</h1>
        </Col>
      </Row>
      <Row>
        <Col className={'p-5'}>
          <MesZlContent signName={signName} mesZl={mesZl} />
        </Col>
      </Row>
    </>
  )
}

function SignDisplay({ sign }: { sign: Sign }): JSX.Element {
  return (
    <Container>
      <SignHeading
        signName={sign.name}
        cuneiformLetters={sign.displayCuneiformSigns}
      />
      <MesZl signName={sign.name} mesZl={sign.mesZl} />
    </Container>
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
