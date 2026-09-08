import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ArchaeologyContents,
  DisplayContents,
  NamedEntityAnnotationContents,
  ColophonContents,
  EditionContents,
  LemmatizationContents,
  ReferencesContents,
  ScopeContents,
  TabsProps,
} from 'fragmentarium/ui/fragment/CuneiformFragmentTabContents'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Session } from 'auth/Session'

jest.mock('fragmentarium/ui/display/Display', () =>
  jest.requireActual(
    'fragmentarium/ui/fragment/CuneiformFragmentTabContents.mocks',
  ),
)
jest.mock('fragmentarium/ui/text-annotation/TextAnnotation', () =>
  jest.requireActual(
    'fragmentarium/ui/fragment/CuneiformFragmentTabContents.mocks',
  ),
)
jest.mock('fragmentarium/ui/edition/Edition', () =>
  jest.requireActual(
    'fragmentarium/ui/fragment/CuneiformFragmentTabContents.mocks',
  ),
)
jest.mock('fragmentarium/ui/fragment/References', () =>
  jest.requireActual(
    'fragmentarium/ui/fragment/CuneiformFragmentTabContents.mocks',
  ),
)
jest.mock('fragmentarium/ui/fragment/ArchaeologyEditor', () =>
  jest.requireActual(
    'fragmentarium/ui/fragment/CuneiformFragmentTabContents.mocks',
  ),
)
jest.mock('fragmentarium/ui/fragment/ColophonEditor', () =>
  jest.requireActual(
    'fragmentarium/ui/fragment/CuneiformFragmentTabContents.mocks',
  ),
)
jest.mock('fragmentarium/ui/fragment/ScopeEditor', () =>
  jest.requireActual(
    'fragmentarium/ui/fragment/CuneiformFragmentTabContents.mocks',
  ),
)
jest.mock(
  'fragmentarium/ui/fragment/lemma-annotation/InitializeLemmatizer',
  () => ({
    __esModule: true,
    InitializeLemmatizer: jest.requireActual(
      'fragmentarium/ui/fragment/CuneiformFragmentTabContents.mocks',
    ).SaveTriggerMock,
  }),
)

let fragment: Fragment
let onSave: jest.Mock
let fragmentService: Record<string, jest.Mock>

beforeEach(() => {
  fragment = fragmentFactory.build()
  onSave = jest.fn((save: () => Promise<Fragment>) => save())
  fragmentService = {
    updateEdition: jest.fn().mockResolvedValue(fragment),
    updateLemmaAnnotation: jest.fn().mockResolvedValue(fragment),
    updateReferences: jest.fn().mockResolvedValue(fragment),
    updateArchaeology: jest.fn().mockResolvedValue(fragment),
    updateColophon: jest.fn().mockResolvedValue(fragment),
    updateScopes: jest.fn().mockResolvedValue(fragment),
    searchBibliography: jest.fn().mockResolvedValue([]),
  }
})

function props(): TabsProps {
  return {
    fragment,
    fragmentService,
    fragmentSearchService: {},
    wordService: {},
    findspotService: {},
    onSave,
    activeLine: '',
    onToggle: jest.fn(),
    isColumnVisible: true,
  } as unknown as TabsProps
}

async function triggerSave(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: 'Trigger save' }))
}

test.each([
  ['edition', EditionContents, 'updateEdition'],
  ['lemma annotation', LemmatizationContents, 'updateLemmaAnnotation'],
  ['references', ReferencesContents, 'updateReferences'],
  ['archaeology', ArchaeologyContents, 'updateArchaeology'],
  ['colophon', ColophonContents, 'updateColophon'],
])('Saving the %s tab calls %s', async (_name, Contents, method) => {
  render(<Contents {...props()} />)

  await triggerSave()

  expect(onSave).toHaveBeenCalled()
  expect(fragmentService[method]).toHaveBeenCalledWith(
    fragment.number,
    expect.anything(),
  )
})

test('Saving the scope tab calls updateScopes', async () => {
  render(<>{ScopeContents(props(), {} as Session)}</>)

  await triggerSave()

  expect(fragmentService.updateScopes).toHaveBeenCalledWith(
    fragment.number,
    expect.anything(),
  )
})

test('The references tab serializes the references it saves', async () => {
  render(<ReferencesContents {...props()} />)

  await triggerSave()

  expect(fragmentService.updateReferences).toHaveBeenCalledWith(
    fragment.number,
    [],
  )
})

test('The references tab delegates bibliography search', async () => {
  render(<ReferencesContents {...props()} />)

  await userEvent.click(screen.getByRole('button', { name: 'Trigger search' }))

  expect(fragmentService.searchBibliography).toHaveBeenCalledWith('query')
})

test.each([
  ['display', DisplayContents],
  ['named entity annotation', NamedEntityAnnotationContents],
])('Renders the %s tab', (_name, Contents) => {
  render(<Contents {...props()} />)

  expect(screen.getByRole('button', { name: 'Trigger save' })).toBeVisible()
})

test('The archaeology tab renders for a fragment without archaeology', () => {
  const tabProps = props()
  render(
    <ArchaeologyContents
      {...tabProps}
      fragment={fragmentFactory.build({ archaeology: undefined })}
    />,
  )

  expect(screen.getByRole('button', { name: 'Trigger save' })).toBeVisible()
})
