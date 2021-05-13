import React, { ElementType, FunctionComponent } from 'react'
import { Col, Row } from 'react-bootstrap'
import { HashLink } from 'react-router-hash-link'
import './wordInformationDisplay.css'
import ReactMarkdown from 'react-markdown'
import * as remarkSubSuper from 'remark-sub-super'

export function replaceByCurlyQuotes(str: string): string {
  return str.replace(/"([^"]*)"/g, '“$1”')
}
interface Form {
  attested: boolean
  lemma: string[]
  notes: string[]
}
export function OtherForm({ attested, lemma, notes }: Form): JSX.Element {
  const attestedSign = attested ? '' : '*'
  return (
    <span>
      {notes[0] && <Markdown text={`${notes[0]} `} />}
      <Markdown
        text={lemma
          .map((lemmaElement) => `*${lemmaElement}*${attestedSign}`)
          .join('; ')}
      />
      &nbsp;
      {notes.length > 1 && (
        <>
          &nbsp;
          <JoinMarkdown separator={' '} listOfMarkdown={notes.slice(1)} />
        </>
      )}
    </span>
  )
}

interface JoinProps<T> {
  list: T[]
  separator: string
  Component: FunctionComponent<T>
}
export function Join<T>({
  list,
  separator,
  Component,
}: JoinProps<T>): JSX.Element {
  return (
    <>
      {' '}
      {list.map((props, index) => (
        <React.Fragment key={index}>
          <Component {...props} />
          {index !== list.length - 1 ? separator : ''}
        </React.Fragment>
      ))}
    </>
  )
}
interface JoinMarkdownProps {
  listOfMarkdown: string[]
  separator: string
}
export function JoinMarkdown({
  listOfMarkdown,
  separator,
}: JoinMarkdownProps): JSX.Element {
  return (
    <>
      {' '}
      {listOfMarkdown.map((text, index) => (
        <React.Fragment key={index}>
          <Markdown text={text} />
          {index !== listOfMarkdown.length - 1 ? separator : ''}
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
      {notes[0] && <Markdown text={`${notes[0]} `} />}
      {logogram[0] && <Markdown text={logogram[0]} />}&nbsp;
      {logogram.length > 1 && (
        <span>
          <JoinMarkdown listOfMarkdown={logogram.slice(1)} separator={', '} />
          &nbsp;
        </span>
      )}
      {notes.length > 1 && (
        <>
          &nbsp;
          <JoinMarkdown separator={' '} listOfMarkdown={notes.slice(1)} />
        </>
      )}
    </span>
  )
}

type MarkdownProps = {
  text: string
  paragraph?: ElementType
  skipHtml?: boolean
  className?: string
}
export function Markdown({
  text,
  paragraph = 'span',
  skipHtml = false,
  className = '',
}: MarkdownProps): JSX.Element {
  return (
    <ReactMarkdown
      className={className}
      source={replaceByCurlyQuotes(text)}
      plugins={[remarkSubSuper]}
      skipHtml={skipHtml}
      renderers={{
        paragraph: paragraph,
        sub: 'sub',
        sup: 'sup',
      }}
    />
  )
}

interface SingleDerivativeProps {
  lemma: string[]
  homonym: string
  notes: string[]
}

export function SingleDerivative({
  lemma,
  homonym,
  notes,
}: SingleDerivativeProps): JSX.Element {
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
      {notes[0] && <Markdown text={`${notes[0]} `} />}
      <Lemmas lemmas={lemma} homonym={homonym} />
      &nbsp;
      {homonym}
      {notes[1] && (
        <>
          &nbsp;
          <JoinMarkdown listOfMarkdown={notes.slice(1)} separator={' '} />
        </>
      )}
    </span>
  )
}

export function Derivatives({
  derivatives,
}: {
  derivatives: any[][]
}): JSX.Element {
  return (
    <>
      {derivatives.map((groupOfDerivatives, index) => (
        <React.Fragment key={index}>
          <Join
            list={groupOfDerivatives}
            separator={', '}
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
