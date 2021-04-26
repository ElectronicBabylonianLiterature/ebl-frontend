import React, { useState } from 'react'
import { stringify } from 'query-string'
import { Button, Col, Form, FormControl, Popover, Row } from 'react-bootstrap'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'
import { SignQuery } from 'signs/domain/Sign'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'

interface Props extends RouteComponentProps {
  signQuery: SignQuery
  sign: string | undefined
}

function SignsSearchForm({ sign, signQuery, history }: Props): JSX.Element {
  const [signQueryState, setSignQueryState] = useState<SignQuery>(signQuery)
  const [signState, setSignState] = useState(sign || '')
  const [unnormalizedSignQuery, setUnnormalizedSignQuery] = useState(
    `${signQuery.value}${signQuery.subIndex ? signQuery.subIndex : ''}`
  )

  const parseValue = (sign: string): { value: string; subIndex: number } => {
    const match = sign.match(/^([^\d]+)(\d*)$/)
    return {
      value: match ? replaceTransliteration(match[1]) : '',
      subIndex: match && match[2] ? parseInt(match[2]) : 1,
    }
  }

  const query = (event) => {
    event.preventDefault()
    history.push(
      `?${stringify({
        ...signQueryState,
        ...parseValue(unnormalizedSignQuery),
        sign: replaceTransliteration(signState),
      })}`
    )
  }
  const querySignList = (event) => {
    event.preventDefault()
    if (signQueryState.listsName && signQueryState.listsNumber) {
      history.push(
        `?${stringify({
          listsName: signQueryState.listsName,
          listsNumber: signQueryState.listsNumber,
        })}`
      )
    }
  }
  /*
  - MZL = R. Borger, *Mesopotamisches Zeichenlexikon* (Münster, ²2010).
- ŠL/MÉA = A. Deimel, *Šumerisches Lexikon* (Rom, 1925/1950) / R. Labat, *Manuel d’épigraphie akkadienne* (Paris, ⁶1988).
- ABZ = R. Borger, *Assyrisch-babylonische Zeichenliste* (Neukirchen-Vluyn, ⁴1988).
- OBZL = C. Mittermayer, *Altbabylonische Zeichenliste der sumerisch-literarischen Texte* (Göttingen, 2006).
- KWU = N. Schneider, *Die Keilschriftzeichen der Wirtschaftsurkunden von Ur III* (Rom, 1935).
- LAK = A. Deimel, *Liste der archaischen Keilschriftzeichen* (Leipzig, 1922).
- HZL = Ch. Rüster; E. Neu, *Hethitisches Zeichenlexikon* (Wiesbaden, 1989).
   */
  const SignsSearchHelp = (): JSX.Element => {
    const Section = ({ label, text }) => (
      <Row>
        <Col xs={2} className="pr-1">
          {label}
        </Col>
        <Col className="pl-0">{text}</Col>
      </Row>
    )
    return (
      <Popover
        id={_.uniqueId('SignsSearchHelp-')}
        title="Search transliterations"
        style={{ minWidth: '600px' }}
      >
        <Popover.Content>
          <ul>
            <li>
              <Section
                label={'MZL ='}
                text={
                  'R. Borger, *Mesopotamisches Zeichenlexikon* (Münster, ²2010).'
                }
              />
            </li>
            <li>
              <Section
                label={'ŠL/MÉA ='}
                text={
                  'A. Deimel, *Šumerisches Lexikon* (Rom, 1925/1950) / R. Labat, *Manuel d’épigraphie akkadienne* (Paris, ⁶1988).'
                }
              />
            </li>
            <li>
              <Section
                label={'ABZ ='}
                text={
                  'R. Borger, *Assyrisch-babylonische Zeichenliste* (Neukirchen-Vluyn, ⁴1988).'
                }
              />
            </li>
            <li>
              <Section
                label={'OBZL ='}
                text={
                  'C. Mittermayer, *Altbabylonische Zeichenliste der sumerisch-literarischen Texte* (Göttingen, 2006).'
                }
              />
            </li>
            <li>
              <Section
                label={'KWU ='}
                text={
                  'N. Schneider, *Die Keilschriftzeichen der Wirtschaftsurkunden von Ur III* (Rom, 1935).'
                }
              />
            </li>
            <li>
              <Section
                label={'LAK ='}
                text={
                  'A. Deimel, *Liste der archaischen Keilschriftzeichen* (Leipzig, 1922).'
                }
              />
            </li>
            <li>
              <Section
                label={'HZL ='}
                text={
                  'Ch. Rüster; E. Neu, *Hethitisches Zeichenlexikon* (Wiesbaden, 1989).'
                }
              />
            </li>
          </ul>
        </Popover.Content>
      </Popover>
    )
  }

  return (
    <Form>
      <Form.Group as={Row} controlId="query">
        <Form.Label column sm={2}>
          Query
        </Form.Label>
        <Col sm={6}>
          <FormControl
            type="text"
            value={signState}
            placeholder="Sign or Reading"
            onChange={(event) => {
              setUnnormalizedSignQuery(event.target.value || '')
              setSignState(event.target.value || '')
            }}
          />
        </Col>
        <Col sm={4}>
          <Button type="submit" variant="primary" onClick={query}>
            Query
          </Button>
        </Col>
      </Form.Group>
      <Form.Group>
        <Row>
          <Col xs={{ offset: 2, span: 3 }}>
            <Form.Check
              type="radio"
              label="Include Homophones"
              checked={signQueryState.isIncludeHomophones}
              onClick={() =>
                setSignQueryState((prevState) => ({
                  ...prevState,
                  isIncludeHomophones: !prevState.isIncludeHomophones,
                  isComposite: false,
                }))
              }
            />
          </Col>
          <Col>
            <Form.Check
              type="radio"
              label="Composite Signs"
              checked={signQueryState.isComposite}
              onClick={() =>
                setSignQueryState((prevState) => ({
                  ...prevState,
                  isComposite: !prevState.isComposite,
                  isIncludeHomophones: false,
                }))
              }
            />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group>
        <Row>
          <Col xs={2} className="ml-3">
            <HelpTrigger overlay={SignsSearchHelp()} />
          </Col>
          <Col className="pl-0 ml-0 mr-0 pr-0">
            <Form.Control
              as="select"
              value={signQueryState.listsName}
              onChange={(event) => {
                event.persist()
                setSignQueryState((prevState) => ({
                  ...prevState,
                  listsName: event.target.value,
                }))
              }}
            >
              <option selected />
              <option>MZL</option>
              <option>ŠL/MÉA = SLLHA</option>
              <option>ABZ</option>
              <option>KWU</option>
              <option>HZL</option>
            </Form.Control>
          </Col>
          <Col className="ml-0 pl-0">
            <FormControl
              type="text"
              value={signQueryState.listsNumber}
              placeholder="Number"
              onChange={(event) => {
                event.persist()
                setSignQueryState((prevState) => ({
                  ...prevState,
                  listsNumber: event.target.value,
                }))
              }}
            />
          </Col>
          <Col sm={4}>
            <Button type="submit" variant="primary" onClick={querySignList}>
              Query
            </Button>
          </Col>
        </Row>
      </Form.Group>
    </Form>
  )
}

export default withRouter(SignsSearchForm)
