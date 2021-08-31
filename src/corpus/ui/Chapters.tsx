import React, { ReactNode } from 'react'
import _ from 'lodash'
import { Text, UncertainFragment } from 'corpus/domain/text'
import { Link } from 'react-router-dom'
import Markup from 'transliteration/ui/markup'
import withData from 'http/withData'
import { ChapterId } from 'corpus/application/TextService'
import { compareManuscripts, Manuscript } from 'corpus/domain/manuscript'
import Citation from 'bibliography/ui/Citation'
import CollapsibleSection from 'corpus/ui/CollapsibleSection'
import { ReferencesHelp } from 'bibliography/ui/ReferencesHelp'

import './Chapters.sass'
import FragmentLink from 'fragmentarium/ui/FragmentLink'

function FragmentariumLink({
  item,
}: {
  item: { museumNumber: string; isInFragmentarium: boolean }
}): JSX.Element {
  return item.isInFragmentarium ? (
    <FragmentLink number={item.museumNumber}>{item.museumNumber}</FragmentLink>
  ) : (
    <>{item.museumNumber}</>
  )
}

function ProvenanceHeading({
  id,
  children,
}: {
  id: string
  children: ReactNode
}): JSX.Element {
  return (
    <tr>
      <th
        id={id}
        colSpan={2}
        scope="colgroup"
        className="list-of-manuscripts__provenance-heading"
      >
        {children}
      </th>
    </tr>
  )
}

const Manuscripts = withData<
  { uncertainFragments: readonly UncertainFragment[] },
  { id: ChapterId; textService },
  Manuscript[]
>(
  ({ data: manuscripts, uncertainFragments }) => {
    const siglumId = _.uniqueId('siglum-')
    const museumNumberId = _.uniqueId('museumNumber-')
    const uncertainFragmentsId = _.uniqueId('uncertainFragmets-')
    return (
      <table>
        <colgroup span={2}></colgroup>
        <tr className="list-of-manuscripts__header">
          <th
            id={siglumId}
            scope="col"
            className="list-of-manuscripts__column-heading"
          >
            Siglum
          </th>
          <th
            id={museumNumberId}
            scope="col"
            className="list-of-manuscripts__column-heading"
          >
            Museum Number
            <ReferencesHelp />
          </th>
        </tr>
        {_(manuscripts)
          .sort(compareManuscripts)
          .groupBy((manuscript) => manuscript.provenance.name)
          .map((manuscripts, provenance) => {
            const provenanceId = _.uniqueId('provenace-')
            return (
              <React.Fragment key={provenance}>
                <ProvenanceHeading id={provenanceId}>
                  {provenance}
                </ProvenanceHeading>
                {manuscripts.map((manuscript, index) => {
                  const rowId = _.uniqueId('row-')
                  return (
                    <tr key={`${provenance} ${index}`}>
                      <th
                        id={rowId}
                        headers={[provenanceId, siglumId].join(' ')}
                        scope="row"
                        className="list-of-manuscripts__siglum-heading"
                      >
                        {manuscript.siglum}
                      </th>
                      <td
                        headers={[provenanceId, rowId, museumNumberId].join(
                          ' '
                        )}
                      >
                        {_.isEmpty(manuscript.joins) ? (
                          <FragmentariumLink item={manuscript} />
                        ) : (
                          manuscript.joins.map((group, groupIndex) =>
                            group.map((join, index) => (
                              <React.Fragment key={index}>
                                {index > 0 ? (
                                  <> +{!join.isChecked && <sup>?</sup>} </>
                                ) : (
                                  groupIndex > 0 ?? (
                                    <> (+{!join.isChecked && <sup>?</sup>}) </>
                                  )
                                )}
                                <FragmentariumLink item={join} />
                              </React.Fragment>
                            ))
                          )
                        )}
                        <ul className="list-of-manuscripts__references">
                          {manuscript.references.map((reference, index) => (
                            <li key={index}>
                              <Citation reference={reference} />
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )
                })}
              </React.Fragment>
            )
          })
          .value()}
        {!_.isEmpty(uncertainFragments) && (
          <>
            <ProvenanceHeading id={uncertainFragmentsId}>
              Uncertain Fragments
            </ProvenanceHeading>
            <tr>
              <td></td>
              <td>
                <ul className="list-of-manuscripts__uncertain-fragments">
                  {uncertainFragments.map((fragment, index) => (
                    <li key={index}>
                      <FragmentariumLink item={fragment} />
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </>
        )}
      </table>
    )
  },
  ({ id, textService }) => textService.findManuscripts(id)
)

export default function Chapters({
  text,
  textService,
}: {
  text: Text
  textService
}): JSX.Element {
  return (
    <>
      {text.chapters.map((chapter, index) => (
        <section key={index}>
          <h4>
            <Link
              to={`/corpus/${text.genre}/${text.category}/${text.index}/${chapter.stage}/${chapter.name}`}
            >
              {chapter.name} <Markup container="span" parts={chapter.title} />
            </Link>
          </h4>
          <CollapsibleSection element="h5" heading="List of Manuscripts">
            <Manuscripts
              id={ChapterId.fromText(text, chapter)}
              textService={textService}
              uncertainFragments={chapter.uncertainFragments}
            />
          </CollapsibleSection>
        </section>
      ))}
    </>
  )
}
