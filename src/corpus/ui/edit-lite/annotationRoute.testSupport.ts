import { waitFor } from '@testing-library/react'
import { ServedEditLiteRoute } from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  button,
  listDisabledViews,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import { leadingArguments } from 'test-support/FakeApiExpectation'

export function listGets(
  { fakeApi }: ServedEditLiteRoute,
  part: string,
): unknown[] {
  return leadingArguments(fakeApi.client.fetchJson, 1)
    .flat()
    .filter((path) => String(path).includes(part))
}

export function listPosts(
  { fakeApi }: ServedEditLiteRoute,
  argumentCount = 2,
): unknown[][] {
  return leadingArguments(fakeApi.client.postJson, argumentCount)
}

export async function waitForSavedView(): Promise<void> {
  await waitFor(() => expect(listDisabledViews()).toEqual([]))
  await waitFor(() => expect(button('Preview request')).toBeEnabled())
}
