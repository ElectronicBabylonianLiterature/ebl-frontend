import Bluebird from 'bluebird'
import FragmentService, {
  EditionFields,
} from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  ArchaeologyContents,
  ColophonContents,
  DisplayContents,
  EditionContents,
  LemmatizationContents,
  ReferencesContents,
  ScopeContents,
  TabsProps,
} from 'fragmentarium/ui/fragment/editorTabContents'
import { Session } from 'auth/Session'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { colophonFactory } from 'test-support/colophon-fixtures'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { LineLemmaAnnotations } from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import serializeReference from 'bibliography/application/serializeReference'

jest.mock('fragmentarium/application/FragmentService')

const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

const fragment = fragmentFactory.build()
const saved = Bluebird.resolve(fragment)

let onSave: jest.Mock<Bluebird<Fragment>, [Bluebird<Fragment>]>
let props: TabsProps

beforeEach(() => {
  jest.clearAllMocks()
  onSave = jest.fn((updated: Bluebird<Fragment>) => updated)
  props = {
    fragment,
    fragmentService: fragmentServiceMock,
    onSave,
  } as unknown as TabsProps
})

function propsOf<Props>(element: JSX.Element): Props {
  return element.props as Props
}

describe('every editor tab routes its save through onSave', () => {
  it('EditionContents saves the edition', () => {
    fragmentServiceMock.updateEdition.mockReturnValue(saved)
    const fields: EditionFields = {
      transliteration: 'kur',
      notes: '',
      introduction: '',
    }

    propsOf<{ updateEdition: (fields: EditionFields) => unknown }>(
      EditionContents(props),
    ).updateEdition(fields)

    expect(fragmentServiceMock.updateEdition).toHaveBeenCalledWith(
      fragment.number,
      fields,
    )
    expect(onSave).toHaveBeenCalledWith(saved)
  })

  it('LemmatizationContents saves the lemma annotation', () => {
    fragmentServiceMock.updateLemmaAnnotation.mockReturnValue(saved)
    const annotations: LineLemmaAnnotations = {}

    propsOf<{
      updateAnnotation: (annotations: LineLemmaAnnotations) => unknown
    }>(LemmatizationContents(props)).updateAnnotation(annotations)

    expect(fragmentServiceMock.updateLemmaAnnotation).toHaveBeenCalledWith(
      fragment.number,
      annotations,
    )
    expect(onSave).toHaveBeenCalledWith(saved)
  })

  it('ArchaeologyContents saves the archaeology', () => {
    fragmentServiceMock.updateArchaeology.mockReturnValue(saved)
    const archaeology = { excavationNumber: 'X.1' } as ArchaeologyDto

    propsOf<{ updateArchaeology: (dto: ArchaeologyDto) => unknown }>(
      ArchaeologyContents(props),
    ).updateArchaeology(archaeology)

    expect(fragmentServiceMock.updateArchaeology).toHaveBeenCalledWith(
      fragment.number,
      archaeology,
    )
    expect(onSave).toHaveBeenCalledWith(saved)
  })

  it('ColophonContents saves the colophon', async () => {
    fragmentServiceMock.updateColophon.mockReturnValue(saved)
    const colophon = colophonFactory.build()

    await propsOf<{ updateColophon: (colophon: Colophon) => Promise<void> }>(
      ColophonContents(props),
    ).updateColophon(colophon)

    expect(fragmentServiceMock.updateColophon).toHaveBeenCalledWith(
      fragment.number,
      colophon,
    )
    expect(onSave).toHaveBeenCalledWith(saved)
  })

  it('ScopeContents saves the scopes', async () => {
    fragmentServiceMock.updateScopes.mockReturnValue(saved)
    const scopes = ['CAIC']

    await propsOf<{ updateScopes: (scopes: string[]) => Promise<void> }>(
      ScopeContents(props, {} as Session),
    ).updateScopes(scopes)

    expect(fragmentServiceMock.updateScopes).toHaveBeenCalledWith(
      fragment.number,
      scopes,
    )
    expect(onSave).toHaveBeenCalledWith(saved)
  })
})

describe('ArchaeologyContents passes the archaeology it has', () => {
  it('passes the fragment archaeology when there is one', () => {
    const archaeology = { excavationNumber: 'X.1' } as ArchaeologyDto
    const element = ArchaeologyContents({
      ...props,
      fragment: { ...fragment, archaeology },
    } as unknown as TabsProps)

    expect(propsOf<{ archaeology: unknown }>(element).archaeology).toEqual(
      archaeology,
    )
  })

  it('passes null when the fragment has none', () => {
    const element = ArchaeologyContents({
      ...props,
      fragment: { ...fragment, archaeology: undefined },
    } as unknown as TabsProps)

    expect(propsOf<{ archaeology: unknown }>(element).archaeology).toBeNull()
  })
})

describe('DisplayContents', () => {
  it('forwards its props to the display', () => {
    expect(propsOf<TabsProps>(DisplayContents(props)).fragment).toBe(fragment)
  })
})

describe('ReferencesContents', () => {
  it('serialises the references before saving them', () => {
    fragmentServiceMock.updateReferences.mockReturnValue(saved)
    const references = [referenceFactory.build()]

    propsOf<{ updateReferences: (references: unknown[]) => unknown }>(
      ReferencesContents(props),
    ).updateReferences(references)

    expect(fragmentServiceMock.updateReferences).toHaveBeenCalledWith(
      fragment.number,
      references.map(serializeReference),
    )
    expect(onSave).toHaveBeenCalledWith(saved)
  })

  it('delegates the bibliography search to the fragment service', () => {
    const results = Bluebird.resolve([])
    fragmentServiceMock.searchBibliography.mockReturnValue(results)

    const returned = propsOf<{
      searchBibliography: (query: string) => unknown
    }>(ReferencesContents(props)).searchBibliography('Borger 1957')

    expect(fragmentServiceMock.searchBibliography).toHaveBeenCalledWith(
      'Borger 1957',
    )
    expect(returned).toBe(results)
  })
})
