import { Col, Popover, Row } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import React from 'react'
import _ from 'lodash'
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
          <Col>
            <HelpTrigger
              placement={'auto'}
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
