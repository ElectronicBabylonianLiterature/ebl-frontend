import React from 'react'
import { Link } from 'react-router-dom'
import Word from 'dictionary/domain/Word'
import MarkdownAndHtmlToHtml from 'common/utils/MarkdownAndHtmlToHtml'
import {
  LogogramSpelling,
  isSameAkkadian,
  splitWordId,
} from 'signs/domain/schrammLogogram'

export function LogogramText({ logogram }: { logogram: string }): JSX.Element {
  return (
    <>
      {logogram
        .split(/(<sup>.*?<\/sup>)/)
        .filter(Boolean)
        .map((part, index) => {
          const superscript = part.match(/^<sup>(.*)<\/sup>$/)
          return superscript ? (
            <sup key={index}>{superscript[1]}</sup>
          ) : (
            <React.Fragment key={index}>{part}</React.Fragment>
          )
        })}
    </>
  )
}

export function WordLink({
  wordId,
  word,
}: {
  wordId: string
  word: Word | undefined
}): JSX.Element {
  const { lemma, homonym } = splitWordId(wordId)
  return (
    <>
      <Link
        className="SignPage__logogram-lemma"
        to={`/dictionary/${encodeURIComponent(wordId)}`}
      >
        <em>
          {word?.attested === false && '*'}
          {lemma}
        </em>
        {homonym && ` ${homonym}`}
      </Link>
      {word?.guideWord && (
        <span className="SignPage__logogram-guide-word">
          , “{word.guideWord}”
        </span>
      )}
    </>
  )
}

function SchrammDetails({
  spelling,
  lemma,
}: {
  spelling: LogogramSpelling
  lemma: string
}): JSX.Element | null {
  const { schramm, schrammText } = spelling
  if (!schramm) {
    return schrammText ? (
      <MarkdownAndHtmlToHtml
        container="span"
        className="SignPage__logogram-meaning"
        markdownAndHtml={schrammText}
      />
    ) : null
  }
  const otherAkkadian = !isSameAkkadian(schramm.akkadian, lemma)
  return (
    <>
      {(otherAkkadian || schramm.uncertain) && (
        <span className="SignPage__logogram-meaning">
          {otherAkkadian && <em>{schramm.akkadian}</em>}
          {schramm.uncertain && ' (?)'}
        </span>
      )}
      {schramm.meaning && (
        <span className="SignPage__logogram-meaning">„{schramm.meaning}“</span>
      )}
      {schramm.references && (
        <span className="SignPage__logogram-references">
          {schramm.references}
        </span>
      )}
    </>
  )
}

export function Spelling({
  spelling,
  lemma,
}: {
  spelling: LogogramSpelling
  lemma: string
}): JSX.Element {
  return (
    <li className="SignPage__logogram-spelling">
      <span className="SignPage__logogram-logogram">
        <LogogramText logogram={spelling.logogram} />
      </span>
      <SchrammDetails spelling={spelling} lemma={lemma} />
    </li>
  )
}
