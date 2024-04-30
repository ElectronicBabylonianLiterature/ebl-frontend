import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import { Link } from 'react-router-dom'
import InlineMarkdown from 'common/InlineMarkdown'
import 'dictionary/ui/search/WordSearch.css'
import 'dictionary/ui/search/Word.css'
import { compareCleanedAkkadianString } from 'dictionary/domain/compareAkkadianStrings'
import './Signs.sass'
import MesZL from 'signs/ui/search/MesZL'

interface Props {
  signs: Sign[]
  isIncludeHomophones: boolean
  signService: SignService
}

function sortSigns(signs: Sign[]): Sign[] {
  return signs.sort((sign1, sign2) =>
    compareCleanedAkkadianString(sign1.name, sign2.name)
  )
}

const SignLists = withData<
  { sign: Sign; order: string },
  { signService: SignService },
  any[]
>(
  ({ data }) => {
    console.log(data)
    return (
      <>
        {data.map((item, index) => (
          <span key={index}>{item.name}</span>
        ))}
      </>
    )
  },
  (props) =>
    props.signService.findSignsByOrder(
      props.sign.name,
      props.order,
      'neoAssyrianOnset'
    )
)

function SignsSearch({
  signs,
  isIncludeHomophones,
  signService,
}: Props): JSX.Element {
  const signsNew = isIncludeHomophones ? signs : sortSigns(signs)
  return (
    <ul className="WordSearch-results">
      {signsNew.map((sign, index) => (
        <li key={index} className="WordSearch-results__result">
          <SignComponent sign={sign} />
          <SignLists
            sign={sign}
            signService={signService}
            order={'preceding'}
          />
          <SignLists
            sign={sign}
            signService={signService}
            order={'following'}
          />
        </li>
      ))}
    </ul>
  )
}

function SignComponent({ sign }: { sign: Sign }): JSX.Element {
  const mesZlRecords = sign.lists.filter((listElem) => listElem.name === 'MZL')
  const mesZlDash =
    sign.mesZl && sign.displayValuesMarkdown[0] ? (
      <span>&nbsp;&mdash;&nbsp;</span>
    ) : null

  return (
    <div className="signs__sign">
      <Link to={`/signs/${encodeURIComponent(sign.name)}`} className="mx-2">
        <span className="signs__sign__cuneiform">
          {sign.displayCuneiformSigns}
        </span>
      </Link>

      <dfn title={sign.name} className="signs__sign__name mx-2">
        <strong>
          {' '}
          <Link to={`/signs/${encodeURIComponent(sign.name)}`}>
            <span>{sign.displaySignName}</span>
          </Link>
        </strong>
      </dfn>
      {sign.values.length > 0 ? (
        <InlineMarkdown source={`(${sign.displayValuesMarkdown})`} />
      ) : null}

      {mesZlDash}
      {sign.mesZl && (
        <MesZL
          mesZl={sign.mesZl}
          mesZlRecords={mesZlRecords}
          signName={sign.name}
        />
      )}
    </div>
  )
}

export default withData<
  { signQuery: SignQuery; signService: SignService },
  unknown,
  Sign[]
>(
  ({ data, signQuery, signService }) => (
    <SignsSearch
      isIncludeHomophones={signQuery.isIncludeHomophones || false}
      signs={data}
      signService={signService}
    />
  ),
  (props) => props.signService.search(props.signQuery),
  {
    watch: (props) => [props.signQuery],
    filter: (props) => _.some(props.signQuery),
    defaultData: () => [],
  }
)
