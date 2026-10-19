import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultPageButtons } from 'common/ui/ResultPageButtons'
import { queryItemFactory } from 'test-support/query-item-factory'
import { getPageItem } from 'common/ui/ResultPageButtons.testSupport'

describe('ResultPageButtons - Interactions and Large Result Sets', () => {
  const setActive = jest.fn()

  beforeEach(() => {
    setActive.mockClear()
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

      expect(setActive).toHaveBeenCalledWith(4)
    })

    test('Clicking active page button does not call setActive', async () => {
      render(
        <ResultPageButtons pages={pages} active={2} setActive={setActive} />,
      )

      const activePageItem = getPageItem('3')
      expect(activePageItem).toHaveClass('active')
      await userEvent.click(activePageItem)
      expect(setActive).not.toHaveBeenCalled()
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

      let page1 = getPageItem('1')
      expect(page1).toHaveClass('active')

      rerender(
        <ResultPageButtons pages={pages} active={2} setActive={setActive} />,
      )

      page1 = getPageItem('1')
      expect(page1).not.toHaveClass('active')
      const page3 = getPageItem('3')
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
})
