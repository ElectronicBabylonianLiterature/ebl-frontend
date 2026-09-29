import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultPageButtons } from 'common/ui/ResultPageButtons'
import { queryItemFactory } from 'test-support/query-item-factory'
import { getPageItem } from 'common/ui/ResultPageButtons.edge-cases.testSupport'
import { observeConsole } from 'setupTests'

describe('ResultPageButtons - Edge Cases and Boundary Conditions', () => {
  const setActive = jest.fn()

  beforeEach(() => {
    setActive.mockClear()
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
      expect(renderTime).toBeLessThan(1000)

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

      const activePageItem = getPageItem('3')
      expect(activePageItem).toHaveClass('active')
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
      const consoleSpy = observeConsole('error')
      const pages = Array.from({ length: 20 }, () =>
        queryItemFactory.buildList(10),
      )

      render(
        <ResultPageButtons pages={pages} active={0} setActive={setActive} />,
      )

      expect(consoleSpy).not.toHaveBeenCalled()
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

      const page1 = getPageItem('1')
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
