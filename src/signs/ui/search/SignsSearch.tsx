import React from 'react'
import _ from 'lodash'

import Word from 'dictionary/domain/Word'
import withData from 'http/withData'

interface Props {
  data: readonly Word[]
}

function SignsSearch({ data }: Props): JSX.Element {
  console.log(data)
  return <div>asd</div>
}

export default withData<
  unknown,
  { query: string; signsService },
  readonly Word[]
>(SignsSearch, (props) => props.signsService.search(props.query), {
  watch: (props) => [props.query],
  filter: (props) => !_.isEmpty(props.query),
  defaultData: [],
})
