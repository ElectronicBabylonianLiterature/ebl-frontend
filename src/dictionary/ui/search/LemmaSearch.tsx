import React from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { DictionaryLineDisplay } from 'corpus/domain/chapter'
import { LineTokens } from 'transliteration/ui/line-tokens'

export default withData<
  unknown,
  { lemmaId: string; textService: TextService },
  DictionaryLineDisplay[]
>(
  ({ data }): JSX.Element => {
    return (
      <>
        {data.map((line) => (
          <>
            <LineTokens content={line.line.variants[0].reconstruction} />
            <br />
          </>
        ))}
      </>
    )
  },
  (props) => props.textService.searchLemma(props.lemmaId)
)
