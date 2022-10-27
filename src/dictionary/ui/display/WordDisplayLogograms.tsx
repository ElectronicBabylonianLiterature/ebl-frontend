import React, { Fragment } from 'react'
import Bluebird from 'bluebird'
import { Col, Row } from 'react-bootstrap'
import { Logogram } from 'dictionary/domain/Word'
import SignService from 'signs/application/SignService'
//import { Markdown } from 'common/Markdown'
import withData from 'http/withData'
import Sign from 'signs/domain/Sign'

function LogogramsDisplay({ signs }: { signs: readonly Sign[] }): JSX.Element {
  return (
    <Fragment key="akkadischeLogogramme">
      {signs.map((sign, i) => (
        <Row className="ml-5" key={`logogram_${i}`}>
          <Col>
            <a href={`/signs/${sign.name}`}>{sign.displayCuneiformSigns}</a>
            {/*<a href={`/signs/${logogram.logogram.join(' ')}`}>𒄀</a>&emsp;
            <span>{logogram.logogram.join(' ')}</span>&emsp;
            <span>{logogram.notes.join(' ')}</span>*/}
          </Col>
        </Row>
      ))}
    </Fragment>
  )
}

export default withData<
  {
    signService: SignService
  },
  { logograms: readonly Logogram[] },
  Sign[]
>(
  ({ data: signs, ...props }) => <LogogramsDisplay signs={signs} {...props} />,
  ({ signService }) =>
    Bluebird.all([signService.find(decodeURIComponent('GI'))])
)

//<Markdown text={word.cdaAddenda} />
