import Sign, { SignListRecord } from 'signs/domain/Sign'
import WordService from 'dictionary/application/WordService'
import { Col, Row } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import React from 'react'
import CompositeSigns from 'signs/ui/display/CompositeSigns'
import SignService from 'signs/application/SignService'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import InlineMarkdown from 'common/InlineMarkdown'
import SignsSearchHelpPopover from 'signs/ui/search/SignsSearchHelpPopover'
import ExternalLink from 'common/ExternalLink'
import SignLogograms from 'signs/ui/display/SignLogogram/SignLogogram'

export default function SignInformation({
  sign,
  wordService,
  signService,
}: {
  sign: Sign
  wordService: WordService
  signService: SignService
}): JSX.Element {
  return (
    <Row>
      <Col>
        <Heading />
        <div className={'ml-5'}>
          <SignList signList={sign.lists} />
          {sign.LaBaSi && <Labasi LaBaSi={sign.LaBaSi} />}
          {sign.values.length > 0 && (
            <Readings readings={sign.displayValuesMarkdown} />
          )}
          {sign.logograms.length > 0 && (
            <SignLogograms
              signLogograms={sign.logograms}
              wordService={wordService}
            />
          )}
          <CompositeSigns
            signService={signService}
            query={{
              isComposite: true,
              value: replaceTransliteration(sign.name.toLowerCase()),
              subIndex: 1,
            }}
          />
        </div>
      </Col>
    </Row>
  )
}

const Heading = (): JSX.Element => (
  <Row>
    <Col>
      <h3>&#8544;. Sign Information</h3>
    </Col>
  </Row>
)

export function getDisplayName(signListName: string): string {
  const displayNameMap: Record<string, string> = {
    MZL: 'MesZL',
    OBZL: 'aBZL',
  }
  return displayNameMap[signListName] || signListName
}

const SignList = ({
  signList,
}: {
  signList: readonly SignListRecord[]
}): JSX.Element => (
  <Row>
    <Col xs="auto">
      Sign Lists:{' '}
      {_.sortBy(signList, ['name', 'number']).map((signListRecord, index) => (
        <span key={index}>
          <em>{getDisplayName(signListRecord.name)}</em>&nbsp;
          {signListRecord.number}
          {index < signList.length - 1 ? ', ' : ''}
        </span>
      ))}
    </Col>
    <HelpTrigger overlay={SignsSearchHelpPopover()} />
  </Row>
)
const Labasi = ({ LaBaSi }: { LaBaSi: string }): JSX.Element => (
  <Row>
    <Col>
      <span className="mr-3">
        <strong>La</strong>te<strong> Ba</strong>bylonian<strong> Si</strong>
        gns: {LaBaSi}
      </span>
      <ExternalLink
        className="text-dark "
        href={`https://labasi.acdh.oeaw.ac.at/tablets/sign/detail/${encodeURIComponent(
          LaBaSi
        )}`}
      >
        <i className="fas fa-external-link-square-alt fa-1x" />
      </ExternalLink>
    </Col>
  </Row>
)
const Readings = ({ readings }: { readings: string }): JSX.Element => (
  <Row>
    <Col>
      Readings: <InlineMarkdown source={readings} />
    </Col>
  </Row>
)
