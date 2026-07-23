import React, { ReactNode, useEffect, useState } from 'react'
import _ from 'lodash'
import { createChapterId, Text, UncertainFragment } from 'corpus/domain/text'
import withData from 'http/withData'
import { compareManuscripts, Manuscript } from 'corpus/domain/manuscript'
import CollapsibleSection from 'corpus/ui/CollapsibleSection'
import { ReferencesHelp } from 'bibliography/ui/ReferencesHelp'
import usePromiseEffect from 'common/hooks/usePromiseEffect'
import { ExtantLines } from 'corpus/domain/extant-lines'
import Spinner from 'common/ui/Spinner'
import ExtantLinesList from './ExtantLinesList'
import HelpTrigger from 'common/ui/HelpTrigger'
import { Popover } from 'react-bootstrap'
import FragmentariumLink from './FragmentariumLink'
import { ChapterTitleLink } from './chapter-title'
import { ChapterId, chapterIdToString } from 'transliteration/domain/chapter-id'
import ErrorAlert from 'common/errors/ErrorAlert'

import './Chapters.sass'
import ManuscriptJoins from './ManuscriptJoins'
import ManuscriptReferences from './ManuscriptReferences'
import { produce, castDraft } from 'immer'
import { Join } from 'fragmentarium/domain/join'

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

function excludeIndirectJoins(manuscripts: Manuscript[]): Manuscript[] {
  type JoinGroup = readonly Join[]
  const uniqueJoinGroups: JoinGroup[] = _(manuscripts)
    .flatMap('joins')
    .map((join) => [join])
    .thru((values) => _.xorWith(...(values as [JoinGroup[]]), _.isEqual))
    .value()

  function isUniqueJoin(other: JoinGroup): boolean {
    return _.some(uniqueJoinGroups, (group) => _.isEqual(group, other))
  }

  return manuscripts.map((manuscript) =>
    produce(manuscript, (draft) => {
      function isPrimaryJoin(joins: JoinGroup): boolean {
        return _.some(
          joins.map((join) => join.museumNumber === manuscript.museumNumber),
        )
      }
      draft.joins = castDraft(
        manuscript.joins.filter(
          (joinGroup) => isPrimaryJoin(joinGroup) || isUniqueJoin(joinGroup),
        ),
      )
    }),
  )
}

function ExtantLinesCell({
  extantLines,
  error,
  siglum,
}: {
  extantLines?: ExtantLines
  error: Error | null
  siglum: string
}): JSX.Element {
  if (error) {
    return <ErrorAlert error={error} />
  }
  if (!extantLines) {
    return <Spinner />
  }
  return <ExtantLinesList extantLines={extantLines[siglum]} />
}

const Manuscripts = withData<
  {
    uncertainFragments: readonly UncertainFragment[]
    textService
    fragmentService
    id: ChapterId
  },
  unknown,
  Manuscript[]
>(
  ({
    data: manuscripts,
    id,
    uncertainFragments,
    textService,
    fragmentService,
  }) => {
    const [runExtantLines] = usePromiseEffect()
    const [extantLines, setExtantLines] = useState<ExtantLines>()
    const [extantLinesError, setExtantLinesError] = useState<Error | null>(null)
    const chapterIdKey = chapterIdToString(id)
    useEffect(() => {
      runExtantLines((signal) =>
        textService.findExtantLines(id, signal).then(
          (lines) => {
            if (!signal.aborted) {
              setExtantLines(lines)
            }
          },
          (error) => {
            if (!signal.aborted) {
              setExtantLinesError(error)
            }
          },
        ),
      )
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chapterIdKey, textService, runExtantLines])

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
                      <Popover.Body>
                        Bold figures indicate lines at the beginning or end of
                        columns, sides, or excerpts.
                      </Popover.Body>
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
                  {excludeIndirectJoins(manuscripts).map(
                    (manuscript, index) => {
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
                              ' ',
                            )}
                            className="list-of-manuscripts__museum-numbers"
                          >
                            <ManuscriptJoins manuscript={manuscript} />
                            <ManuscriptReferences
                              references={manuscript.references}
                            />
                          </td>
                          <td
                            headers={[
                              extantLinesId,
                              rowId,
                              museumNumberId,
                            ].join(' ')}
                            className="list-of-manuscripts__extant-lines"
                          >
                            <ExtantLinesCell
                              extantLines={extantLines}
                              error={extantLinesError}
                              siglum={manuscript.siglum}
                            />
                          </td>
                        </tr>
                      )
                    },
                  )}
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
                    {uncertainFragments.map((uncertainFragment, index) => (
                      <li key={index}>
                        <FragmentariumLink
                          item={{
                            ...uncertainFragment,
                            isInFragmentarium:
                              fragmentService.isInFragmentarium(
                                uncertainFragment.museumNumber,
                              ),
                          }}
                        />
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
  ({ id, textService }) => textService.findManuscripts(id),
)

export default function Chapters({
  text,
  textService,
  fragmentService,
}: {
  text: Text
  textService
  fragmentService
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
              fragmentService={fragmentService}
              uncertainFragments={chapter.uncertainFragments}
            />
          </CollapsibleSection>
        </section>
      ))}
    </>
  )
}
