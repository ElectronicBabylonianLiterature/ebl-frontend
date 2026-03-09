import React from 'react'
import About, { TabId } from 'about/ui/about'
import Bluebird from 'bluebird'
import '@testing-library/jest-dom'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

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
  activeSection?: string,
) => {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <About
        markupService={markupServiceMock}
        activeTab={activeTab}
        activeSection={activeSection}
      />
    </MemoryRouter>,
  )
}

describe('About component', () => {
  beforeEach(() => {
    mockDate.mockReturnValue('1/1/2023')
    markupServiceMock.fromString.mockReturnValue(
      Bluebird.resolve(markupDtoSerialized),
    )
  })

  test('renders corpus tab content', async () => {
    render(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="corpus" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'Corpus',
    )
    expect(
      screen.getByRole('heading', { name: /I\. Corpus/i }),
    ).toBeInTheDocument()
  })

  test('renders with default tab content', async () => {
    await renderAbout(['/about/project'], 'project')
    expect(screen.getByText('eBL Project')).toBeInTheDocument()
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'eBL Project',
    )
  })

  test('updates tab when activeTab prop changes', async () => {
    const view = render(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="project" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'eBL Project',
    )

    view.rerender(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="signs" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'Signs',
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
    render(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="project" />
      </MemoryRouter>,
    )

    const projectTab = screen.getByText('eBL Project')
    fireEvent.click(projectTab)
  })
})
