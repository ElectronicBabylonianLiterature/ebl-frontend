import React, { useState } from 'react'
import { stringify } from 'query-string'
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import HelpTrigger from 'common/ui/HelpTrigger'
import { SignQuery } from 'signs/domain/Sign'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import SignsSearchHelpPopover from 'signs/ui/search/SignsSearchHelpPopover'

interface Props {
  signQuery: Partial<SignQuery>
  sign: string | undefined
}

function parseSubscriptSubIndex(
  value: string,
): { baseValue: string; subIndex: number } | null {
  const subscriptMatch = value.match(/^([^\u2080-\u2089]*?)([\u2080-\u2089]+)$/)
  if (subscriptMatch === null) return null
  const subIndex = parseInt(
    subscriptMatch[2]
      .split('')
      .map((subscriptChar) => String(subscriptChar.charCodeAt(0) - 0x2080))
      .join(''),
    10,
  )
  return { baseValue: subscriptMatch[1], subIndex }
}

function parseValue(sign: string): { value: string; subIndex: number } {
  const match = sign.match(/^([^\d]+)(\d*)$/)
  const convertedValue = match
    ? replaceTransliteration(match[1].toLowerCase())
    : ''
  const explicitSubIndex = match && match[2] ? parseInt(match[2], 10) : null
  const subscriptResult = parseSubscriptSubIndex(convertedValue)
  if (subscriptResult !== null) {
    return {
      value: subscriptResult.baseValue,
      subIndex: explicitSubIndex ?? subscriptResult.subIndex,
    }
  }
  return {
    value: convertedValue,
    subIndex: explicitSubIndex ?? 1,
  }
}

function SignsSearchForm({ sign, signQuery }: Props): JSX.Element {
  const navigate = useNavigate()
  const [signQueryState, setSignQueryState] = useState(signQuery)
  const [signState, setSignState] = useState(sign || '')
  const [unnormalizedSignQuery, setUnnormalizedSignQuery] = useState(
    signQuery.value
      ? `${signQuery.value}${signQuery.subIndex ? signQuery.subIndex : ''}`
      : undefined,
  )

  const query = (event) => {
    event.preventDefault()
    if (unnormalizedSignQuery) {
      navigate(
        `?${stringify({
          isComposite: false,
          isIncludeHomophones: false,
          ...signQueryState,
          ...parseValue(unnormalizedSignQuery),
          sign: replaceTransliteration(signState.toLowerCase()),
          listsName: null,
          listsNumber: null,
        })}`,
      )
    }
  }
  const querySignList = (event) => {
    event.preventDefault()
    if (signQueryState.listsName && signQueryState.listsNumber) {
      navigate(
        `?${stringify({
          listsName: signQueryState.listsName,
          listsNumber: signQueryState.listsNumber,
        })}`,
      )
    }
  }
  return (
    <Form className="signs__form">
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
              readOnly
              type="radio"
              label="Include Homophones"
              checked={signQueryState.isIncludeHomophones || false}
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
              readOnly
              label="Composite Signs"
              checked={signQueryState.isComposite || false}
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
            <HelpTrigger overlay={SignsSearchHelpPopover()} />
          </Col>
          <Col className="pl-0 ml-0 mr-0 pr-0">
            <Form.Control
              as="select"
              value={signQueryState.listsName || ''}
              onChange={(event) => {
                event.persist()
                setSignQueryState((prevState) => ({
                  ...prevState,
                  listsName: event.target.value,
                }))
              }}
            >
              <option defaultValue={''} />
              <option value={'MZL'}>MesZL</option>
              <option value={'SLLHA'}>ŠL/MÉA</option>
              <option value={'OBZL'}>aBZL</option>
              <option>KWU</option>
              <option>HZL</option>
            </Form.Control>
          </Col>
          <Col className="ml-0 pl-0">
            <FormControl
              type="text"
              value={signQueryState.listsNumber || ''}
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

export default SignsSearchForm
