import React from 'react'

export default function FosseyContent({
  fossey,
}: {
  fossey: any
}): JSX.Element {
  return fossey
    .slice()
    .sort()
    .map((InstanceOfFossey) => <>{InstanceOfFossey.number}, </>)
}
