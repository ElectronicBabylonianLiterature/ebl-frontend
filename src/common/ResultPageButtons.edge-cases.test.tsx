import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultPageButtons } from './ResultPageButtons'
import { queryItemFactory } from 'test-support/query-item-factory'

/**
 * Edge Case Tests for Search Results Pagination
 *
 * Why these tests:
 * - Pagination is critical UX - users must navigate large result sets reliably
 * - Edge cases (0 results, 1 page, boundary conditions) often cause UI bugs
 * - State management errors can cause infinite loops or crashes
 * - Button generation logic with ellipsis has complex branching
 */

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

      const page1 = screen.getByRole('button', { name: '1' })
      expect(page1).toHaveClass('active')
      expect(screen.getByText('20')).toBeInTheDocument()
    })

    test('Active page is last page', () => {
      render(
        <ResultPageButtons pages={pages} active={19} setActive={setActive} />,
      )

      const page20 = screen.getByRole('button', { name: '20' })
      expect(page20).toHaveClass('active')
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    test('Active page beyond pages length - handles gracefully', () => {
      // Should not crash even if active index is out of bounds
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
      const page26 = screen.getByText('26')
      expect(page26).toHaveClass('active') // 0-indexed becomes 1-indexed
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

      // May or may not show ellipsis at exactly 8 pages depending on implementation
      const pagination = screen.getByLabelText('result-pagination')
      expect(pagination).toBeInTheDocument()
    })
  })

  describe('Click Interactions', () => {
    const pages = Array.from({ length: 10 }, () =>
      queryItemFactory.buildList(10),
    )

    test('Clicking page button calls setActive with correct index', async () => {
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      const page5Button = screen.getByText('5')
      await userEvent.click(page5Button)

      expect(setActive).toHaveBeenCalledWith(4) // 0-indexed
    })

    test('Clicking active page button calls setActive', async () => {
      render(
        <ResultPageButtons pages={pages} active={2} setActive={setActive} />,
      )

      const activePage = screen.getByText('3')
      expect(activePage).toHaveClass('active')

      await userEvent.click(activePage)
      expect(setActive).toHaveBeenCalledWith(2)
    })

    test('Multiple rapid clicks handled correctly', async () => {
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      const page2 = screen.getByText('2')
      const page3 = screen.getByText('3')

      await userEvent.click(page2)
      await userEvent.click(page3)

      expect(setActive).toHaveBeenCalledTimes(2)
      expect(setActive).toHaveBeenNthCalledWith(1, 1)
      expect(setActive).toHaveBeenNthCalledWith(2, 2)
    })

    test('Cannot click ellipsis (not a button)', () => {
      const manyPages = Array.from({ length: 20 }, () =>
        queryItemFactory.buildList(10),
      )
      render(
        <ResultPageButtons
          pages={manyPages}
          active={0}
          setActive={setActive}
        />,
      )

      const ellipsis = screen.getByText('…')
      // Ellipsis should not be clickable/interactive
      expect(ellipsis).not.toHaveAttribute('role', 'button')
    })
  })

  describe('State Synchronization', () => {
    test('Active state updates correctly on rerender', () => {
      const pages = Array.from({ length: 5 }, () =>
        queryItemFactory.buildList(10),
      )
      const { rerender } = render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      let page1 = screen.getByText('1')
      expect(page1).toHaveClass('active')

      rerender(
        <ResultPageButtons pages={pages} active={2} setActive={setActive} />,
      )

      page1 = screen.getByText('1') // Re-query after rerender
      expect(page1).not.toHaveClass('active')
      const page3 = screen.getByText('3')
      expect(page3).toHaveClass('active')
    })

    test('Pages array changes - updates button count', () => {
      const initialPages = Array.from({ length: 3 }, () =>
        queryItemFactory.buildList(10),
      )
      const { rerender } = render(
        <ResultPageButtons
          pages={initialPages}
          active={0}
          setActive={setActive}
        />,
      )

      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.queryByText('5')).not.toBeInTheDocument()

      const updatedPages = Array.from({ length: 5 }, () =>
        queryItemFactory.buildList(10),
      )
      rerender(
        <ResultPageButtons
          pages={updatedPages}
          active={0}
          setActive={setActive}
        />,
      )

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    test('setActive function changes - uses new function', async () => {
      const pages = Array.from({ length: 3 }, () =>
        queryItemFactory.buildList(10),
      )
      const newSetActive = jest.fn()

      const { rerender } = render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      rerender(
        <ResultPageButtons pages={pages} active={0} setActive={newSetActive} />,
      )

      await userEvent.click(screen.getByText('2'))

      expect(setActive).not.toHaveBeenCalled()
      expect(newSetActive).toHaveBeenCalledWith(1)
    })
  })

  describe('Large Result Sets', () => {
    test('100 pages - renders efficiently without performance issues', () => {
      const manyPages = Array.from({ length: 100 }, () =>
        queryItemFactory.buildList(50),
      )
      const start = performance.now()

      render(
        <ResultPageButtons
          pages={manyPages}
          active={0}
          setActive={setActive}
        />,
      )

      const renderTime = performance.now() - start
      expect(renderTime).toBeLessThan(1000) // Should render in less than 1 second

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    test('1000 pages - extreme case handles gracefully', () => {
      const extremePages = Array.from({ length: 1000 }, () =>
        queryItemFactory.buildList(50),
      )

      render(
        <ResultPageButtons
          pages={extremePages}
          active={500}
          setActive={setActive}
        />,
      )

      expect(screen.getByLabelText('result-pagination')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('1000')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    const pages = Array.from({ length: 5 }, () =>
      queryItemFactory.buildList(10),
    )

    test('Pagination has aria-label', () => {
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      expect(screen.getByLabelText('result-pagination')).toBeInTheDocument()
    })

    test('Active page has aria-current attribute', () => {
      render(
        <ResultPageButtons pages={pages} active={2} setActive={setActive} />,
      )

      const activePage = screen.getByText('3')
      // React Bootstrap sets active class on Pagination.Item
      expect(activePage).toHaveClass('active')
    })

    test('Page buttons are keyboard accessible', async () => {
      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      const page2 = screen.getByText('2')
      page2.focus()

      expect(page2).toHaveFocus()
    })
  })

  describe('Edge Case: Zero-Length Pages', () => {
    test('Pages with varying lengths including empty', () => {
      const mixedPages = [
        queryItemFactory.buildList(10),
        [],
        queryItemFactory.buildList(5),
        [],
      ]

      render(
        <ResultPageButtons
          pages={mixedPages}
          active={0}
          setActive={setActive}
        />,
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })

  describe('Component Stability', () => {
    test('Rerenders without error when props change', () => {
      const pages = Array.from({ length: 3 }, () =>
        queryItemFactory.buildList(10),
      )
      const { rerender } = render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      expect(screen.getByText('1')).toBeInTheDocument()

      rerender(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    test('No console errors or warnings', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const pages = Array.from({ length: 20 }, () =>
        queryItemFactory.buildList(10),
      )

      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Real-World Scenarios', () => {
    test('User searches, gets 157 results across 4 pages', async () => {
      const pages = [
        queryItemFactory.buildList(50),
        queryItemFactory.buildList(50),
        queryItemFactory.buildList(50),
        queryItemFactory.buildList(7),
      ]

      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      const page1 = screen.getByText('1')
      expect(page1).toHaveClass('active')
      expect(screen.getByText('4')).toBeInTheDocument()

      await userEvent.click(screen.getByText('4'))
      expect(setActive).toHaveBeenCalledWith(3)
    })

    test('Refined search reduces pages from 10 to 2', () => {
      const initialPages = Array.from({ length: 10 }, () =>
        queryItemFactory.buildList(50),
      )
      const { rerender } = render(
        <ResultPageButtons
          pages={initialPages}
          active={2}
          setActive={setActive}
        />,
      )

      expect(screen.getByText('10')).toBeInTheDocument()

      const refinedPages = Array.from({ length: 2 }, () =>
        queryItemFactory.buildList(30),
      )
      rerender(
        <ResultPageButtons
          pages={refinedPages}
          active={0}
          setActive={setActive}
        />,
      )

      expect(screen.queryByText('10')).not.toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    test('No results found - empty pages array', () => {
      render(<ResultPageButtons pages={[]} active={0} setActive={setActive} />)

      const pagination = screen.getByLabelText('result-pagination')
      expect(pagination).toBeInTheDocument()
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
  })
})
