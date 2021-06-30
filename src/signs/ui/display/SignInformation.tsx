import Sign, { Logogram } from 'signs/domain/Sign'
import WordService from 'dictionary/application/WordService'
import { Col, Popover, Row } from 'react-bootstrap'
import { DisplaySignValues } from 'signs/ui/search/SignsSearch'
import LogogramWord from 'signs/ui/display/LogogramWord'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import ExternalLink from 'common/ExternalLink'
import React from 'react'
import CompositeSigns from 'signs/ui/display/CompositeSigns'
import SignService from 'signs/application/SignService'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'

export default function SignInformation({
  sign,
  wordService,
  signService,
}: {
  sign: Sign
  wordService: WordService
  signService: SignService
}): JSX.Element {
  return (
    <>
      <Row>
        <Col>
          <h3>&#8544;. Sign Information</h3>
        </Col>
      </Row>
      <Col className={'ml-3 mt-3'}>
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
          <Col>
            <CompositeSigns
              signService={signService}
              query={{
                isComposite: true,
                value: replaceTransliteration(sign.name.toLowerCase()),
                subIndex: 1,
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>Bibliography: Owen, 1981: 40; Steinkeller, 1991: 72.</Col>
        </Row>
      </Col>
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
            <MarkdownAndHtmlToHtml
              container={'span'}
              markdownAndHtml={logogram.logogram}
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
        <MarkdownAndHtmlToHtml
          className="text-center my-1"
          markdownAndHtml={schrammLogogram}
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
