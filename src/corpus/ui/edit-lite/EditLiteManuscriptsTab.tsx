import React, { useCallback, useMemo } from 'react'
import { BibliographySearch } from 'bibliography/application/BibliographyService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import TextService from 'corpus/application/TextService'
import { Text } from 'corpus/domain/text'
import EditLiteManuscripts from 'corpus/ui/edit-lite/EditLiteManuscripts'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ChapterId } from 'transliteration/domain/chapter-id'

interface Props {
  readonly id: ChapterId
  readonly text: Text
  readonly savedUncertainFragments: readonly string[] | null
  readonly version: number
  readonly textService: TextService
  readonly fragmentService: FragmentService
  readonly bibliographyService: BibliographySearch
}

function findUncertainFragments(
  text: Text,
  stage: string,
  name: string,
): readonly string[] {
  const chapter = text.chapters.find(
    (listing) => listing.stage === stage && listing.name === name,
  )
  return (chapter?.uncertainFragments ?? []).map(
    (fragment) => fragment.museumNumber,
  )
}

function EditLiteManuscriptsTab({
  id,
  text,
  savedUncertainFragments,
  version,
  textService,
  fragmentService,
  bibliographyService,
}: Props): JSX.Element {
  const { stage, name } = id
  const listedUncertainFragments = useMemo<readonly string[]>(
    () => findUncertainFragments(text, stage, name),
    [text, stage, name],
  )
  const searchBibliography = useCallback(
    (query: string): Promise<readonly BibliographyEntry[]> =>
      bibliographyService.search(query),
    [bibliographyService],
  )

  return (
    <EditLiteManuscripts
      id={id}
      uncertainFragments={savedUncertainFragments ?? listedUncertainFragments}
      version={version}
      textService={textService}
      fragmentService={fragmentService}
      searchBibliography={searchBibliography}
    />
  )
}

export default React.memo(EditLiteManuscriptsTab)
