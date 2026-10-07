import React, { ReactNode } from 'react'
import _ from 'lodash'
import { produce, castDraft } from 'immer'
import { Manuscript } from 'corpus/domain/manuscript'
import { ExtantLines } from 'corpus/domain/extant-lines'
import { Join } from 'fragmentarium/domain/join'
import Spinner from 'common/ui/Spinner'
import ExtantLinesList from 'corpus/ui/ExtantLinesList'

export function ProvenanceHeading({
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

export function excludeIndirectJoins(manuscripts: Manuscript[]): Manuscript[] {
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

export function ExtantLinesCell({
  extantLines,
  hasError,
  siglum,
}: {
  extantLines?: ExtantLines
  hasError: boolean
  siglum: string
}): JSX.Element {
  if (hasError) {
    return <>&mdash;</>
  }
  if (!extantLines) {
    return <Spinner />
  }
  return <ExtantLinesList extantLines={extantLines[siglum]} />
}
