import React from 'react'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Link } from 'react-router-dom'

export default function FosseyContent({
  fossey,
}: {
  fossey: any
}): JSX.Element {
  return (
    <table className="table table-bordered">
      {fossey
        .slice()
        .sort((a, b) => (a.number < b.number ? -1 : 1))
        .map((InstanceOfFossey) => (
          <>
            <tr>
              <td className="align-middle text-right">
                <strong>{InstanceOfFossey.number}</strong>
              </td>
              <td className="align-middle ml1">
                {InstanceOfFossey.sign && (
                  <>
                    <svg
                      height="100"
                      width="100%"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <path d={InstanceOfFossey.sign} />
                    </svg>
                  </>
                )}
              </td>
              <td className="align-middle text-center">
                {InstanceOfFossey.reference}
                <br />
                {InstanceOfFossey.museumNumber && (
                  <>
                    (={' '}
                    <Link
                      to={`/fragmentarium/${museumNumberToString(
                        InstanceOfFossey.museumNumber
                      )}`}
                    >
                      {museumNumberToString(InstanceOfFossey.museumNumber)}){' '}
                    </Link>
                    <br />
                  </>
                )}
                {InstanceOfFossey.date && (
                  <span className="text-left text-black-50">
                    ({InstanceOfFossey.date})
                  </span>
                )}
              </td>
            </tr>
          </>
        ))}
    </table>
  )
}
