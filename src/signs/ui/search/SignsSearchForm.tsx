import React, { useState } from 'react'
import { stringify } from 'query-string'
import { Button, Col, Form, FormControl, Popover, Row } from 'react-bootstrap'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import _ from 'lodash'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import HelpTrigger from 'common/HelpTrigger'

type Props = {
  query: string[] | string | null | undefined
  isIncludeHomophones: boolean
  isCompositeSigns: boolean
  fragmentSearchService: FragmentSearchService
  history
  location
  match
} & RouteComponentProps

function SignsSearchForm({
  query,
  isIncludeHomophones,
  isCompositeSigns,
  history,
  fragmentSearchService,
}: Props): JSX.Element {
  const [queryState, setQuery] = useState(
    _.isArray(query) ? query.join(' ') : query || ''
  )
  const [isIncludeHomophonesState, setIsIncludeHomophones] = useState(
    isIncludeHomophones
  )
  const [isCompositeSignsState, setIsCompositeSigns] = useState(
    isCompositeSigns
  )

  const submit = (event) => {
    event.preventDefault()
    history.push(
      `?${stringify({
        query: queryState,
        isIncludeHomophones: isIncludeHomophonesState,
        isCompositeSigns: isCompositeSignsState,
      })}`
    )
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
    <Form onSubmit={submit}>
      <Form.Group as={Row} controlId="query">
        <Form.Label column sm={2}>
          Query
        </Form.Label>
        <Col sm={6}>
          <FormControl
            type="text"
            value={queryState}
            placeholder="Sign or Reading"
            onChange={(event) => setQuery(event.target.value)}
          />
        </Col>
        <Col sm={4}>
          <Button type="submit" variant="primary">
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
              onClick={() => setIsIncludeHomophones(!isIncludeHomophonesState)}
            />
          </Col>
          <Col>
            <Form.Check
              type="radio"
              label="Composite Signs"
              onClick={() => setIsCompositeSigns(!isCompositeSignsState)}
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
            <Form.Control as="select">
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
              value={queryState}
              placeholder="Number"
              onChange={(event) => setQuery(event.target.value)}
            />
          </Col>
          <Col sm={4}>
            <Button type="submit" variant="primary">
              Query
            </Button>
          </Col>
        </Row>
      </Form.Group>
    </Form>
  )
}

export default withRouter(SignsSearchForm)
