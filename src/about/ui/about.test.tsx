import React from 'react'
import About, { TabId } from 'about/ui/about'
import Bluebird from 'bluebird'
import '@testing-library/jest-dom'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react'
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
) => {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <About markupService={markupServiceMock} activeTab={activeTab} />
    </MemoryRouter>,
  )

  if (activeTab === 'project') {
    await waitForElementToBeRemoved(() => {
      const loadingIndicators = screen.queryAllByText(/Loading\.\.\./)
      return loadingIndicators.length > 0 ? loadingIndicators : null
    })
  }
}

describe('About component', () => {
  beforeEach(() => {
    mockDate.mockReturnValue('1/1/2023')
    markupServiceMock.fromString.mockReturnValue(
      Bluebird.resolve(markupDtoSerialized),
    )
  })

  test('renders corpus tab content', async () => {
    await renderAbout(['/about/corpus'], 'corpus')
    expect(screen.getByRole('button', { name: '⊞ Corpus' })).toHaveClass(
      'active',
    )
    expect(
      screen.getByRole('heading', { name: /I\. Corpus/i }),
    ).toBeInTheDocument()
  })

  test('renders with default tab content', async () => {
    await renderAbout(['/about/project'], 'project')
    expect(
      screen.getByRole('button', { name: '⚙ eBL Project' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '⚙ eBL Project' })).toHaveClass(
      'active',
    )
    expect(
      screen.getByRole('button', { name: '⚙ eBL Project' }),
    ).toHaveTextContent('eBL Project')
  })

  test('updates tab when activeTab prop changes', async () => {
    const view = render(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="project" />
      </MemoryRouter>,
    )

    await waitForElementToBeRemoved(() => {
      const loadingIndicators = screen.queryAllByText(/Loading\.\.\./)
      return loadingIndicators.length > 0 ? loadingIndicators : null
    })

    expect(screen.getByRole('button', { name: '⚙ eBL Project' })).toHaveClass(
      'active',
    )

    view.rerender(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="signs" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '𒀀 Signs' })).toHaveClass(
      'active',
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
    ]

    expectedTabs.forEach((tabText) => {
      expect(
        screen.getByRole('button', { name: new RegExp(tabText) }),
      ).toBeInTheDocument()
    })
  })

  test('does not change tab when clicking active tab', async () => {
    await renderAbout(['/about/project'], 'project')

    const projectTab = screen.getByRole('button', { name: '⚙ eBL Project' })
    fireEvent.click(projectTab)
  })
})
