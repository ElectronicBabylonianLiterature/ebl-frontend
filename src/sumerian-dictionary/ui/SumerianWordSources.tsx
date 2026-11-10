import React from 'react'
import ExternalLink from 'common/ui/ExternalLink'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { getAlignmentLabel } from 'sumerian-dictionary/domain/sumerianDictionaryLabels'
import {
  getEpsd2Url,
  getUniquePeriods,
} from 'sumerian-dictionary/domain/sumerianWordHelpers'

function SourceRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  )
}

export default function SumerianWordSources({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  const { attinger, epsd2 } = word.sources
  const periods = getUniquePeriods(word.attestation.periods)
  return (
    <dl className="SumerianDictionary__provenance">
      {attinger && (
        <SourceRow label="Attinger">
          <span className="SumerianDictionary__translit">
            {attinger.headword.display}
          </span>{' '}
          <small>({attinger.entryId})</small>
        </SourceRow>
      )}
      {epsd2 && (
        <SourceRow label="ePSD2">
          <ExternalLink href={getEpsd2Url(epsd2.oid)}>
            <span className="SumerianDictionary__translit">
              {epsd2.headword}
            </span>
          </ExternalLink>{' '}
          <small>({epsd2.oid})</small>
        </SourceRow>
      )}
      {word.match.tier && (
        <SourceRow label="Alignment">
          {getAlignmentLabel(word.match.tier)}
          {word.match.curated && ' — decided by a curating scholar'}
        </SourceRow>
      )}
      {periods.length > 0 && (
        <SourceRow label="Periods">{periods.join(', ')}</SourceRow>
      )}
      <SourceRow label="Identifier">
        <code>{word.id}</code>
      </SourceRow>
    </dl>
  )
}
