import Sign, { Logogram } from 'signs/domain/Sign'
import WordService from 'dictionary/application/WordService'
import { Col, Popover, Row } from 'react-bootstrap'
import { DisplaySignValues } from 'signs/ui/search/SignsSearch'
import LogogramWord from 'signs/ui/display/LogogramWord'
import { ContainerWithInnerHtml } from 'common/markdownToHtml'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import ExternalLink from 'common/ExternalLink'
import React from 'react'

export default function SignInformation({
  sign,
  wordService,
}: {
  sign: Sign
  wordService: WordService
}): JSX.Element {
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
            <LogogramWord wordId={wordIdElem} wordService={wordService} />
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
        <ContainerWithInnerHtml
          className="text-center my-1"
          markdown={schrammLogogram}
        />
        <div className="text-center mt-3">
          <small>
            From W. Schramm,{' '}
            <em>Akkadische Logogramme. Zweite, revidierte Auflage.&nbsp;</em>
            Göttinger Beiträge zum Alten Orient 5. Göttingen: Universitätsverlag
            Göttingen,
            <sup>2</sup>2010. (CC BY-ND 3.0).
            <br /> <br />
            <ExternalLink
              className="text-dark "
              href="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514"
            >
              <i className="fas fa-external-link-square-alt fa-2x" />
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
