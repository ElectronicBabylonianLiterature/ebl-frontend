import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { aliasRelationLabels } from 'sumerian-dictionary/domain/sumerianDictionaryLabels'
import {
  formatCount,
  sortEpsd2FormsByCount,
} from 'sumerian-dictionary/domain/sumerianWordHelpers'
import SumerianCuneiform from 'sumerian-dictionary/ui/SumerianCuneiform'
import { CitationFormText } from 'sumerian-dictionary/ui/SumerianCitationForm'
import {
  SectionNote,
  ShowAllToggle,
  useShowAll,
} from 'sumerian-dictionary/ui/SumerianWordParts'

const aliasesShown = 24
const epsd2FormsShown = 10

export function RedirectedForms({ word }: { word: SumerianWord }): JSX.Element {
  const { shown, hiddenCount, expanded, toggle } = useShowAll(
    word.aliases,
    aliasesShown,
  )
  return (
    <>
      <ul className="SumerianDictionary__links">
        {shown.map((alias, index) => (
          <li key={index} className="SumerianDictionary__pill">
            <span className="SumerianDictionary__translit">{alias.form}</span>
            {alias.uncertain && <small>(?)</small>}
            <span className="SumerianDictionary__relation">
              {aliasRelationLabels[alias.relation]}{' '}
              <CitationFormText citationForm={word.citationForm} />
            </span>
            {alias.meanings.length > 0 && (
              <small>«{alias.meanings.join('», «')}»</small>
            )}
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <ShowAllToggle
          expanded={expanded}
          total={word.aliases.length}
          noun="forms"
          collapsedLabel={`Show the first ${aliasesShown} only`}
          onToggle={toggle}
        />
      )}
      <SectionNote>
        Lines Attinger prints on their own to send a form to this entry.
      </SectionNote>
    </>
  )
}

export function AttestedSpellings({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  const forms = sortEpsd2FormsByCount(word.epsd2Forms)
  const largestShare = Math.max(...forms.map((form) => form.percent), 1)
  const { shown, hiddenCount, expanded, toggle } = useShowAll(
    forms,
    epsd2FormsShown,
  )
  return (
    <>
      <table className="SumerianDictionary__forms">
        <thead>
          <tr>
            <th>Cuneiform</th>
            <th>Spelling</th>
            <th>Instances</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((form) => (
            <tr key={form.spelling}>
              <td>
                <SumerianCuneiform
                  renderings={word.renderings}
                  source="epsd2"
                  spelling={form.spelling}
                />
              </td>
              <td className="SumerianDictionary__translit">{form.spelling}</td>
              <td className="SumerianDictionary__count">
                {formatCount(form.count)}
              </td>
              <td className="SumerianDictionary__share">
                <div
                  className="SumerianDictionary__bar"
                  title={`${form.percent} %`}
                  role="meter"
                  aria-label="Share"
                  aria-valuenow={form.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    style={{ width: `${(form.percent / largestShare) * 100}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hiddenCount > 0 && (
        <ShowAllToggle
          expanded={expanded}
          total={forms.length}
          noun="spellings"
          collapsedLabel={`Show the ${epsd2FormsShown} most frequent only`}
          onToggle={toggle}
        />
      )}
    </>
  )
}
