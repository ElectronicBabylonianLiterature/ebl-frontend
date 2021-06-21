import React from 'react'
import { Col, Container, Popover, Row } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'
import withData, { WithoutData } from 'http/withData'
import SignsService from 'signs/application/SignsService'
import Sign, { Logogram } from 'signs/domain/Sign'
import './signDisplay.css'
import { DisplaySignValues } from 'signs/ui/search/SignsSearch'
import Word from './Word'
import WordService from 'dictionary/application/WordService'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import { ContainerWithInnerHtml } from 'common/markdownToHtml'
import ExternalLink from 'common/ExternalLink'

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
    <Row>
      <Col>
        {logogram.wordId.map((wordIdElem, index) => (
          <span key={index}>
            <Word wordId={wordIdElem} wordService={wordService} />
            {index < logogram.wordId.length - 1 ? ', ' : ''}
          </span>
        ))}
        {logogram.logogram && (
          <span>
            &nbsp;(
            <ContainerWithInnerHtml
              container={'span'}
              markdown={logogram.logogram}
            />
            )
          </span>
        )}
      </Col>
      <Col>
        {logogram.schrammLogogramme && (
          <span>
            &nbsp;
            <HelpTrigger
              delay={{ show: 0, hide: 1500 }}
              overlay={LogogramInfo(logogram.schrammLogogramme)}
            />
          </span>
        )}
      </Col>
    </Row>
  )
}

function LogogramInfo(schrammLogogram: string): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('LogogramInfo-')}
      title="Logogram Info"
      className={'signDisplay__LogogramInfo'}
    >
      <Popover.Content>
        <ContainerWithInnerHtml markdown={schrammLogogram} />
        <div className="text-center mt-3">
          <small>
            <strong>From</strong>
            <br />
            R. Borger,{' '}
            <em>
              Mesopotamisches Zeichenlexikon. Zweite, revidierte und
              aktualisierte Auflage.&nbsp;
            </em>
            Alter Orient und Altes Testament 305.
            <br /> Münster: Ugarit-Verlag, <sup>2</sup>2010; Kapitel &#8546;.
            <strong>By permission from Ugarit-Verlag.</strong>
            <br />
            <ExternalLink
              className="text-dark "
              href="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514"
            >
              <i className="fas fa-shopping-cart fa-2x" />
            </ExternalLink>
          </small>
        </div>
      </Popover.Content>
    </Popover>
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
