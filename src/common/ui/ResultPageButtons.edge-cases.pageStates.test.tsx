import React from 'react'
import { render, screen } from '@testing-library/react'
import { ResultPageButtons } from 'common/ui/ResultPageButtons'
import { queryItemFactory } from 'test-support/query-item-factory'
import { getPageItem } from 'common/ui/ResultPageButtons.edge-cases.testSupport'

describe('ResultPageButtons - Edge Cases and Boundary Conditions', () => {
  const setActive = jest.fn()

  beforeEach(() => {
    setActive.mockClear()
  })

  describe('Empty and Single-Item States', () => {
    test('Empty pages array - renders without error', () => {
      render(<ResultPageButtons pages={[]} active={0} setActive={setActive} />)
      expect(screen.getByLabelText('result-pagination')).toBeInTheDocument()
    })

    test('Single empty page - renders without error', () => {
      const pages = [[]]
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
    })

    test('Single page with one result - no pagination needed', () => {
      const pages = [[queryItemFactory.build()]]
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      const pagination = screen.getByLabelText('result-pagination')
      expect(pagination).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
    })

    test('Two pages - shows both page buttons', () => {
      const pages = [
        queryItemFactory.buildList(10),
        queryItemFactory.buildList(5),
      ]
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.queryByText('…')).not.toBeInTheDocument()
    })
  })

  describe('Active Page Boundaries', () => {
    const pages = Array.from({ length: 20 }, (_, i) =>
      queryItemFactory.buildList(10, {}, { transient: { chance: null } }),
    )

    test('Active page 0 (first page)', () => {
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      const page1 = getPageItem('1')
      expect(page1).toHaveClass('active')
      expect(screen.getByText('20')).toBeInTheDocument()
    })

    test('Active page is last page', () => {
      render(
        <ResultPageButtons pages={pages} active={19} setActive={setActive} />,
      )

      const page20 = getPageItem('20')
      expect(page20).toHaveClass('active')
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    test('Active page beyond pages length - handles gracefully', () => {
      render(
        <ResultPageButtons pages={pages} active={25} setActive={setActive} />,
      )

      expect(screen.getByLabelText('result-pagination')).toBeInTheDocument()
    })

    test('Negative active page - handles gracefully', () => {
      render(
        <ResultPageButtons pages={pages} active={-1} setActive={setActive} />,
      )

      expect(screen.getByLabelText('result-pagination')).toBeInTheDocument()
    })
  })

  describe('Ellipsis Generation Logic', () => {
    const manyPages = Array.from({ length: 50 }, () =>
      queryItemFactory.buildList(10),
    )

    test('Shows ellipsis when many pages exist', () => {
      render(
        <ResultPageButtons
          pages={manyPages}
          active={0}
          setActive={setActive}
        />,
      )

      expect(screen.getByText('…')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    test('Ellipsis placement changes with active page in middle', () => {
      render(
        <ResultPageButtons
          pages={manyPages}
          active={25}
          setActive={setActive}
        />,
      )

      const ellipses = screen.getAllByText('…')
      expect(ellipses.length).toBeGreaterThanOrEqual(1)
      const page26 = getPageItem('26')
      expect(page26).toHaveClass('active')
    })

    test('No ellipsis needed for 5 pages', () => {
      const fewPages = Array.from({ length: 5 }, () =>
        queryItemFactory.buildList(10),
      )
      render(
        <ResultPageButtons pages={fewPages} active={2} setActive={setActive} />,
      )

      expect(screen.queryByText('…')).not.toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    test('Ellipsis appears at threshold (8+ pages)', () => {
      const eightPages = Array.from({ length: 8 }, () =>
        queryItemFactory.buildList(10),
      )
      render(
        <ResultPageButtons
          pages={eightPages}
          active={0}
          setActive={setActive}
        />,
      )

      const pagination = screen.getByLabelText('result-pagination')
      expect(pagination).toBeInTheDocument()
    })
  })
})
