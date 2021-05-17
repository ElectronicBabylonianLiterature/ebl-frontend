import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignsService from 'signs/application/SignsService'
import { Link } from 'react-router-dom'
import InlineMarkdown from 'common/InlineMarkdown'
import 'dictionary/ui/search/WordSearch.css'
import 'dictionary/ui/search/Word.css'
import { Col, Row } from 'react-bootstrap'
import compareAkkadianStrings, {
  cleanAkkadianString,
} from 'dictionary/domain/compareAkkadianStrings'
import './Signs.css'
import MesZL from 'signs/ui/search/MesZL'

interface Props {
  signs: Sign[]
  isIncludeHomophones: boolean
}

function sortSigns(signs: Sign[]): Sign[] {
  return signs.sort((sign1, sign2) => {
    return compareAkkadianStrings(
      cleanAkkadianString(sign1.name),
      cleanAkkadianString(sign2.name)
    )
  })
}

function SignsSearch({ signs, isIncludeHomophones }: Props): JSX.Element {
  const signsNew = isIncludeHomophones ? sortSigns(signs) : signs
  return (
    <ul className="WordSearch-results">
      {signsNew.map((sign, index) => (
        <li key={index} className="WordSearch-results__result">
          <SignComponent sign={sign} />
        </li>
      ))}
    </ul>
  )
}

function SignComponent({ sign }: { sign: Sign }): JSX.Element {
  const mesZlNumber = _.find(sign.lists, (listElem) => listElem.name === 'MZL')
  let mesZlDash = <></>
  if (sign.mesZl && sign.displayValuesMarkdown[0]) {
    mesZlDash = <span>&nbsp;&mdash;&nbsp;</span>
  }

  return (
    <Row>
      <Col className="Results">
        <Row>
          <Col xs={4}>
            <Link to={`/signs/${encodeURIComponent(sign.name)}`}>
              {sign.displayCuneiformSigns}
            </Link>
          </Col>
          <Col xs={8} className="pr-0 mr-0">
            <dfn title={sign.name} className="SignName">
              <strong>
                {' '}
                <Link to={`/signs/${encodeURIComponent(sign.name)}`}>
                  {sign.displaySignName}
                </Link>
              </strong>
            </dfn>
          </Col>
        </Row>
      </Col>
      <Col className="Results--font Results--values">
        {sign.values.length > 0 ? (
          <InlineMarkdown source={sign.displayValuesMarkdown} />
        ) : null}
        {mesZlDash}
        {sign.mesZl && (
          <MesZL
            mesZl={sign.mesZl}
            mesZlNumber={mesZlNumber ? mesZlNumber.number : undefined}
          />
        )}
      </Col>
    </Row>
  )
}

export default withData<
  { signQuery: SignQuery },
  { signsService: SignsService },
  Sign[]
>(
  ({ data, signQuery }) => (
    <SignsSearch
      isIncludeHomophones={signQuery.isIncludeHomophones || false}
      signs={data}
    />
  ),
  (props) => props.signsService.search(props.signQuery),
  {
    watch: (props) => [props.signQuery],
    filter: (props) => _.some(props.signQuery),
    defaultData: [],
  }
)
