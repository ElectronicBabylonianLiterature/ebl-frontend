import React from 'react'
import {
  getSpellingCuneiform,
  SpellingCuneiform,
} from 'sumerian-dictionary/domain/sumerianRendering'
import {
  Rendering,
  SumerianSource,
} from 'sumerian-dictionary/domain/SumerianWordParts'

export const knownWrongCharacterWarning =
  'eBL stores this character; it is known to be wrong'

function CuneiformContent({
  cuneiform,
}: {
  cuneiform: SpellingCuneiform
}): JSX.Element {
  return cuneiform.complete ? (
    <>{cuneiform.complete}</>
  ) : (
    <>
      {cuneiform.partial.map((piece, index) =>
        piece.kind === 'sign' ? (
          <React.Fragment key={index}>{piece.value}</React.Fragment>
        ) : (
          <span
            key={index}
            className="SumerianDictionary__cuneiform-missing"
            title="Not a sign: written in Latin"
          >
            {piece.value}
          </span>
        ),
      )}
    </>
  )
}

export default function SumerianCuneiform({
  renderings,
  source,
  spelling,
}: {
  renderings: readonly Rendering[]
  source: SumerianSource
  spelling: string
}): JSX.Element | null {
  const cuneiform = getSpellingCuneiform(renderings, source, spelling)
  if (!cuneiform.complete && cuneiform.partial.length === 0) {
    return null
  }
  return (
    <span className="SumerianDictionary__cuneiform">
      <CuneiformContent cuneiform={cuneiform} />
      {cuneiform.knownWrongCharacters.length > 0 && (
        <i
          className="fas fa-exclamation-triangle SumerianDictionary__warning-icon"
          title={`${knownWrongCharacterWarning}: ${cuneiform.knownWrongCharacters.join(
            ' ',
          )}`}
          aria-label={knownWrongCharacterWarning}
          role="img"
        />
      )}
    </span>
  )
}
