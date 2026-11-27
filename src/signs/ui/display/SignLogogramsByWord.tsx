import React from 'react'
import { Link } from 'react-router-dom'
import ExternalLink from 'common/ui/ExternalLink'
import { Logogram } from 'signs/domain/Sign'
import {
  LogogramSpelling,
  groupLogogramsByWord,
  isLogogramCrossReference,
  isSameAkkadian,
  splitWordId,
} from 'signs/domain/schrammLogogram'

// Logograms are stored as text with <sup> determinatives, e.g. "<sup>giš</sup>ŠE.NU".
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

function WordLink({ wordId }: { wordId: string }): JSX.Element {
  const { lemma, homonym } = splitWordId(wordId)
  return (
    <Link
      className="SignPage__logogram-lemma"
      to={`/dictionary/${encodeURIComponent(wordId)}`}
    >
      <em>{lemma}</em>
      {homonym && ` ${homonym}`}
    </Link>
  )
}

function Spelling({
  spelling,
  lemma,
}: {
  spelling: LogogramSpelling
  lemma: string
}): JSX.Element {
  const { schramm } = spelling
  return (
    <li className="SignPage__logogram-spelling">
      <span className="SignPage__logogram-logogram">
        <LogogramText logogram={spelling.logogram} />
      </span>
      {schramm && (
        <>
          {(!isSameAkkadian(schramm.akkadian, lemma) || schramm.uncertain) && (
            <span className="SignPage__logogram-meaning">
              {!isSameAkkadian(schramm.akkadian, lemma) && (
                <em>{schramm.akkadian}</em>
              )}
              {schramm.uncertain && ' (?)'}
            </span>
          )}
          {schramm.meaning && (
            <span className="SignPage__logogram-meaning">
              „{schramm.meaning}“
            </span>
          )}
          {schramm.references && (
            <span className="SignPage__logogram-references">
              {schramm.references}
            </span>
          )}
        </>
      )}
    </li>
  )
}

export default function SignLogogramsByWord({
  logograms,
}: {
  logograms: readonly Logogram[]
}): JSX.Element {
  const words = groupLogogramsByWord(logograms)
  const crossReferences = logograms.filter(isLogogramCrossReference)
  return (
    <>
      <ul className="SignPage__logograms">
        {words.map(({ wordId, otherWordIds, spellings }) => (
          <li key={wordId} className="SignPage__logogram-word">
            <WordLink wordId={wordId} />
            {otherWordIds.map((other) => (
              <React.Fragment key={other}>
                {' + '}
                <WordLink wordId={other} />
              </React.Fragment>
            ))}
            <ul className="SignPage__logogram-spellings">
              {spellings.map((spelling, index) => (
                <Spelling
                  key={index}
                  spelling={spelling}
                  lemma={splitWordId(wordId).lemma}
                />
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {crossReferences.length > 0 && (
        <p className="SignPage__note">
          Cross-references:{' '}
          {crossReferences.map((logogram, index) => (
            <React.Fragment key={index}>
              {index > 0 && ' · '}
              <LogogramText logogram={logogram.logogram} />
            </React.Fragment>
          ))}
        </p>
      )}
      <p className="SignPage__note">
        From W. Schramm,{' '}
        <em>Akkadische Logogramme. Zweite, revidierte Auflage</em>. Göttinger
        Beiträge zum Alten Orient 5. Göttingen: Universitätsverlag Göttingen,{' '}
        <sup>2</sup>2010 (
        <ExternalLink href="https://creativecommons.org/licenses/by-nd/3.0/de/">
          CC BY-ND 3.0
        </ExternalLink>
        ,{' '}
        <ExternalLink href="https://doi.org/10.17875/gup2010-511">
          doi:10.17875/gup2010-511
        </ExternalLink>
        ).
      </p>
    </>
  )
}
