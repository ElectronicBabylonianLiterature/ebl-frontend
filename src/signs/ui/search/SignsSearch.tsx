import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import Sign, { OrderedSign, SignQuery } from 'signs/domain/Sign'
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
  { sign: Sign; sortEra: string },
  { signService: SignService },
  OrderedSign[]
>(
  ({ data, sign, sortEra }) => {
    if (data.length === 0) {
      return null
    }
    let similarText = ''
    if (sortEra === 'neoBabylonianOnset') {
      similarText = 'Similar beginning (Neo-Babylonian): '
    } else if (sortEra === 'neoBabylonianOffset') {
      similarText = 'Similar ending (Neo-Babylonian): '
    } else if (sortEra === 'neoAssyrianOnset') {
      similarText = 'Similar beginning (Neo-Assyrian): '
    } else {
      similarText = 'Similar ending (Neo-Assyrian): '
    }
    return (
      <>
        {similarText && <td className="similar_text">{similarText}</td>}
        {data.map((item, index) => (
          <React.Fragment key={index}>
            {item.name === sign.name ? (
              <td
                className={
                  sortEra.includes('Babylonian')
                    ? 'babylonian_sign'
                    : 'assyrian_sign'
                }
              >
                {item.unicode
                  .map((unicode) => String.fromCodePoint(unicode))
                  .join('')}
              </td>
            ) : (
              <a href={`/signs?listsName=MZL&listsNumber=${item.mzl}`}>
                <td
                  className={
                    sortEra === 'neoBabylonianOnset'
                      ? 'babylonian_direct_signs'
                      : sortEra === 'neoAssyrianOnset'
                      ? 'assyrian_direct_signs'
                      : sortEra === 'neoBabylonianOffset'
                      ? 'babylonian_reverse_signs'
                      : 'assyrian_reverse_signs'
                  }
                >
                  {item.unicode
                    .map((unicode) => String.fromCodePoint(unicode))
                    .join('')}
                </td>
              </a>
            )}
          </React.Fragment>
        ))}
        <br />
      </>
    )
  },
  (props) => props.signService.findSignsByOrder(props.sign.name, props.sortEra)
)

function SignsSearch({
  signs,
  isIncludeHomophones,
  signService,
}: Props): JSX.Element {
  const parameters = [
    { sortEra: 'neoAssyrianOnset' },
    { sortEra: 'neoAssyrianOffset' },
    { sortEra: 'neoBabylonianOnset' },
    { sortEra: 'neoBabylonianOffset' },
  ]
  const signsNew = isIncludeHomophones ? signs : sortSigns(signs)
  return (
    <ul className="WordSearch-results">
      {signsNew.map((sign, index) => (
        <li key={index} className="WordSearch-results__result">
          <SignComponent sign={sign} />
          <table>
            <tbody>
              {parameters.map((params, idx) => (
                <tr key={idx}>
                  <SignLists
                    key={idx}
                    sign={sign}
                    signService={signService}
                    sortEra={params.sortEra}
                  />
                </tr>
              ))}
            </tbody>
          </table>
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
