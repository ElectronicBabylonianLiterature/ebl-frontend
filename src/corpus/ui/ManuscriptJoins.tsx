import React from 'react'
import _ from 'lodash'
import { Joins } from 'fragmentarium/domain/join'
import FragmentariumLink from './FragmentariumLink'

export default function ManuscriptJoins({
  manuscript,
}: {
  manuscript: {
    joins: Joins
    museumNumber: string
    isInFragmentarium: boolean
    accession?: string
  }
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
        )),
      )}
    </>
  )
}
