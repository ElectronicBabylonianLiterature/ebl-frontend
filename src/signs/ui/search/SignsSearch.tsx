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
import compareAkkadianStrings from 'dictionary/domain/compareAkkadianStrings'
import produce from 'immer'

interface Props {
  signs: Sign[]
  isIncludeHomophones: boolean
}
function signsSortedValues(signs: Sign[]): Sign[] {
  return produce(signs, (draftSigns) => {
    draftSigns.forEach((draftSign) => {
      draftSign.values = draftSign.values.sort((value1, value2) =>
        compareAkkadianStrings(value1.value, value2.value)
      )
    })
  })
}
function signsSortedByName(signs: Sign[]): Sign[] {
  return signs.sort((sign1, sign2) =>
    compareAkkadianStrings(sign1.name, sign2.name)
  )
}

function SignsSearch({ signs, isIncludeHomophones }: Props): JSX.Element {
  const signsValuesSorted = signsSortedValues(signs)
  const signsNew = isIncludeHomophones
    ? signsSortedByName(signsValuesSorted)
    : signsValuesSorted

  return (
    <ul className="WordSearch-results">
      {signsNew.map((sign) => (
        <li key={sign.name} className="WordSearch-results__result">
          <SignComponent sign={sign} />
        </li>
      ))}
    </ul>
  )
}

function SignComponent({ sign }: { sign: Sign }): JSX.Element {
  const popover = (
    <Popover id={_.uniqueId('Citation-')} className="ReferenceList__popover">
      <Popover.Content>
        <div dangerouslySetInnerHTML={{ __html: sign.mesZl! }} />
      </Popover.Content>
    </Popover>
  )
  const parseSubIndex = (subIndex) => {
    if (subIndex == undefined) {
      return '~x~'
    } else {
      return `~${subIndex}~`
    }
  }
  return (
    <div className="Word">
      <Link
        to={`/signs/${encodeURIComponent(sign.name)}/edit`}
        className="BibliographySearch__edit"
      >
        {sign.unicode.length > 0
          ? String.fromCodePoint(sign.unicode[0])
          : sign.unicode[0]}
      </Link>
      <dfn title={sign.name}>
        <strong>
          {' '}
          <Link to={`/signs/${encodeURIComponent(sign.name)}`}>
            {sign.name}
          </Link>
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
