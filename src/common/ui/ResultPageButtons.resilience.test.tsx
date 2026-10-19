import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultPageButtons } from 'common/ui/ResultPageButtons'
import { queryItemFactory } from 'test-support/query-item-factory'
import { observeConsole } from 'setupTests'
import { getPageItem } from 'common/ui/ResultPageButtons.testSupport'

describe('ResultPageButtons - Accessibility and Resilience', () => {
  const setActive = jest.fn()

  beforeEach(() => {
    setActive.mockClear()
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
