import { Col, Row } from 'react-bootstrap'
import React from 'react'
import ExternalLink from 'common/ExternalLink'
import 'signs/ui/display/SignHeading.css'

export default function SignHeading({
  signName,
  cuneiformLetters,
}: {
  signName: string
  cuneiformLetters: string
}): JSX.Element {
  const CuneiformSign = ({
    font = '',
    description,
  }: {
    font?: string
    description: string
  }): JSX.Element => (
    <Col xs={4}>
      <Row>
        <Col xs="auto">
          <h3 className={font}>{cuneiformLetters}</h3>
        </Col>
        <Col>
          <span
            className={'text-secondary signHeading__cuneiformSign__description'}
          >
            {description}
          </span>
        </Col>
      </Row>
    </Col>
  )

  return (
    <Row>
      <Col xs={3}>
        <h2>{signName}</h2>
      </Col>
      <Col>
        <Row>
          <CuneiformSign
            font={'CuneiformFonts__heading-old-babylonian-monumental'}
            description={'Old Babylonian (Monumental)'}
          />
          <CuneiformSign
            font={'CuneiformFonts__heading-old-babylonian-literature'}
            description={'Old Babylonian (Literature)'}
          />
          <CuneiformSign
            font={'CuneiformFonts__heading-old-babylonian-cursive'}
            description={'Old Babylonian Cursive'}
          />
          <CuneiformSign
            font={'CuneiformFonts__heading-hittite'}
            description={'Hittite'}
          />
          <CuneiformSign description={'Neo-Assyrian'} />
          <CuneiformSign
            font={'CuneiformFonts__heading-neo-babylonian'}
            description={'Neo-Babylonian'}
          />
        </Row>
        <Row className="signDisplay__FontInfo justify-content-center text-center">
          Cuneiform fonts by C. Ziegeler (Old Babylonian Literature)
          <ExternalLink
            href={'http://dx.doi.org/10.17169/refubium-44983'}
            className={'text-dark'}
          >
            <i className="fas fa-external-link-square-alt px-2" />
          </ExternalLink>
          and S. Vanseveren (rest)
          <ExternalLink
            href={'https://www.hethport.uni-wuerzburg.de/cuneifont/'}
            className={'text-dark'}
          >
            <i className="fas fa-external-link-square-alt px-2" />
          </ExternalLink>
        </Row>
      </Col>
    </Row>
  )
}
