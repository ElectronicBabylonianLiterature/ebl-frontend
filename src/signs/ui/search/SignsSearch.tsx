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
function columnSizes(
  nameLengths: number[],
  unicodeLengths: number[]
): { unicodeSize: number; nameSize: number } {
  const unicodeSize = Math.max(...unicodeLengths)
    ? Math.max(...unicodeLengths)
    : 1
  const nameSize = Math.max(...nameLengths) ? Math.max(...nameLengths) : 1
  return {
    unicodeSize: Math.ceil(unicodeSize / 3),
    nameSize: Math.ceil(nameSize / 10),
  }
}
function SignsSearch({ signs, isIncludeHomophones }: Props): JSX.Element {
  const signsNew = isIncludeHomophones ? signs : sortSigns(signs)
  return (
    <ul className="WordSearch-results">
      {signsNew.map((sign, index) => (
        <li key={index} className="WordSearch-results__result">
          <SignComponent
            sign={sign}
            {...columnSizes(
              signs.map((sign) => sign.name.length),
              signs.map((sign) => sign.unicode.length)
            )}
          />
        </li>
      ))}
    </ul>
  )
}

function SignComponent({
  sign,
  unicodeSize,
  nameSize,
}: {
  sign: Sign
  unicodeSize: number
  nameSize: number
}): JSX.Element {
  const mesZlRecords = sign.lists.filter((listElem) => listElem.name === 'MZL')
  let mesZlDash = <></>
  if (sign.mesZl && sign.displayValuesMarkdown[0]) {
    mesZlDash = <span>&nbsp;&mdash;&nbsp;</span>
  }

  return (
    <Row>
      <Col xs={unicodeSize}>
        <Link to={`/signs/${encodeURIComponent(sign.name)}`}>
          <span className={'Results--cuneiform'}>
            {sign.displayCuneiformSigns}
          </span>
        </Link>
      </Col>
      <Col xs={nameSize}>
        <dfn title={sign.name} className="SignName">
          <strong>
            {' '}
            <Link to={`/signs/${encodeURIComponent(sign.name)}`}>
              <span className="Results--sign">{sign.displaySignName}</span>
            </Link>
          </strong>
        </dfn>
      </Col>
      <Col>
        {sign.values.length > 0 ? (
          <InlineMarkdown source={sign.displayValuesMarkdown} />
        ) : null}
        {mesZlDash}
        {sign.mesZl && <MesZL mesZl={sign.mesZl} mesZlRecords={mesZlRecords} />}
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
