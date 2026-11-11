import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import ApiClient from '../../src/http/ApiClient'
import ApiMediaRepository from '../../src/fragmentarium/infrastructure/ApiMediaRepository'
import ApiMediaManagementRepository from '../../src/fragmentarium/infrastructure/ApiMediaManagementRepository'
import ApiMediaBinaryLoader from '../../src/fragmentarium/infrastructure/ApiMediaBinaryLoader'
import FragmentMediaGallery from '../../src/fragmentarium/ui/images/FragmentMediaGallery'
import type { Fragment } from '../../src/fragmentarium/domain/fragment'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const [role, setRole] = useState('contributor')
  const services = useMemo(() => {
    const api = new ApiClient(
      { isAuthenticated: () => true, getAccessToken: async () => role },
      { captureException: (error) => console.error(error) },
    )
    return {
      sessionKey: role,
      canUpload: role !== 'reader',
      canManage: role === 'manager',
      currentUserId: `auth0|${role}`,
      repository: new ApiMediaRepository(api, role !== 'reader'),
      binaryLoader: new ApiMediaBinaryLoader(api),
      ...(role !== 'reader'
        ? { management: new ApiMediaManagementRepository(api) }
        : {}),
    }
  }, [role])
  const fragment = {
    number: 'K.1',
    hasPhoto: false,
    museum: { copyright: 'Local test institution' },
  } as Fragment
  return (
    <main className="container py-3" style={{ maxWidth: 800 }}>
      <h1>Fragment K.1</h1>
      <label htmlFor="test-role">Local test identity</label>
      <select
        id="test-role"
        className="form-select mb-3"
        value={role}
        onChange={(event) => setRole(event.target.value)}
      >
        <option>contributor</option>
        <option>manager</option>
        <option>reader</option>
      </select>
      <FragmentMediaGallery
        key={role}
        fragment={fragment}
        services={services}
        fallback={<p>No images available.</p>}
      />
    </main>
  )
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
