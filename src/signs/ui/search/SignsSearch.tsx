import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignsService from 'signs/application/SignsService'
import { Link } from 'react-router-dom'
import InlineMarkdown from 'common/InlineMarkdown'

interface Props {
  data: readonly Sign[]
}

function SignsSearch({ data }: Props): JSX.Element {
  console.log(data)
  return (
    <ul className="WordSearch-results">
      {data.map((sign) => (
        <li key={sign.name} className="WordSearch-results__result">
          <SignComponent sign={sign} />
        </li>
      ))}
    </ul>
  )
}

function SignComponent({ sign }): JSX.Element {
  return (
    <div className="Word">
      <Link
        to={`/signs/${sign.name}/edit`}
        className="BibliographySearch__edit"
      >
        <i className="fas fa-edit" />
      </Link>
      <dfn title={sign.name}>
        <strong>{sign.name}</strong>
      </dfn>
      &nbsp;
      <InlineMarkdown
        source={`(${sign.values
          .map(
            (value) =>
              `${value.value}<sub>${
                value.subIndex ? value.subIndex : 'x'
              }</sub>`
          )
          .join(', ')})`}
      />
    </div>
  )
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
