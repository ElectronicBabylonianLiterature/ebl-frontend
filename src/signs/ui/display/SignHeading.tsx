import { Col, Popover, Row } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import React from 'react'
import _ from 'lodash'
import ExternalLink from 'common/ExternalLink'

export default function SignHeading({
  signName,
  cuneiformLetters,
}: {
  signName: string
  cuneiformLetters: string
}): JSX.Element {
  const CuneiformFonts = ({
    font = '',
    description,
  }: {
    font?: string
    description: string
  }): JSX.Element => (
    <Col xs={4}>
      <Row>
        <Col xs={3}>
          <h3 className={font}>{cuneiformLetters}</h3>
        </Col>
        <Col>
          <span className={'text-secondary'}>{description}</span>
        </Col>
      </Row>
    </Col>
  )

  return (
    <Row>
      <Col xs={3}>
        <h3>{signName}</h3>
      </Col>
      <Col>
        <Row>
          <CuneiformFonts
            font={'CuneiformFonts__heading-old-babylonian-monumental'}
            description={'Old-Babylonian (Monumental)'}
          />
          <CuneiformFonts
            font={'CuneiformFonts__heading-old-babylonian-cursive'}
            description={'Old-Babylonian Cursive'}
          />
          <CuneiformFonts
            font={'CuneiformFonts__heading-hittite'}
            description={'Hittite'}
          />
          <CuneiformFonts description={'Neo-Assyrian'} />
          <CuneiformFonts
            font={'CuneiformFonts__heading-neo-babylonian'}
            description={'Neo-Babylonian'}
          />
          <Col>
            <HelpTrigger
              delay={{ show: 0, hide: 1200 }}
              overlay={CuneiformFontsHelpPopover()}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

function CuneiformFontsHelpPopover(): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('CuneiformFontsHelpHelp-')}
      title="Cuneiform Fonts Help"
      className={'mb-2'}
    >
      <Popover.Content>
        Cuneiform fonts by S. Vanserveren{' '}
        <ExternalLink
          href={'https://www.hethport.uni-wuerzburg.de/cuneifont/'}
          className={'text-dark'}
        >
          <i className="fas fa-external-link-square-alt" />
        </ExternalLink>
      </Popover.Content>
    </Popover>
  )
}
