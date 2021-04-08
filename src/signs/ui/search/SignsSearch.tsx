import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignsService from 'signs/application/SignsService'

interface Props {
  data: readonly Sign[]
}

function SignsSearch({ data }: Props): JSX.Element {
  return <div>asd</div>
}

export default withData<
  unknown,
  { signQuery: SignQuery; signsService: SignsService },
  readonly Sign[]
>(SignsSearch, (props) => props.signsService.search(props.signQuery), {
  watch: (props) => [props.signQuery],
  filter: (props) => !_.isEmpty(props.signQuery),
  defaultData: [],
})
