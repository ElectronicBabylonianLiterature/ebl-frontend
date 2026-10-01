import React from 'react'

import References from 'fragmentarium/ui/fragment/References'
import Edition from 'fragmentarium/ui/edition/Edition'
import Display from 'fragmentarium/ui/display/Display'
import serializeReference from 'bibliography/application/serializeReference'

import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import FragmentService, {
  EditionFields,
} from 'fragmentarium/application/FragmentService'
import ArchaeologyEditor from 'fragmentarium/ui/fragment/ArchaeologyEditor'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Session } from 'auth/Session'
import ColophonEditor from 'fragmentarium/ui/fragment/ColophonEditor'
import { Colophon } from 'fragmentarium/domain/Colophon'
import ScopeEditor from 'fragmentarium/ui/fragment/ScopeEditor'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { InitializeLemmatizer } from 'fragmentarium/ui/fragment/lemma-annotation/InitializeLemmatizer'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  AnnotationSaveResult,
  UpdateNamedEntityAnnotations,
} from 'fragmentarium/ui/text-annotation/annotationSave'

export type TabsProps = {
  fragment: Fragment
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  wordService: WordService
  findspotService: FindspotService
  onSave: (save: () => Promise<Fragment>) => Promise<Fragment>
  disabled?: boolean
  activeLine: string
  onToggle: (isCollapsed: boolean) => void
  isColumnVisible: boolean
}

function afterSaveSettles(save: Promise<Fragment>): Promise<void> {
  return save.then(
    () => undefined,
    () => undefined,
  )
}

export function DisplayContents(props: TabsProps): JSX.Element {
  return <Display {...props} />
}

export function EditionContents(props: TabsProps): JSX.Element {
  const updateEdition = (fields: EditionFields) =>
    props.onSave(() =>
      props.fragmentService.updateEdition(props.fragment.number, fields),
    )
  return <Edition updateEdition={updateEdition} {...props} />
}

export function LemmatizationContents(props: TabsProps): JSX.Element {
  const updateLemmaAnnotation = (annotations: LineLemmaAnnotations) =>
    props.onSave(() =>
      props.fragmentService.updateLemmaAnnotation(
        props.fragment.number,
        annotations,
      ),
    )
  return (
    <InitializeLemmatizer
      text={props.fragment.text}
      museumNumber={props.fragment.number}
      wordService={props.wordService}
      fragmentService={props.fragmentService}
      updateAnnotation={updateLemmaAnnotation}
    />
  )
}

export function NamedEntityAnnotationContents(props: TabsProps): JSX.Element {
  const updateNamedEntityAnnotations: UpdateNamedEntityAnnotations = (
    annotations: AnnotationSpans,
  ) => {
    let saveResult: AnnotationSaveResult
    return props
      .onSave(() =>
        props.fragmentService
          .updateNamedEntityAnnotations(props.fragment.number, annotations)
          .then((result) => {
            saveResult = result
            return result.fragment
          }),
      )
      .then(() => saveResult)
  }
  return (
    <TextAnnotation
      fragmentService={props.fragmentService}
      number={props.fragment.number}
      updateNamedEntityAnnotations={updateNamedEntityAnnotations}
    />
  )
}

export function ReferencesContents(props: TabsProps): JSX.Element {
  const updateReferences = (references) =>
    props.onSave(() =>
      props.fragmentService.updateReferences(
        props.fragment.number,
        references.map(serializeReference),
      ),
    )
  const searchBibliography = (query) =>
    props.fragmentService.searchBibliography(query)
  return (
    <References
      references={props.fragment.references}
      searchBibliography={searchBibliography}
      updateReferences={updateReferences}
      disabled={props.disabled}
    />
  )
}

export function ArchaeologyContents(props: TabsProps): JSX.Element {
  const updateArchaeology = (archaeology: ArchaeologyDto) =>
    props.onSave(() =>
      props.fragmentService.updateArchaeology(
        props.fragment.number,
        archaeology,
      ),
    )
  return (
    <ArchaeologyEditor
      updateArchaeology={updateArchaeology}
      archaeology={props.fragment.archaeology || null}
      {...props}
    />
  )
}

export function ColophonContents(props: TabsProps): JSX.Element {
  const updateColophon = (colophon: Colophon): Promise<void> =>
    afterSaveSettles(
      props.onSave(() =>
        props.fragmentService.updateColophon(props.fragment.number, colophon),
      ),
    )

  return <ColophonEditor updateColophon={updateColophon} {...props} />
}

export function ScopeContents(props: TabsProps, session: Session): JSX.Element {
  const updateScopes = (scopes: string[]): Promise<void> =>
    afterSaveSettles(
      props.onSave(() =>
        props.fragmentService.updateScopes(props.fragment.number, scopes),
      ),
    )

  return (
    <ScopeEditor session={session} updateScopes={updateScopes} {...props} />
  )
}
