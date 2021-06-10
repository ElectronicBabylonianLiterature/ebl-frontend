import React from 'react'
import { Col, Container, Popover, Row } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignsService from 'signs/application/SignsService'
import Sign from 'signs/domain/Sign'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import './signDisplay.css'
import { DisplaySignValues } from 'signs/ui/search/SignsSearch'
import MesZlContent from 'signs/ui/search/MesZLContent'

function CuneiformFontsHelpPopover(): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('CuneiformFontsHelpHelp-')}
      title="Cuneiform Form Help"
    >
      <Popover.Content>
        <div>Help</div>
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
    font = undefined,
    description,
  }: {
    font?: string | undefined
    description: string
  }): JSX.Element => (
    <Col xs={4}>
      <Row>
        <Col xs={3}>
          <h2 className={font ? font : ''}>{cuneiformLetters}</h2>
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
            font={'old-babylonian-monumental'}
            description={'Old-Babylonian (Monumental)'}
          />
          <CuneiformFonts
            font={'old-babylonian-cursive'}
            description={'Old-Babylonian Cursive'}
          />
          <CuneiformFonts font={'hittite'} description={'Hittite'} />
          <CuneiformFonts description={'Neo-Assyrian'} />
          <CuneiformFonts
            font={'neo-babylonian'}
            description={'Neo-Babylonian'}
          />
          <HelpTrigger className="ml-3" overlay={CuneiformFontsHelpPopover()} />
        </Row>
      </Col>
    </Row>
  )
}

function SignInformation({ sign }: { sign: Sign }): JSX.Element {
  console.log(sign)
  return (
    <>
      <Row>
        <Col>
          <h1>1. Sign Information</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          Sign Lists:{' '}
          {sign.lists.map((signListRecord, index) => (
            <span key={index}>
              <em>{signListRecord.name}</em>&nbsp;{signListRecord.number}
              {index < sign.lists.length - 1 ? ', ' : ''}
            </span>
          ))}
        </Col>
      </Row>
      <Row>
        <Col>
          Readings: <DisplaySignValues sign={sign} />
        </Col>
      </Row>
      <Row>
        <Col>Words (as logogram):</Col>
        <Col></Col>
      </Row>
      <Row>
        <Col></Col>
      </Row>
    </>
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
          <h1>2. MesZL</h1>
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
      <SignInformation sign={sign} />
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
