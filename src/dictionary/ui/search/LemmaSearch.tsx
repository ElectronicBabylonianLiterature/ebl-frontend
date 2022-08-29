import React from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { TextId } from 'transliteration/domain/text-id'

export default withData<
  unknown,
  { lemmaId: string; textService: TextService },
  TextId[]
>(
  ({ data }): JSX.Element => {
    // DEBUG OUTPUT
    return <>Found lemma in {data.length} chapters</>
  },
  (props) => props.textService.searchLemma(props.lemmaId)
)
