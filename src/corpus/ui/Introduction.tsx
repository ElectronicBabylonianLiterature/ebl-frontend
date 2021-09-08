import React from 'react'
import _ from 'lodash'
import ReactMarkdown from 'react-markdown'
import { Text } from 'corpus/domain/text'
import Reference, { groupReferences } from 'bibliography/domain/Reference'
import referencePopover from 'bibliography/ui/referencePopover'
import InlineMarkdown from 'common/InlineMarkdown'
import Citation from 'bibliography/domain/Citation'

const TextCitation = referencePopover(({ reference }) => (
  <InlineMarkdown source={Citation.for(reference).getMarkdown()} />
))

function References({
  references,
}: {
  references: readonly Reference[]
}): JSX.Element {
  const separator = '; '
  return (
    <section className="text-view__references">
      <h4>References</h4>
      {groupReferences(references).map(([type, group]) => (
        <p key={type} className="text-view__reference-group">
          <b className="text-view__reference-group-title">
            {_.startCase(type.toLowerCase())}
          </b>
          :{' '}
          {group.map((reference, index) => (
            <React.Fragment key={index}>
              {index > 0 && separator}
              <TextCitation reference={reference} />
            </React.Fragment>
          ))}
          .
        </p>
      ))}
    </section>
  )
}

export default function Introduction({
  text: { intro, references },
}: {
  text: Text
}): JSX.Element {
  return (
    <section className="text-view__section">
      <h3 className="text-view__section-heading">Introduction</h3>
      <ReactMarkdown className="text-view__markdown" source={intro} />
      {!_.isEmpty(references) && <References references={references} />}
    </section>
  )
}
