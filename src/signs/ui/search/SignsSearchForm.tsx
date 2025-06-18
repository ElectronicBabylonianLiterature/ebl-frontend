import React, { useState } from 'react'
import { stringify } from 'query-string'
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import HelpTrigger from 'common/HelpTrigger'
import { SignQuery } from 'signs/domain/Sign'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import SignsSearchHelpPopover from 'signs/ui/search/SignsSearchHelpPopover'

interface Props extends RouteComponentProps {
  signQuery: Partial<SignQuery>
  sign: string | undefined
}
function parseValue(sign: string): { value: string; subIndex: number } {
  const match = sign.match(/^([^\d]+)(\d*)$/)
  return {
    value: match ? replaceTransliteration(match[1].toLowerCase()) : '',
    subIndex: match && match[2] ? parseInt(match[2]) : 1,
  }
}

function SignsSearchForm({ sign, signQuery, history }: Props): JSX.Element {
  const [signQueryState, setSignQueryState] = useState(signQuery)
  const [signState, setSignState] = useState(sign || '')
  const [unnormalizedSignQuery, setUnnormalizedSignQuery] = useState(
    signQuery.value
      ? `${signQuery.value}${signQuery.subIndex ? signQuery.subIndex : ''}`
      : undefined
  )

  const query = (event) => {
    event.preventDefault()
    if (unnormalizedSignQuery) {
      history.push(
        `?${stringify({
          isComposite: false,
          isIncludeHomophones: false,
          ...signQueryState,
          ...parseValue(unnormalizedSignQuery),
          sign: replaceTransliteration(signState.toLowerCase()),
          listsName: null,
          listsNumber: null,
        })}`
      )
    }
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
              <option>MesZL</option>
              <option value={'SLLHA'}>ŠL/MÉA</option>
              <option>aBZL</option>
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

export default withRouter(SignsSearchForm)
