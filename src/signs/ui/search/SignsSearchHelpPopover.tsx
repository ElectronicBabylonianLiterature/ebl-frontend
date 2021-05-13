import { Col, Popover, Row } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'

export default function SignsSearchHelp(): JSX.Element {
  const Section = ({ label, text }: { label: string; text: string }) => (
    <li>
      <Row>
        <Col className="pr-1 mr-0 Help__list-name">{label}</Col>
        <Col xs="auto" className="pl-0 ml-0">
          =
        </Col>
        <Col className="pl-0">{text}</Col>
      </Row>
    </li>
  )
  const signsSearchHelpList = [
    ['MZL', 'R. Borger, *Mesopotamisches Zeichenlexikon* (Münster, ²2010).'],
    [
      'ŠL/MÉA',
      'A. Deimel, *Šumerisches Lexikon* (Rom, 1925/1950) / R. Labat, *Manuel d’épigraphie akkadienne* (Paris, ⁶1988).',
    ],
    [
      'ABZ',
      'R. Borger, *Assyrisch-babylonische Zeichenliste* (Neukirchen-Vluyn, ⁴1988).',
    ],
    [
      'OBZL',
      'C. Mittermayer, *Altbabylonische Zeichenliste der sumerisch-literarischen Texte* (Göttingen, 2006).',
    ],
    [
      'KWU',
      'N. Schneider, *Die Keilschriftzeichen der Wirtschaftsurkunden von Ur III* (Rom, 1935).',
    ],
    [
      'LAK',
      'A. Deimel, *Liste der archaischen Keilschriftzeichen* (Leipzig, 1922).',
    ],
    [
      'HZL',
      'Ch. Rüster; E. Neu, *Hethitisches Zeichenlexikon* (Wiesbaden, 1989).',
    ],
  ]
  return (
    <Popover
      id={_.uniqueId('SignsSearchHelp-')}
      title="Search transliterations"
      className="Help__popover"
    >
      <Popover.Content>
        <ul>
          {signsSearchHelpList.map((help, index) => (
            <Section key={index} label={help[0]} text={help[1]} />
          ))}
        </ul>
      </Popover.Content>
    </Popover>
  )
}
