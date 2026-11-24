import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { WordLink } from 'sumerian-dictionary/domain/SumerianWordParts'
import { SumerianWordLink } from 'sumerian-dictionary/ui/SumerianWordParts'

function CompoundTable({ links }: { links: readonly WordLink[] }): JSX.Element {
  return (
    <table className="SumerianDictionary__forms">
      <thead>
        <tr>
          <th>Form</th>
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
        {links.map((link) => (
          <tr key={link.id}>
            <td>
              <SumerianWordLink link={link} showGuideWord={false} />
            </td>
            <td>{link.guideWord}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Compounds({ word }: { word: SumerianWord }): JSX.Element {
  return <CompoundTable links={word.compounds} />
}

export function NameCompounds({ word }: { word: SumerianWord }): JSX.Element {
  return <CompoundTable links={word.nameCompounds} />
}
