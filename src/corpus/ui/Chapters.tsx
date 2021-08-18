import React from 'react'
import _ from 'lodash'
import { Text } from 'corpus/domain/text'
import { Link } from 'react-router-dom'
import Markup from 'transliteration/ui/markup'
import withData from 'http/withData'
import { ChapterId } from 'corpus/application/TextService'
import { compareManuscripts, Manuscript } from 'corpus/domain/manuscript'
import Citation from 'bibliography/ui/Citation'
import { CollapsibleSection } from './CollapsibleSection'
import { ReferencesHelp } from 'bibliography/ui/ReferencesHelp'

import './Chapters.sass'

const Manuscripts = withData<
  unknown,
  { id: ChapterId; textService },
  Manuscript[]
>(
  ({ data: manuscripts }) => {
    const siglumId = _.uniqueId('siglum-')
    const museumNumberId = _.uniqueId('musuemumber-')
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
              <>
                <tr key={provenance}>
                  <th
                    id={provenanceId}
                    colSpan={2}
                    scope="colgroup"
                    className="list-of-manuscripts__provenance-heading"
                  >
                    {provenance}
                  </th>
                </tr>
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
                        {manuscript.museumNumber}
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
              </>
            )
          })
          .value()}
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
            />
          </CollapsibleSection>
        </section>
      ))}
    </>
  )
}
