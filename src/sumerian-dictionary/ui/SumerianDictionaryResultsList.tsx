import React from 'react'
import { Link } from 'react-router-dom'
import { SumerianWordSummary } from 'sumerian-dictionary/domain/SumerianWordSummary'
import { getPartOfSpeechLabel } from 'sumerian-dictionary/domain/sumerianDictionaryLabels'
import { formatCount } from 'sumerian-dictionary/domain/sumerianWordHelpers'
import { CitationFormText } from 'sumerian-dictionary/ui/SumerianCitationForm'
import { getSumerianWordPageUrl } from 'sumerian-dictionary/ui/sumerianDictionaryPage'

interface SourceBadge {
  readonly label: string
  readonly count: string
}

const englishSensesShown = 4

function badge(label: string, count: number | string = ''): SourceBadge {
  return {
    label,
    count: typeof count === 'number' ? formatCount(count) : count,
  }
}

export function getSourceBadges(
  summary: SumerianWordSummary,
): readonly SourceBadge[] {
  return [
    summary.hasAttinger && badge('Attinger'),
    summary.hasEpsd2 &&
      badge(
        'ePSD2',
        summary.epsd2FormCount > 0
          ? `${formatCount(summary.epsd2FormCount)} forms`
          : '',
      ),
    summary.akkadianCount > 0 && badge('Borger', summary.akkadianCount),
    summary.citationCount > 0 && badge('Citations', summary.citationCount),
    summary.compoundCount > 0 && badge('Compounds', summary.compoundCount),
    summary.crossReferenceCount > 0 &&
      badge('See also', summary.crossReferenceCount),
  ].filter((value): value is SourceBadge => value !== false)
}

function Terms({ summary }: { summary: SumerianWordSummary }): JSX.Element {
  const terms = [
    summary.frenchSenses.length > 0 && (
      <i key="french">{summary.frenchSenses.join('; ')}</i>
    ),
    summary.guideWord && `“${summary.guideWord}”`,
    summary.englishSenses.length > 0 &&
      summary.englishSenses.slice(0, englishSensesShown).join('; '),
  ].filter(Boolean)
  return (
    <>
      {terms.length > 0 && (
        <div className="SumerianDictionary__result-terms">
          {terms.map((term, index) => (
            <React.Fragment key={index}>
              {index > 0 && ' · '}
              {term}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  )
}

function ResultItem({
  summary,
}: {
  summary: SumerianWordSummary
}): JSX.Element {
  const partOfSpeech = getPartOfSpeechLabel(summary)
  return (
    <li className="SumerianDictionary__result">
      <div className="SumerianDictionary__result-header">
        <Link
          className="SumerianDictionary__result-title"
          to={getSumerianWordPageUrl(summary.id)}
        >
          <CitationFormText citationForm={summary.citationForm} />
          {summary.homonym && (
            <small className="SumerianDictionary__homonym">
              {' '}
              {summary.homonym}
            </small>
          )}
        </Link>
        {summary.cuneiform && (
          <span className="SumerianDictionary__result-cuneiform">
            {summary.cuneiform}
          </span>
        )}
        {partOfSpeech && (
          <span className="SumerianDictionary__pos">{partOfSpeech}</span>
        )}
        {summary.hasEmesal && (
          <span className="SumerianDictionary__pos SumerianDictionary__pos--muted">
            Emesal
          </span>
        )}
      </div>
      {summary.matchedAlias && (
        <div className="SumerianDictionary__result-terms">
          Attinger sends{' '}
          <span className="SumerianDictionary__translit">
            {summary.matchedAlias}
          </span>{' '}
          here
        </div>
      )}
      <Terms summary={summary} />
      <div className="SumerianDictionary__result-sources">
        {getSourceBadges(summary).map(({ label, count }) => (
          <span key={label} className="SumerianDictionary__result-source">
            {label}
            {count && (
              <span className="SumerianDictionary__result-source-count">
                ({count})
              </span>
            )}
          </span>
        ))}
      </div>
    </li>
  )
}

export default function SumerianDictionaryResultsList({
  summaries,
}: {
  summaries: readonly SumerianWordSummary[]
}): JSX.Element {
  return (
    <ul className="SumerianDictionary__results" aria-label="Lemmas">
      {summaries.map((summary) => (
        <ResultItem key={summary.id} summary={summary} />
      ))}
    </ul>
  )
}
