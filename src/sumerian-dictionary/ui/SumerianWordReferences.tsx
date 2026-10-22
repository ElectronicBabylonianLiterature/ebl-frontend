import React from 'react'
import { Link } from 'react-router-dom'
import ExternalLink from 'common/ui/ExternalLink'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { WordLink } from 'sumerian-dictionary/domain/SumerianWordParts'
import { crossReferenceRelationLabels } from 'sumerian-dictionary/domain/sumerianDictionaryLabels'
import { getEtcslUrl } from 'sumerian-dictionary/domain/sumerianWordHelpers'
import { SumerianSubsectionDefinition } from 'sumerian-dictionary/ui/sumerianWordSections'
import {
  SectionNote,
  SumerianSubsection,
  SumerianWordLink,
  SumerianWordLinks,
} from 'sumerian-dictionary/ui/SumerianWordParts'

export function SumerianWordAkkadian({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  return (
    <>
      <ul className="SumerianDictionary__links">
        {word.akkadianEquivalents.map((equivalent) => (
          <li
            key={`${equivalent.wordId}|${equivalent.source}|${equivalent.indexNumbers}`}
          >
            <Link
              to={`/tools/dictionary/${encodeURIComponent(equivalent.wordId)}`}
            >
              <i>{equivalent.wordId}</i>
              {equivalent.indexNumbers && (
                <small>{equivalent.indexNumbers}</small>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <SectionNote>
        From Borger&apos;s <i>Bilinguen-Glossar</i>.
      </SectionNote>
    </>
  )
}

export function SumerianWordCompounds({
  word,
  parts,
}: {
  word: SumerianWord
  parts: readonly SumerianSubsectionDefinition[]
}): JSX.Element {
  const linksById: Record<string, readonly WordLink[]> = {
    'compounds-lexical': word.compounds,
    'compounds-names': word.nameCompounds,
  }
  return (
    <>
      {parts.map((part) => (
        <SumerianSubsection key={part.id} part={part} word={word}>
          <SumerianWordLinks links={linksById[part.id]} />
        </SumerianSubsection>
      ))}
    </>
  )
}

export function SumerianWordCitations({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  return (
    <ol className="SumerianDictionary__citations">
      {word.citations.map((citation, index) => (
        <li key={index}>
          <i>{citation.work}</i>
          {citation.passage && (
            <span className="SumerianDictionary__passage">
              {' '}
              {citation.passage}
            </span>
          )}
          {citation.etcsl && (
            <>
              {' · '}
              <ExternalLink href={getEtcslUrl(citation.etcsl)}>
                ETCSL {citation.etcsl}
              </ExternalLink>
            </>
          )}
        </li>
      ))}
    </ol>
  )
}

export function SumerianWordSeeAlso({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  return (
    <ul className="SumerianDictionary__cross-references">
      {word.crossReferences.map((reference, index) => {
        const resolved =
          reference.targets.length > 0 || reference.nameTargets.length > 0
        return (
          <li key={index}>
            <span className="SumerianDictionary__relation">
              {crossReferenceRelationLabels[reference.relation]}
            </span>{' '}
            {resolved ? (
              <>
                {[
                  { label: 'Words', links: reference.targets },
                  { label: 'Proper nouns', links: reference.nameTargets },
                ]
                  .filter(({ links }) => links.length > 0)
                  .map(({ label, links }) => (
                    <span
                      key={label}
                      role="group"
                      aria-label={label}
                      className="SumerianDictionary__link-group"
                    >
                      {links.map((link) => (
                        <SumerianWordLink key={link.id} link={link} />
                      ))}
                    </span>
                  ))}
                {reference.ambiguous && (
                  <small className="SumerianDictionary__relation">
                    ({reference.target})
                  </small>
                )}
              </>
            ) : (
              <span className="SumerianDictionary__translit">
                {reference.target}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
