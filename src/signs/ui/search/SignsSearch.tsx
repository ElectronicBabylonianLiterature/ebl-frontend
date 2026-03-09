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
    compareCleanedAkkadianString(sign1.name, sign2.name),
  )
}

export function displayUnicode(unicode: readonly number[]): string {
  return unicode.map((unicode) => String.fromCodePoint(unicode)).join('')
}

function renderSimilarText(label, isFirstSubArray, direction, language) {
  if (label === 'before' && isFirstSubArray) {
    return (
      <td className="similar_text">{`Similar ${direction} (${language}): `}</td>
    )
  } else if (label === 'before' && !isFirstSubArray) {
    return <td className="similar_text"></td>
  } else {
    return null
  }
}

const renderSignColumn = (
  data,
  startIndex,
  endIndex,
  label,
  direction,
  language,
  isFirstSubArray,
) => (
  <>
    {renderSimilarText(label, isFirstSubArray, direction, language)}
    <td className={label}>
      {data.slice(startIndex, endIndex).map((item, index) => (
        <span
          key={index}
          className={
            label === 'center' ? language : `${language} secondary ${direction}`
          }
        >
          {label === 'center' ? (
            displayUnicode(item.unicode)
          ) : (
            <a href={`/signs?listsName=MZL&listsNumber=${item.mzl}`}>
              {displayUnicode(item.unicode)}
            </a>
          )}
        </span>
      ))}
    </td>
  </>
)
const SignLists = withData<
  { sign: Sign; sortEra: string },
  { signService: SignService },
  [OrderedSign[]]
>(
  ({ data, sign, sortEra }) => {
    const direction = sortEra.includes('Onset') ? 'beginning' : 'ending'
    const language = sortEra.includes('Babylonian')
      ? 'Neo-Babylonian'
      : 'Neo-Assyrian'

    const renderColumns = (
      subArray,
      signIndex,
      direction,
      language,
      isFirstSubArray,
    ) => (
      <>
        {renderSignColumn(
          subArray,
          0,
          signIndex,
          'before',
          direction,
          language,
          isFirstSubArray,
        )}
        {renderSignColumn(
          subArray,
          signIndex,
          signIndex + 1,
          'center',
          direction,
          language,
          isFirstSubArray,
        )}
        {renderSignColumn(
          subArray,
          signIndex + 1,
          subArray.length,
          'after',
          direction,
          language,
          isFirstSubArray,
        )}
      </>
    )

    return _.isEmpty(data) ? null : (
      <>
        {data.map((subArray, index) => {
          const signIndex = subArray.findIndex(
            (item) => item.name === sign.name,
          )
          const isFirstSubArray = index === 0
          return (
            <tr key={index}>
              {renderColumns(
                subArray,
                signIndex,
                direction,
                language,
                isFirstSubArray,
              )}
            </tr>
          )
        })}
      </>
    )
  },
  (props) => props.signService.findSignsByOrder(props.sign.name, props.sortEra),
)
function SignsSearch({
  signs,
  isIncludeHomophones,
  signService,
}: Props): JSX.Element {
  const parameters = [
    'neoAssyrianOnset',
    'neoAssyrianOffset',
    'neoBabylonianOnset',
    'neoBabylonianOffset',
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
                <SignLists
                  key={idx}
                  sign={sign}
                  signService={signService}
                  sortEra={params}
                />
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
  },
)
