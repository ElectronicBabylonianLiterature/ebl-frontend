import React from 'react'
import About, { TabId } from 'about/ui/about'
import Bluebird from 'bluebird'
import '@testing-library/jest-dom/extend-expect'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'
import {
  act,
  render,
  screen,
  fireEvent,
  RenderResult,
} from '@testing-library/react'
import { MemoryRouter, Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'

jest.mock('markup/application/MarkupService')

let mockDate: jest.SpyInstance<string>

beforeAll(() => {
  mockDate = jest
    .spyOn(Date.prototype, 'toLocaleDateString')
    .mockImplementation(() => '1/1/2023')
})

afterAll(() => {
  mockDate.mockRestore()
})

const markupServiceMock = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()

const renderAbout = async (
  initialEntries: string[] = ['/about/project'],
  activeTab: TabId = 'project',
  activeSection?: string
) => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <About
          markupService={markupServiceMock}
          activeTab={activeTab}
          activeSection={activeSection}
        />
      </MemoryRouter>
    )
  })
}

describe('About component', () => {
  beforeEach(() => {
    mockDate.mockReturnValue('1/1/2023')
    markupServiceMock.fromString.mockReturnValue(
      Bluebird.resolve(markupDtoSerialized)
    )
  })

  test('Snapshot', async () => {
    let container: HTMLElement | undefined
    await act(async () => {
      const { container: renderedContainer } = render(
        <MemoryRouter>
          <About markupService={markupServiceMock} activeTab="corpus" />
        </MemoryRouter>
      )
      container = renderedContainer
    })
    expect(container).toBeDefined()
    expect(container?.outerHTML).toMatchSnapshot()
  })

  test('renders with default tab content', async () => {
    await renderAbout(['/about/project'], 'project')
    expect(screen.getByText('eBL Project')).toBeInTheDocument()
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'eBL Project'
    )
  })

  test('updates tab when activeTab prop changes', async () => {
    let renderResult: RenderResult

    await act(async () => {
      renderResult = render(
        <MemoryRouter>
          <About markupService={markupServiceMock} activeTab="project" />
        </MemoryRouter>
      )
    })

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'eBL Project'
    )

    await act(async () => {
      renderResult.rerender(
        <MemoryRouter>
          <About markupService={markupServiceMock} activeTab="signs" />
        </MemoryRouter>
      )
    })

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'Signs'
    )
  })

  test('renders all tabs', async () => {
    await renderAbout()
    const expectedTabs = [
      'eBL Project',
      'Library',
      'Corpus',
      'Signs',
      'Dictionary',
      'Bibliography',
      'News',
    ]

    expectedTabs.forEach((tabText) => {
      expect(screen.getByText(tabText)).toBeInTheDocument()
    })
  })

  test('does not change tab when clicking active tab', async () => {
    const history = createMemoryHistory({ initialEntries: ['/about/project'] })
    jest.spyOn(history, 'push')

    await act(async () => {
      render(
        <Router history={history}>
          <About markupService={markupServiceMock} activeTab="project" />
        </Router>
      )
    })

    const projectTab = screen.getByText('eBL Project')
    await act(async () => {
      fireEvent.click(projectTab)
    })

    expect(history.push).not.toHaveBeenCalled()
  })
})
