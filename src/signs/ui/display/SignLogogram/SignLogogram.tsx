import WordService from 'dictionary/application/WordService'
import { Col, Popover, Row } from 'react-bootstrap'
import { Logogram } from 'signs/domain/Sign'
import LogogramWord from 'signs/ui/display/SignLogogram/LogogramWord'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import ExternalLink from 'common/ExternalLink'
import React from 'react'
import { compareCleanedAkkadianString } from 'dictionary/domain/compareAkkadianStrings'

export default function SignLogograms({
  signLogograms,
  wordService,
}: {
  signLogograms: readonly Logogram[]
  wordService: WordService
}): JSX.Element {
  return (
    <Row>
      <Col xs={'auto'}>Words (as logogram):</Col>
      <Col>
        <ul>
          {[...signLogograms]
            .sort(
              (logogram2, logogram1) =>
                -compareCleanedAkkadianString(
                  logogram1.wordId[0] || '',
                  logogram2.wordId[0] || '',
                ),
            )
            .map((logogram, index) => (
              <li key={index}>
                <SignLogogramEntry
                  logogram={logogram}
                  wordService={wordService}
                />
              </li>
            ))}
        </ul>
      </Col>
    </Row>
  )
}

function SignLogogramEntry({
  logogram,
  wordService,
}: {
  logogram: Logogram
  wordService: WordService
}): JSX.Element {
  return (
    <Row>
      <Col xs={5}>
        {logogram.wordId.length > 0 && (
          <SignLogogramEntryWords
            logogramWordIds={logogram.wordId}
            wordService={wordService}
          />
        )}
        {logogram.logogram && (
          <span>
            (
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
          <HelpTrigger
            delay={{ show: 0, hide: 1500 }}
            overlay={SignLogogramInfo(logogram.schrammLogogramme)}
          />
        )}
      </Col>
    </Row>
  )
}

function SignLogogramEntryWords({
  logogramWordIds,
  wordService,
}: {
  logogramWordIds: readonly string[]
  wordService: WordService
}): JSX.Element {
  return (
    <>
      {logogramWordIds.map((wordIdElem, index) => (
        <span key={index}>
          <LogogramWord wordId={wordIdElem} wordService={wordService} />
          {index < logogramWordIds.length - 1 ? ', ' : ''}
        </span>
      ))}
      &nbsp;
    </>
  )
}

function SignLogogramInfo(schrammLogogram: string): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('LogogramInfo-')}
      title="Logogram Info"
      className={'signDisplay__LogogramInfo'}
    >
      <Popover.Body>
        <MarkdownAndHtmlToHtml
          className="text-center my-1"
          markdownAndHtml={schrammLogogram}
        />
        <div className="text-center mt-3">
          <small>
            From W. Schramm,{' '}
            <em>Akkadische Logogramme. Zweite, revidierte Auflage.&nbsp;</em>
            Göttinger Beiträge zum Alten Orient 5. Göttingen: Universitätsverlag
            Göttingen,&nbsp;
            <sup>2</sup>2010. (
            <ExternalLink
              href={'https://creativecommons.org/licenses/by-nd/3.0/de/'}
            >
              CC BY-ND 3.0
            </ExternalLink>
            ).
            <br /> <br />
            <ExternalLink
              className="text-dark "
              href="https://doi.org/10.17875/gup2010-511"
            >
              <i className="fas fa-external-link-square-alt fa-2x" />
            </ExternalLink>
          </small>
        </div>
      </Popover.Body>
    </Popover>
  )
}
