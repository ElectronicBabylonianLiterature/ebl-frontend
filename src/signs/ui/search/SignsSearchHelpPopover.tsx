import { Col, Popover, Row } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import signSearchHelpList from './signSearchHelpList.json'

export default function SignsSearchHelp(): JSX.Element {
  const Section = ({ label, text }: { label: string; text: string }) => (
    <li>
      <Row>
        <Col className="pr-1 mr-0 Help__list-name">{label}</Col>
        <Col xs="auto" className="pl-0 ml-0">
          {' '}
          ={' '}
        </Col>
        <Col className="pl-0">{text}</Col>
      </Row>
    </li>
  )
  return (
    <Popover
      id={_.uniqueId('SignsSearchHelp-')}
      title="Search transliterations"
      className="Help__popover"
    >
      <Popover.Content>
        <ul>
          {signSearchHelpList.map((help, index) => (
            <Section key={index} label={help[0]} text={help[1]} />
          ))}
        </ul>
      </Popover.Content>
    </Popover>
  )
}
