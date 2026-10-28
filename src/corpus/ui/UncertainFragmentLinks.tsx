import React from 'react'
import _ from 'lodash'
import type { UncertainFragment } from 'corpus/domain/text'
import FragmentariumLink from 'corpus/ui/FragmentariumLink'
import type FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'

const fragmentExistenceLimiter = new ConcurrencyLimiter(4)

type Props = {
  uncertainFragments: readonly UncertainFragment[]
  fragmentService: Pick<FragmentService, 'isInFragmentarium'>
}

export default withData<Props, unknown, ReadonlyMap<string, boolean>>(
  ({ uncertainFragments, data }) => (
    <ul className="list-of-manuscripts__uncertain-fragments">
      {uncertainFragments.map((uncertainFragment, index) => (
        <li key={`${uncertainFragment.museumNumber}-${index}`}>
          <FragmentariumLink
            item={{
              ...uncertainFragment,
              isInFragmentarium:
                data.get(uncertainFragment.museumNumber) === true,
            }}
          />
        </li>
      ))}
    </ul>
  ),
  async ({ uncertainFragments, fragmentService }, signal) => {
    const numbers = _.uniq(
      uncertainFragments.map(({ museumNumber }) => museumNumber),
    )
    const existence = await Promise.all(
      numbers.map(async (museumNumber) => ({
        museumNumber,
        exists: await fragmentExistenceLimiter.run(
          () => fragmentService.isInFragmentarium(museumNumber),
          signal,
        ),
      })),
    )
    return new Map(
      existence.map(({ museumNumber, exists }) => [museumNumber, exists]),
    )
  },
  {
    watch: ({ uncertainFragments, fragmentService }) => [
      fragmentService,
      JSON.stringify(
        uncertainFragments.map(({ museumNumber }) => museumNumber),
      ),
    ],
    retry: true,
  },
)
