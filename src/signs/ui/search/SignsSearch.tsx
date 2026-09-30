import React from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import Sign, { OrderedSign, SignQuery } from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import { Link } from 'react-router-dom'
import InlineMarkdown from 'common/ui/InlineMarkdown'
import 'dictionary/ui/search/WordSearch.css'
import 'dictionary/ui/search/Word.css'
import { compareCleanedAkkadianString } from 'dictionary/domain/compareAkkadianStrings'
import 'signs/ui/search/Signs.sass'
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

type ColumnPosition = 'before' | 'center' | 'after'

type SignRowContext = {
  direction: string
  language: string
  isFirstSubArray: boolean
}

function SimilarText({
  position,
  context,
}: {
  position: ColumnPosition
  context: SignRowContext
}): JSX.Element | null {
  if (position !== 'before') {
    return null
  }
  return (
    <td className="similar_text">
      {context.isFirstSubArray &&
        `Similar ${context.direction} (${context.language}): `}
    </td>
  )
}

function SignColumn({
  signs,
  position,
  context,
}: {
  signs: readonly OrderedSign[]
  position: ColumnPosition
  context: SignRowContext
}): JSX.Element {
  const isCenter = position === 'center'
  return (
    <>
      <SimilarText position={position} context={context} />
      <td className={position}>
        {signs.map((item, index) => (
          <span
            key={index}
            className={
              isCenter
                ? context.language
                : `${context.language} secondary ${context.direction}`
            }
          >
            {isCenter ? (
              displayUnicode(item.unicode)
            ) : (
              <a href={`/tools/signs?listsName=MZL&listsNumber=${item.mzl}`}>
                {displayUnicode(item.unicode)}
              </a>
            )}
          </span>
        ))}
      </td>
    </>
  )
}

function SignRow({
  signs,
  signIndex,
  context,
}: {
  signs: readonly OrderedSign[]
  signIndex: number
  context: SignRowContext
}): JSX.Element {
  return (
    <>
      <SignColumn
        signs={signs.slice(0, signIndex)}
        position="before"
        context={context}
      />
      <SignColumn
        signs={signs.slice(signIndex, signIndex + 1)}
        position="center"
        context={context}
      />
      <SignColumn
        signs={signs.slice(signIndex + 1)}
        position="after"
        context={context}
      />
    </>
  )
}

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

    return _.isEmpty(data) ? null : (
      <table>
        <tbody>
          {data.map((subArray, index) => {
            const signIndex = subArray.findIndex(
              (item) => item.name === sign.name,
            )
            const isFirstSubArray = index === 0
            return (
              <tr key={index}>
                <SignRow
                  signs={subArray}
                  signIndex={signIndex}
                  context={{ direction, language, isFirstSubArray }}
                />
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  },
  (props, signal) =>
    props.signService.findSignsByOrder(props.sign.name, props.sortEra, signal),
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
          {parameters.map((params, idx) => (
            <SignLists
              key={idx}
              sign={sign}
              signService={signService}
              sortEra={params}
            />
          ))}
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
  (props, signal) => props.signService.search(props.signQuery, signal),
  {
    watch: (props) => [props.signQuery],
    filter: (props) => _.some(props.signQuery),
    defaultData: () => [],
  },
)
