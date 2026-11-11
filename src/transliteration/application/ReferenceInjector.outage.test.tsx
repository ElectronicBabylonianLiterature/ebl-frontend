import React from 'react'
import { render, screen } from '@testing-library/react'
import BibliographyService from 'bibliography/application/BibliographyService'
import {
  createBibliographyRepositoryMock,
  createDeferred,
} from 'bibliography/application/BibliographyService.testSupport'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import { ApiError } from 'http/ApiClient'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import ReferenceInjector from 'transliteration/application/ReferenceInjector'
import { BibliographyPart } from 'transliteration/domain/markup'
import Markup from 'transliteration/ui/markup'

function citation(id: string): BibliographyPart {
  return {
    type: 'BibliographyPart',
    reference: {
      id,
      type: 'DISCUSSION',
      pages: '5',
      notes: '',
      linesCited: [],
    },
  }
}

test('keeps healthy citations readable during a partial bibliography outage', async () => {
  const repository = createBibliographyRepositoryMock()
  const healthyEntry = bibliographyEntryFactory.build()
  const failure = new ApiError('Bibliography unavailable', {}, 500)
  const reportError = jest.fn()
  repository.findMany.mockResolvedValue([healthyEntry])
  repository.find.mockRejectedValue(failure)
  const injector = new ReferenceInjector(new BibliographyService(repository), {
    captureException: reportError,
  })

  const parts = await injector.injectReferencesToMarkup([
    citation(healthyEntry.id),
    citation('outage'),
  ])
  render(<Markup parts={parts} />)

  expect(parts[0]).toMatchObject({ reference: expect.any(Reference) })
  expect(
    screen.queryByText(`@bib{${healthyEntry.id}@5}`),
  ).not.toBeInTheDocument()
  expect(screen.getByText('@bib{outage@5}')).toBeVisible()
  expect(reportError).toHaveBeenCalledTimes(1)
  expect(reportError).toHaveBeenCalledWith(failure)
  expect(repository.findMany).toHaveBeenCalledTimes(1)
  expect(repository.find).toHaveBeenCalledTimes(1)
})

test('retains cached citations when the complete bibliography batch is unavailable', async () => {
  const repository = createBibliographyRepositoryMock()
  const service = new BibliographyService(repository)
  const healthyEntry = bibliographyEntryFactory.build()
  const failure = new ApiError('Bibliography unavailable', {}, 500)
  const reportError = jest.fn()
  repository.find.mockResolvedValue(healthyEntry)
  await service.find(healthyEntry.id)
  repository.findMany.mockRejectedValue(failure)

  const parts = await new ReferenceInjector(service, {
    captureException: reportError,
  }).injectReferencesToMarkup([citation(healthyEntry.id), citation('outage')])
  render(<Markup parts={parts} />)

  expect(parts[0]).toMatchObject({ reference: expect.any(Reference) })
  expect(screen.getByText('@bib{outage@5}')).toBeVisible()
  expect(reportError).toHaveBeenCalledTimes(1)
  expect(reportError).toHaveBeenCalledWith(failure)
  expect(repository.find).toHaveBeenCalledTimes(1)
})

test('reports one shared batch outage once while retaining healthy content', async () => {
  const repository = createBibliographyRepositoryMock()
  const service = new BibliographyService(repository)
  const batch = createDeferred<readonly BibliographyEntry[]>()
  const failure = new ApiError('Bibliography unavailable', {}, 500)
  const reportError = jest.fn()
  repository.findMany.mockReturnValue(
    batch.promise.then(() => {
      throw failure
    }),
  )
  const strictRequest = service.findManyById(['failed-a', 'failed-b'])
  const rejection = expect(strictRequest).rejects.toBe(failure)
  const request = new ReferenceInjector(service, {
    captureException: reportError,
  }).injectReferencesToMarkup([citation('failed-a'), citation('failed-b')])
  batch.resolve([])

  await rejection
  await expect(request).resolves.toEqual([
    citation('failed-a'),
    citation('failed-b'),
  ])
  expect(reportError).toHaveBeenCalledTimes(1)
  expect(reportError).toHaveBeenCalledWith(failure)
  expect(repository.findMany).toHaveBeenCalledTimes(1)
  expect(repository.find).not.toHaveBeenCalled()
})
