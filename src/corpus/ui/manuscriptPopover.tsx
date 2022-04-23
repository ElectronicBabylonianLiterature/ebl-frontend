import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import FragmentariumLink from './FragmentariumLink'
// import Reference from 'bibliography/domain/Reference'
// import Citation from 'bibliography/ui/Citation'
// import { groupReferences } from 'bibliography/domain/Reference'

function makeOldSiglumItem(oldSiglum, index) {
  return `${oldSiglum.siglum} ${oldSiglum.reference.id}`
}

function OldSiglumList({ siglumList }): JSX.Element {
  return (
    <span>
      {_.isEmpty(siglumList)
        ? ''
        : `(${siglumList.map(makeOldSiglumItem).join(', ')})`}
    </span>
  )
}

// function ManuscriptLineReferences({
//   references,
// }: {
//   references: Reference[]
// }): JSX.Element {
//   return (
//     <ul className="list-of-manuscripts__references">
//       {groupReferences(references)
//         .flatMap(([type, group]) => group)
//         .map((reference, index) => (
//           <li key={index}>
//             <Citation reference={reference} />
//           </li>
//         ))}
//     </ul>
//   )
// }

export default function ManuscriptPopOver({ manuscript }): JSX.Element {
  // const fullManuscript = manuscript.manuscript
  const popover = (
    <Popover
      id={_.uniqueId('ManuscriptPopOver-')}
      className="manuscript-popover__popover"
    >
      <Popover.Title as="h3">
        {manuscript.siglum}&nbsp;
        <OldSiglumList siglumList={manuscript.oldSigla} />
      </Popover.Title>
      <Popover.Content>
        <FragmentariumLink item={manuscript} />
        <p>
          {manuscript.provenance.parent} &gt; {manuscript.provenance.name};{' '}
          {manuscript.type.name}
          <br />
          {manuscript.period.name} {manuscript.period.description}
        </p>
        <p>
          {/* {fullManuscript.references.map((reference, index) => {
            return reference.type
          })} */}
        </p>
        {/* <ManuscriptLineReferences references={manuscript.references} /> */}
      </Popover.Content>
    </Popover>
  )
  return (
    <OverlayTrigger
      rootClose
      overlay={popover}
      trigger={['click']}
      placement="top"
    >
      <span className="reference-popover__citation">
        <div className="test">{manuscript.siglum}</div>
      </span>
    </OverlayTrigger>
  )
}
