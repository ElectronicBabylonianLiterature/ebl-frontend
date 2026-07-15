import React from 'react'
import Bluebird from 'bluebird'
import { render, screen, waitFor } from '@testing-library/react'
import {
  emptyNamedEntityPreview,
  NamedEntityPreviewProvider,
} from 'fragmentarium/ui/text-annotation/NamedEntityPreviewContext'
import NamedEntityPreviewToken from 'fragmentarium/ui/text-annotation/NamedEntityPreviewToken'
import {
  realiaServiceMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import { annotatedFragment } from 'test-support/named-entity-fixtures'
import { Token } from 'transliteration/domain/token'

jest.mock('realia/application/RealiaService')

const entry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
  type: ['Divine names'],
})

const realiaWord = annotatedFragment.text.lines[0].content[2] as Token

describe('emptyNamedEntityPreview', () => {
  it('holds no spans', () => {
    expect(emptyNamedEntityPreview.namedEntities).toEqual([])
    expect(emptyNamedEntityPreview.realia).toEqual([])
  })
})

describe('NamedEntityPreviewProvider', () => {
  it('labels and colours the realia spans from the realia entries', async () => {
    realiaServiceMock.find.mockReturnValue(Bluebird.resolve(entry))

    render(
      <WithRealiaService>
        <NamedEntityPreviewProvider fragment={annotatedFragment}>
          <NamedEntityPreviewToken token={realiaWord}>
            <span>{realiaWord.value}</span>
          </NamedEntityPreviewToken>
        </NamedEntityPreviewProvider>
      </WithRealiaService>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('Word-3__Realia-1')).toHaveAttribute(
        'data-label',
        'Apkallu',
      ),
    )
    expect(screen.getByTestId('Word-3__Realia-1')).toHaveClass(
      'named-entity__DIVINE_NAME',
    )
    expect(realiaServiceMock.find).toHaveBeenCalledWith('realia_000846')
  })
})
