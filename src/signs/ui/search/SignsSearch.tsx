import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignsService from 'signs/application/SignsService'
import { Link } from 'react-router-dom'
import InlineMarkdown from 'common/InlineMarkdown'
import 'dictionary/ui/search/WordSearch.css'
import 'dictionary/ui/search/Word.css'
import { OverlayTrigger, Popover } from 'react-bootstrap'

interface Props {
  signs: readonly Sign[]
  isIncludeHomophones: boolean
}

function SignsSearch({ signs, isIncludeHomophones }: Props): JSX.Element {
  return (
    <ul className="WordSearch-results">
      {signs.map((sign) => (
        <li key={sign.name} className="WordSearch-results__result">
          <SignComponent
            sign={sign}
            isIncludeHomophones={isIncludeHomophones}
          />
        </li>
      ))}
    </ul>
  )
}

function SignComponent({
  sign,
  isIncludeHomophones,
}: {
  sign: Sign
  isIncludeHomophones: boolean
}): JSX.Element {
  const popover = (
    <Popover id={_.uniqueId('Citation-')} className="ReferenceList__popover">
      <Popover.Content>
        <div dangerouslySetInnerHTML={{ __html: sign.mesZl! }} />
      </Popover.Content>
    </Popover>
  )
  const parseSubIndex = (subIndex) => {
    if (subIndex == undefined) {
      if (isIncludeHomophones) {
        return '~x~'
      } else {
        return ''
      }
    } else {
      return `~${subIndex}~`
    }
  }
  return (
    <div className="Word">
      <Link
        to={`/signs/${sign.name}/edit`}
        className="BibliographySearch__edit"
      >
        {sign.unicode.length > 0
          ? String.fromCodePoint(sign.unicode[0])
          : sign.unicode[0]}
      </Link>
      <dfn title={sign.name}>
        <strong>
          {' '}
          <Link to={`/dictionary/${sign.name}`}>{sign.name}</Link>
        </strong>
      </dfn>
      &nbsp;
      {sign.values && sign.values.length > 0 ? (
        <InlineMarkdown
          source={`(${sign.values
            .map((value) => `${value.value}${parseSubIndex(value.subIndex)}`)
            .join(', ')})`}
        />
      ) : null}
      {sign.mesZl && (
        <>
          &nbsp;&mdash;&nbsp;
          <OverlayTrigger
            rootClose
            overlay={popover}
            trigger={['hover']}
            placement="right"
          >
            <span className="ReferenceList__citation">MesZl</span>
          </OverlayTrigger>
        </>
      )}
    </div>
  )
}

export default withData<
  any,
  { signQuery: SignQuery; signsService: SignsService },
  readonly Sign[]
>(
  ({ data, signQuery }) => (
    <SignsSearch
      isIncludeHomophones={signQuery.isIncludeHomophones}
      signs={data}
    />
  ),
  (props) => props.signsService.search(props.signQuery),
  {
    watch: (props) => [props.signQuery],
    filter: (props) => _.some(props.signQuery, _.isEmpty),
    defaultData: [],
  }
)
