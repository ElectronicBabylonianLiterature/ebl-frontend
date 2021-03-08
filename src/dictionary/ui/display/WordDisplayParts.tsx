import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { HashLink } from 'react-router-hash-link'
import './wordInformationDisplay.css'
import ReactMarkdown from 'react-markdown'

export function replaceByCurlyQuotes(str: string): string {
  return str.replace(/"([^"]*)"/g, '“$1”')
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
      <ReactMarkdown renderers={{ paragraph: 'span' }}>
        {forms.map((form) => otherForm(form)).join(', ')}
      </ReactMarkdown>
    </>
  )
}
interface Derivative {
  lemma: string[]
  homonym: string
  notes: string[]
}

function extractLemmas(derivatives): string[][] {
  return derivatives.map((derivative) =>
    derivative.map((derivativeParts) => {
      const homonym = derivativeParts.homonym
        ? ` ${derivativeParts.homonym}`
        : ''
      const filteredNotes = derivativeParts.notes.filter((note) => note)
      const notes = filteredNotes.length ? `${filteredNotes.join(',')}` : ''

      return `${derivativeParts.lemma[0]}${homonym}${notes}`
    })
  )
}

export function Derivatives({
  derivatives,
}: {
  derivatives: Derivative[][]
}): JSX.Element {
  const extractedLemmas = extractLemmas(derivatives)

  const extractedLemmasWithLink = extractedLemmas.map((lemmas, lemmasIndex) => (
    <span key={lemmasIndex}>
      {lemmas.map((lemma, lemmaIndex) => (
        <span key={lemmaIndex}>
          <a href={`/dictionary/${lemma}`}>
            <em>{lemma.split(' ')[0]}</em>
          </a>
          &nbsp;{lemma.split(' ')[1]}
          {lemmaIndex !== lemmas.length - 1 && <>,&nbsp;</>}
        </span>
      ))}
      {lemmasIndex !== extractedLemmas.length - 1 && <>;&nbsp;</>}
    </span>
  ))
  return <>Derivatives:&nbsp;{extractedLemmasWithLink}</>
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
          <ReactMarkdown>
            {replaceByCurlyQuotes(amplifiedMeaning.meaning)}
          </ReactMarkdown>
        </Row>
        <Row>
          <ol>
            {amplifiedMeaning.entries.map((entry, index) => (
              <li id={`attested-stem-${index}`} key={index}>
                <div className="ml-3">
                  <ReactMarkdown
                    source={replaceByCurlyQuotes(entry.meaning)}
                    renderers={{ paragraph: 'span' }}
                  />
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
