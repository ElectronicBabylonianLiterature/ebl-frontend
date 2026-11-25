import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { crossReferenceRelationLabels } from 'sumerian-dictionary/domain/sumerianDictionaryLabels'
import { SumerianWordLink } from 'sumerian-dictionary/ui/SumerianWordParts'

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
