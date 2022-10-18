import React from 'react'
import { DictionaryLineDisplay } from 'corpus/domain/chapter'
import _ from 'lodash'

import './LinesWithLemma.sass'
import { EmptySection } from 'dictionary/ui/display/EmptySection'
import DictionaryLineGroup from 'dictionary/ui/search/DictionaryLineGroup'

export default function LemmaLineTable({
  lines,
  lemmaId,
}: {
  lines: DictionaryLineDisplay[]
  lemmaId: string
}): JSX.Element {
  return (
    <table>
      <tbody>
        {_.isEmpty(lines) ? (
          <tr>
            <EmptySection as={'td'} />
          </tr>
        ) : (
          _(lines)
            .groupBy('stage')
            .map((lemmaLines, index) => {
              return (
                <React.Fragment key={index}>
                  <tr>
                    <th
                      scope="col"
                      colSpan={2}
                      className={'lines-with-lemma__genre'}
                    >
                      {lemmaLines[0].stage}
                    </th>
                  </tr>
                  {_(lemmaLines)
                    .groupBy((line) => [line.textId, line.chapterName])
                    .map((dictionaryLines, index) => (
                      <DictionaryLineGroup
                        lemmaId={lemmaId}
                        lines={dictionaryLines}
                        key={index}
                      />
                    ))
                    .value()}
                </React.Fragment>
              )
            })
            .value()
        )}
      </tbody>
    </table>
  )
}
