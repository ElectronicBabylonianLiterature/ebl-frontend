import React from 'react'
import { Col, Container, Popover, Row } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignsService from 'signs/application/SignsService'
import Sign, { Logogram } from 'signs/domain/Sign'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import './signDisplay.css'
import { DisplaySignValues } from 'signs/ui/search/SignsSearch'
import MesZlContent from 'signs/ui/search/MesZLContent'
import Word from './Word'
import WordService from 'dictionary/application/WordService'

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

function SignInformation({
  sign,
  wordService,
}: {
  sign: Sign
  wordService: WordService
}): JSX.Element {
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
        <Col xs={'auto'}>Words (as logogram):</Col>
        <Col>
          <Logograms logograms={sign.logograms} wordService={wordService} />
        </Col>
      </Row>
      <Row>
        <Col></Col>
      </Row>
    </>
  )
}

function WordsWithLink({
  wordIds,
  wordService,
}: {
  wordIds: readonly string[]
  wordService: WordService
}): JSX.Element {
  return (
    <>
      {wordIds.map((wordId, index) => (
        <span key={index}>
          <Word wordId={wordId} wordService={wordService} />
          {index < wordIds.length - 1 ? ', ' : ''}
        </span>
      ))}
    </>
  )
}
function LogogramDisplay({
  logogram,
  wordService,
}: {
  logogram: Logogram
  wordService: WordService
}): JSX.Element {
  return (
    <div>
      <WordsWithLink wordIds={logogram.wordId} wordService={wordService} />
    </div>
  )
}

function Logograms({
  logograms,
  wordService,
}: {
  logograms: readonly Logogram[]
  wordService: WordService
}): JSX.Element {
  return (
    <ul>
      {logograms.map((logogram, index) => (
        <li key={index}>
          <LogogramDisplay logogram={logogram} wordService={wordService} />
        </li>
      ))}
    </ul>
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
