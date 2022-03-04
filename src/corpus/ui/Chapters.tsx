import React, { ReactNode, useState } from 'react'
import _ from 'lodash'
import { createChapterId, Text, UncertainFragment } from 'corpus/domain/text'
import withData from 'http/withData'
import { compareManuscripts, Manuscript } from 'corpus/domain/manuscript'
import Citation from 'bibliography/ui/Citation'
import CollapsibleSection from 'corpus/ui/CollapsibleSection'
import { ReferencesHelp } from 'bibliography/ui/ReferencesHelp'
import usePromiseEffect from 'common/usePromiseEffect'
import { ExtantLines } from 'corpus/domain/extant-lines'
import Spinner from 'common/Spinner'
import ExtantLinesList from './ExtantLinesList'
import HelpTrigger from 'common/HelpTrigger'
import { Popover } from 'react-bootstrap'
import FragmentariumLink from './FragmentariumLink'
import { ChapterTitleLink } from './chapter-title'
import { groupReferences } from 'bibliography/domain/Reference'

import './Chapters.sass'
import { ChapterId } from 'corpus/domain/chapter'

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
        colSpan={3}
        scope="colgroup"
        className="list-of-manuscripts__provenance-heading"
      >
        {children}
      </th>
    </tr>
  )
}

function ManuscriptJoins({
  manuscript,
}: {
  manuscript: Manuscript
}): JSX.Element {
  return _.isEmpty(manuscript.joins) ? (
    <FragmentariumLink item={manuscript} />
  ) : (
    <>
      {manuscript.joins.map((group, groupIndex) =>
        group.map((join, index) => (
          <React.Fragment key={index}>
            {index > 0 ? (
              <> +{!join.isChecked && <sup>?</sup>} </>
            ) : (
              groupIndex > 0 && <> (+{!join.isChecked && <sup>?</sup>}) </>
            )}
            <FragmentariumLink item={join} />
          </React.Fragment>
        ))
      )}
    </>
  )
}

function ManuscriptReferences({
  manuscript,
}: {
  manuscript: Manuscript
}): JSX.Element {
  return (
    <ul className="list-of-manuscripts__references">
      {groupReferences(manuscript.references)
        .flatMap(([type, group]) => group)
        .map((reference, index) => (
          <li key={index}>
            <Citation reference={reference} />
          </li>
        ))}
    </ul>
  )
}

const Manuscripts = withData<
  {
    uncertainFragments: readonly UncertainFragment[]
    textService
    id: ChapterId
  },
  unknown,
  Manuscript[]
>(
  ({ data: manuscripts, id, uncertainFragments, textService }) => {
    const [setExtantLinesPromise] = usePromiseEffect<ExtantLines>()
    const [extantLines, setExtantLines] = useState<ExtantLines>()
    if (_.isNil(extantLines)) {
      setExtantLinesPromise(
        textService.findExtantLines(id).then(setExtantLines)
      )
    }

    const siglumId = _.uniqueId('siglum-')
    const museumNumberId = _.uniqueId('museumNumber-')
    const uncertainFragmentsId = _.uniqueId('uncertainFragmets-')
    const extantLinesId = _.uniqueId('extantLines-')
    return (
      <table>
        <colgroup span={3}></colgroup>
        <thead>
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
              <ReferencesHelp className="list-of-manuscripts__help" />
            </th>
            <th
              id={extantLinesId}
              scope="col"
              className="list-of-manuscripts__column-heading"
            >
              Extant Lines
              <span className="list-of-manuscripts__help">
                <HelpTrigger
                  overlay={
                    <Popover id={_.uniqueId('ExtantLinesHelp-')}>
                      <Popover.Content>
                        Bold figures indicate lines at the beginning or end of
                        columns or sides.
                      </Popover.Content>
                    </Popover>
                  }
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
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
                          <ManuscriptJoins manuscript={manuscript} />
                          <ManuscriptReferences manuscript={manuscript} />
                        </td>
                        <td
                          headers={[extantLinesId, rowId, museumNumberId].join(
                            ' '
                          )}
                          className="list-of-manuscripts__extant-lines"
                        >
                          {extantLines ? (
                            <ExtantLinesList
                              extantLines={extantLines[manuscript.siglum]}
                            />
                          ) : (
                            <Spinner />
                          )}
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
        </tbody>
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
            <ChapterTitleLink text={text} chapter={chapter} />
          </h4>
          <CollapsibleSection
            classNameBlock="text-view"
            element="h5"
            heading="List of Manuscripts"
          >
            <Manuscripts
              id={createChapterId(text, chapter)}
              textService={textService}
              uncertainFragments={chapter.uncertainFragments}
            />
          </CollapsibleSection>
        </section>
      ))}
    </>
  )
}
