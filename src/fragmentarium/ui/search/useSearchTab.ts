import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'

export default function useSearchTab(activeTab: string): {
  selectedTab: 'library' | 'corpus'
  selectTab: (key: string | null) => void
} {
  const location = useLocation()
  const history = useHistory()
  const selectedTab =
    (location.hash || `#${activeTab}`).toLowerCase() === '#corpus'
      ? 'corpus'
      : 'library'
  const selectTab = (key: string | null): void => {
    if (key && key !== selectedTab) {
      history.push({
        pathname: location.pathname,
        search: location.search,
        hash: `#${key}`,
      })
    }
  }
  return { selectedTab, selectTab }
}
