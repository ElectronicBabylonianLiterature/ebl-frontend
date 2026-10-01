import React from 'react'
import About, { TabId } from 'about/ui/about'
import '@testing-library/jest-dom'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'
import { render, screen, waitFor, within } from '@testing-library/react'
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

const waitForSpinnersToDisappear = async () => {
  await waitFor(() => {
    expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
  })
}

const renderAbout = async (
  initialEntries: string[] = ['/about/project'],
  activeTab: TabId = 'project',
) => {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <About markupService={markupServiceMock} activeTab={activeTab} />
    </MemoryRouter>,
  )
  await waitForSpinnersToDisappear()
}

describe('About component', () => {
  beforeEach(() => {
    mockDate.mockReturnValue('1/1/2023')
    markupServiceMock.fromString.mockReturnValue(
      Promise.resolve(markupDtoSerialized),
    )
  })

  test('Snapshot', async () => {
    const { container } = render(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="corpus" />
      </MemoryRouter>,
    )
    await waitForSpinnersToDisappear()
    expect(container.outerHTML).toMatchSnapshot()
  })

  test('renders corpus tab content', async () => {
    await renderAbout(['/about/corpus'], 'corpus')
    expect(screen.getByRole('link', { name: 'Corpus' })).toHaveClass('active')
    expect(
      screen.getByRole('heading', { name: /I\. Corpus/i }),
    ).toBeInTheDocument()
  })

  test('renders with default tab content', async () => {
    await renderAbout(['/about/project'], 'project')
    expect(
      screen.getByRole('link', { name: 'eBL Project' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'eBL Project' })).toHaveClass(
      'active',
    )
    expect(screen.getByRole('link', { name: 'eBL Project' })).toHaveTextContent(
      'eBL Project',
    )
  })

  test('updates tab when activeTab prop changes', async () => {
    const view = render(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="project" />
      </MemoryRouter>,
    )
    await waitForSpinnersToDisappear()

    expect(screen.getByRole('link', { name: 'eBL Project' })).toHaveClass(
      'active',
    )

    view.rerender(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="signs" />
      </MemoryRouter>,
    )
    await waitForSpinnersToDisappear()

    expect(screen.getByRole('link', { name: 'Signs' })).toHaveClass('active')
  })

  test('renders all tabs', async () => {
    await renderAbout()
    const sidebarNavigation = screen.getByRole('navigation', {
      name: 'About sections',
    })

    const expectedTabs = [
      'eBL Project',
      'Library',
      'Corpus',
      'Signs',
      'Akkadian Dictionary',
      'Bibliography',
      'News',
      'Archaeology',
    ]

    expectedTabs.forEach((tabText) => {
      expect(
        within(sidebarNavigation).getByRole('link', { name: tabText }),
      ).toBeInTheDocument()
    })
  })
})
