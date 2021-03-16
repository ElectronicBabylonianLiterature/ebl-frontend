import React, { ElementType } from 'react'
import { Col, Row } from 'react-bootstrap'
import { HashLink } from 'react-router-hash-link'
import './wordInformationDisplay.css'
import ReactMarkdown from 'react-markdown'
import * as remarkSubSuper from 'remark-sub-super'

export function replaceByCurlyQuotes(str: string): string {
  return str.replace(/"([^"]*)"/g, '“$1”').replace(/'([^']*)'/g, '“$1”')
}

export function OtherForms({
  forms,
}: {
  forms: { attested: boolean; lemma: string[] }[]
}): JSX.Element {
  const otherForm = (form) => {
    const attested = form.attested ? '' : '*'
    return form.lemma
      .map((lemmaElement) => `*${lemmaElement}*${attested}`)
      .join('; ')
  }
  return (
    <>
      Other forms:{' '}
      <Markdown text={forms.map((form) => otherForm(form)).join(', ')} />
    </>
  )
}
export function Join({ list, seperator, Component }) {
  return (
    <>
      {' '}
      {list.map((element, index) => (
        <React.Fragment key={index}>
          <Component {...element} />
          {index !== list.length - 1 ? seperator : ''}
        </React.Fragment>
      ))}
    </>
  )
}
export function JoinMarkdown({ list, seperator }) {
  return (
    <>
      {' '}
      {list.map((element, index) => (
        <React.Fragment key={index}>
          <Markdown text={element} />
          {index !== list.length - 1 ? seperator : ''}
        </React.Fragment>
      ))}
    </>
  )
}

export function Logogram({
  logogram,
  notes,
}: {
  logogram: string[]
  notes: string[]
}): JSX.Element {
  return (
    <span>
      {notes[0] && <Markdown text={notes[0]}>&nbsp;</Markdown>}
      <Markdown text={logogram[0]}>&nbsp;</Markdown>
      {logogram.length > 1 && (
        <span>
          <Join
            list={logogram.slice(1)}
            seperator={', '}
            Component={Markdown}
          />
          &nbsp;
        </span>
      )}
      {notes.length > 1 && (
        <>
          &nbsp;
          <JoinMarkdown seperator={' '} list={notes.slice(1)} />
        </>
      )}
    </span>
  )
}

type MarkdownProps = {
  text: string
  paragraph?: ElementType
  children?: React.ReactNode
}
export function Markdown({
  text,
  paragraph = 'span',
  children,
}: MarkdownProps): JSX.Element {
  return (
    <ReactMarkdown
      source={replaceByCurlyQuotes(text)}
      plugins={[remarkSubSuper]}
      renderers={{
        paragraph: paragraph,
        sub: 'sub',
        sup: 'sup',
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

interface SingleDerivative {
  lemma: string[]
  homonym: string
  notes: string[]
}

export function SingleDerivative({
  lemma,
  homonym,
  notes,
}: SingleDerivative): JSX.Element {
  const Lemmas = ({
    lemmas,
    homonym,
  }: {
    lemmas: string[]
    homonym: string
  }): JSX.Element => {
    const joinedLemmas = lemmas.join(' ')
    return (
      <a href={`/dictionary/${encodeURI(`${joinedLemmas} ${homonym}`)}`}>
        <em>{joinedLemmas}</em>
      </a>
    )
  }

  return (
    <span>
      {notes[0] && <Markdown text={notes[0]}>&nbsp;</Markdown>}
      <Lemmas lemmas={lemma} homonym={homonym} />
      &nbsp;
      {homonym}
      {notes[1] && (
        <>
          &nbsp;
          <JoinMarkdown list={notes.slice(1)} seperator={' '} />
        </>
      )}
    </span>
  )
}

export function Derivatives({ derivatives }): JSX.Element {
  return (
    <>
      {derivatives.map((groupOfDerivatives, index) => (
        <React.Fragment key={index}>
          <Join
            list={groupOfDerivatives}
            seperator={', '}
            Component={SingleDerivative}
          />
          {'; '}
        </React.Fragment>
      ))}
    </>
  )
}

interface AmplifiedMeaning {
  meaning: string
  key: string
  entries: { meaning: string }[]
}
export function AmplifiedMeanings({
  amplifiedMeanings,
  wordId,
}: {
  amplifiedMeanings: AmplifiedMeaning[]
  wordId: string
}): JSX.Element {
  return (
    <>
      Attested stems:&nbsp;
      {amplifiedMeanings.map((amplifiedMeaning, index) => (
        <span key={index}>
          <HashLink to={`/dictionary/${wordId}#attested-stem-${index}`}>
            {amplifiedMeaning.key}
          </HashLink>
          {index !== amplifiedMeanings.length - 1 && <>,&nbsp;</>}
        </span>
      ))}
    </>
  )
}

export function AmplifiedMeaningsDetails({
  amplifiedMeanings,
}: {
  amplifiedMeanings: AmplifiedMeaning[]
}): JSX.Element {
  const AttestedStemDetail = ({
    amplifiedMeaning,
  }: {
    amplifiedMeaning: AmplifiedMeaning
  }): JSX.Element => (
    <Row>
      <Col>
        <Row>
          <strong>{amplifiedMeaning.key}</strong>&nbsp;&nbsp;&nbsp;{' '}
          <Markdown text={amplifiedMeaning.meaning} paragraph={'p'} />
        </Row>
        <Row>
          <ol>
            {amplifiedMeaning.entries.map((entry, index) => (
              <li id={`attested-stem-${index}`} key={index}>
                <div className="ml-3">
                  <Markdown text={entry.meaning} />
                </div>
              </li>
            ))}
          </ol>
        </Row>
      </Col>
    </Row>
  )
  return (
    <Col>
      {amplifiedMeanings.map((amplifiedMeaning, index) => (
        <AttestedStemDetail key={index} amplifiedMeaning={amplifiedMeaning} />
      ))}
    </Col>
  )
}
