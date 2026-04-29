import React from 'react'
import About, { TabId } from 'about/ui/about'
import Bluebird from 'bluebird'
import '@testing-library/jest-dom'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
      Bluebird.resolve(markupDtoSerialized),
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
    expect(screen.getByRole('link', { name: '⊞ Corpus' })).toHaveClass('active')
    expect(
      screen.getByRole('heading', { name: /I\. Corpus/i }),
    ).toBeInTheDocument()
  })

  test('renders with default tab content', async () => {
    await renderAbout(['/about/project'], 'project')
    expect(
      screen.getByRole('link', { name: '⚙ eBL Project' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '⚙ eBL Project' })).toHaveClass(
      'active',
    )
    expect(
      screen.getByRole('link', { name: '⚙ eBL Project' }),
    ).toHaveTextContent('eBL Project')
  })

  test('updates tab when activeTab prop changes', async () => {
    const view = render(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="project" />
      </MemoryRouter>,
    )
    await waitForSpinnersToDisappear()

    expect(screen.getByRole('link', { name: '⚙ eBL Project' })).toHaveClass(
      'active',
    )

    view.rerender(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="signs" />
      </MemoryRouter>,
    )
    await waitForSpinnersToDisappear()

    expect(screen.getByRole('link', { name: '𒀀 Signs' })).toHaveClass('active')
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
      expect(
        screen.getByRole('link', { name: new RegExp(tabText) }),
      ).toBeInTheDocument()
    })
  })

  test('does not change tab when clicking active tab', async () => {
    await renderAbout(['/about/project'], 'project')

    const projectTab = screen.getByRole('link', { name: '⚙ eBL Project' })
    fireEvent.click(projectTab)

    expect(screen.getByRole('link', { name: '⚙ eBL Project' })).toHaveClass(
      'active',
    )
  })

  test('navigates to different tab when clicking inactive tab', async () => {
    await renderAbout(['/about/project'], 'project')

    fireEvent.click(screen.getByRole('link', { name: '⊞ Corpus' }))
    await waitForSpinnersToDisappear()

    expect(screen.getByRole('link', { name: '⊞ Corpus' })).toHaveClass('active')
  })

  test('scrolls to hash target when URL contains hash', async () => {
    const scrollIntoView = jest.fn()
    const element = document.createElement('div')
    element.id = 'test-section'
    element.scrollIntoView = scrollIntoView
    document.body.appendChild(element)

    render(
      <MemoryRouter initialEntries={['/about/project#test-section']}>
        <About markupService={markupServiceMock} activeTab="project" />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    })

    document.body.removeChild(element)
  })

  test('renders news tab with activeSection', async () => {
    render(
      <MemoryRouter initialEntries={['/about/news/1']}>
        <About
          markupService={markupServiceMock}
          activeTab="news"
          activeSection="1"
        />
      </MemoryRouter>,
    )
    await waitForSpinnersToDisappear()

    expect(screen.getByRole('link', { name: /News/ })).toHaveClass('active')
  })

  test('renders news tab without activeSection', async () => {
    render(
      <MemoryRouter initialEntries={['/about/news']}>
        <About markupService={markupServiceMock} activeTab="news" />
      </MemoryRouter>,
    )
    await waitForSpinnersToDisappear()

    expect(screen.getByRole('link', { name: /News/ })).toHaveClass('active')
  })

  test('does not scroll when hash target element is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/about/project#nonexistent']}>
        <About markupService={markupServiceMock} activeTab="project" />
      </MemoryRouter>,
    )
    await waitForSpinnersToDisappear()

    expect(
      screen.getByRole('link', { name: /eBL Project/ }),
    ).toBeInTheDocument()
  })
})
