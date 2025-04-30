import React from 'react'
import _ from 'lodash'
import { LineProps } from './LineProps'
import TranslationLine, {
  Extent,
} from 'transliteration/domain/translation-line'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import TransliterationTd from './TransliterationTd'

function DisplayExtent({ extent }: { extent: Extent }): JSX.Element {
  const labels = extent.labels.join(' ')
  return (
    <>
      ({labels}
      {!_.isEmpty(labels) && ' '}
      {lineNumberToString(extent.number)})
    </>
  )
}

export default function DisplayTranslationLine({
  line,
  columns,
}: LineProps): JSX.Element {
  const translationLine = line as TranslationLine
  return (
    <>
      <TransliterationTd
        type={line.type}
        className={'Transliteration__TranslationLine--extent'}
      >
        {translationLine.language}
        {translationLine.extent && (
          <>
            {' '}
            <DisplayExtent extent={translationLine.extent} />
          </>
        )}
        :
      </TransliterationTd>
      <TransliterationTd colSpan={columns} type={line.type}>
        <Markup parts={translationLine.parts} />
      </TransliterationTd>
    </>
  )
}
