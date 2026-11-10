import React from 'react'
import { Link } from 'react-router-dom'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { SignEntry } from 'sumerian-dictionary/domain/SumerianWordParts'
import {
  getSignSpellings,
  hasEblSignPage,
} from 'sumerian-dictionary/domain/sumerianWordHelpers'
import { knownWrongCharacterWarning } from 'sumerian-dictionary/ui/SumerianCuneiform'
import { SectionNote } from 'sumerian-dictionary/ui/SumerianWordParts'

const sourceLabels = [
  ['attinger', 'Attinger'],
  ['epsd2', 'ePSD2'],
] as const

function SignListBadge({ sign }: { sign: SignEntry }): JSX.Element | null {
  if (sign.signList === 'ebl') {
    return <span className="SumerianDictionary__sign-list">eBL</span>
  }
  if (sign.signList === 'ogsl') {
    return (
      <span
        className="SumerianDictionary__sign-list"
        title="eBL does not carry this reading"
      >
        OGSL
      </span>
    )
  }
  return null
}

function CharacterNote({ sign }: { sign: SignEntry }): JSX.Element | null {
  if (sign.knownWrongCharacter) {
    return (
      <span
        className="SumerianDictionary__sign-warning"
        title={knownWrongCharacterWarning}
      >
        eBL character known wrong
      </span>
    )
  }
  if (sign.characterList === 'ogsl') {
    return (
      <span className="SumerianDictionary__sign-detail">
        character from OGSL
      </span>
    )
  }
  return null
}

function SignCardBody({ sign }: { sign: SignEntry }): JSX.Element {
  return (
    <>
      <span className="SumerianDictionary__sign-glyph">{sign.utf8 || '?'}</span>
      <span className="SumerianDictionary__sign-reading SumerianDictionary__translit">
        {sign.determinative ? `{${sign.reading}}` : sign.reading}
      </span>
      <span className="SumerianDictionary__sign-name">
        {sign.unresolved ? 'not in OGSL' : sign.name}
      </span>
      <SignListBadge sign={sign} />
      {sign.formOf.length > 0 && (
        <span className="SumerianDictionary__sign-detail">
          form of {sign.formOf.join(', ')}
        </span>
      )}
      <CharacterNote sign={sign} />
      {sourceLabels.map(([source, label]) => {
        const spellings = getSignSpellings(sign, source)
        return (
          spellings && (
            <span key={source} className="SumerianDictionary__sign-source">
              <b>{label}</b>{' '}
              <span className="SumerianDictionary__translit">{spellings}</span>
            </span>
          )
        )
      })}
    </>
  )
}

function SignCard({ sign }: { sign: SignEntry }): JSX.Element {
  return hasEblSignPage(sign) ? (
    <Link
      className="SumerianDictionary__sign"
      to={`/tools/signs/${encodeURIComponent(sign.name)}`}
      title={`${sign.name} in the eBL sign list`}
    >
      <SignCardBody sign={sign} />
    </Link>
  ) : (
    <span className="SumerianDictionary__sign SumerianDictionary__sign--unlinked">
      <SignCardBody sign={sign} />
    </span>
  )
}

export default function SumerianWordSigns({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  return (
    <>
      <div className="SumerianDictionary__signs">
        {word.signs.map((sign, index) => (
          <SignCard key={index} sign={sign} />
        ))}
      </div>
      <SectionNote>
        Each sign as eBL&apos;s sign list identifies the reading — the Oracc
        Global Sign List (OGSL) only where eBL does not carry it — with the stem
        spellings — Attinger&apos;s headword, ePSD2&apos;s bases — that write
        the word with it. A consonant Attinger writes for the word&apos;s
        ending, and an unread{' '}
        <span className="SumerianDictionary__translit">x</span>, are not signs
        and are not listed.
      </SectionNote>
    </>
  )
}
