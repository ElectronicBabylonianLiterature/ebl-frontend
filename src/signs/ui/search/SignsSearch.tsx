import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignsService from 'signs/application/SignsService'
import { Link } from 'react-router-dom'
import InlineMarkdown from 'common/InlineMarkdown'
import 'dictionary/ui/search/WordSearch.css'
import 'dictionary/ui/search/Word.css'
import { Col, OverlayTrigger, Popover, Row } from 'react-bootstrap'
import compareAkkadianStrings from 'dictionary/domain/compareAkkadianStrings'

interface Props {
  signs: Sign[]
  isIncludeHomophones: boolean
}

function signsSorted(signs: Sign[]): Sign[] {
  return signs.sort((sign1, sign2) => {
    return compareAkkadianStrings(
      Sign.cleanAkkadianString(sign1.name),
      Sign.cleanAkkadianString(sign2.name)
    )
  })
}

function SignsSearch({ signs, isIncludeHomophones }: Props): JSX.Element {
  const signsNew = isIncludeHomophones ? signsSorted(signs) : signs

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

  return (
    <Row>
      <Col style={{ maxWidth: '190px' }}>
        <Row>
          <Col xs={4}>
            <Link to={`/signs/${encodeURIComponent(sign.name)}`}>
              <span className="cuneiformFont">
                {sign.displayCuneiformSigns}
              </span>
            </Link>
          </Col>
          <Col xs={8} className="pr-0 mr-0">
            <dfn title={sign.name}>
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
      <Col>
        {sign.values.length > 0 ? (
          <InlineMarkdown source={sign.displayValues} />
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
      </Col>
    </Row>
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
    filter: (props) => _.some(props.signQuery),
    defaultData: [],
  }
)
