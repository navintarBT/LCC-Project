import React, {useEffect, useState} from 'react'
import {Navigate, Outlet, Route, Routes, useParams} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {UserManagement} from './components/usermanagement/UserManagement'
import {LccDashboard} from './components/lcc/LccDashboard'
import {LccDetails} from './components/lcc/LccDetails'
import {LccPasswordGate} from './components/lcc/LccPasswordGate'
import {fetchFolderDetails} from './components/lcc/api'

const KumonosBreadCrumbs: Array<PageLink> = [
  {
    title: 'Dashboard',
    path: '/kumonos/dashboard',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const KumonosPage: React.FC = () => {
  return (
    <Routes>
      <Route
        element={
          <>
            <Outlet />
          </>
        }
      >
        <Route
          index
          element={
            <Navigate to='dashboard' replace />
          }
        />
        <Route
          path='dashboard'
          element={
            <>
              <PageTitle breadcrumbs={KumonosBreadCrumbs}>Dashboard</PageTitle>
              <LccDashboard />
            </>
          }
        />
        <Route
          path='projects'
          element={
            <>
              <PageTitle breadcrumbs={KumonosBreadCrumbs}>LCC Data</PageTitle>
              <LccDetails />
            </>
          }
        />
        <Route
          path='user-management'
          element={
            <>
              <PageTitle breadcrumbs={KumonosBreadCrumbs}>User Management</PageTitle>
              <UserManagement />
            </>
          }
        />    
        <Route
          path='lcc-access/:fileId'
          element={
            <>
              <PageTitle breadcrumbs={KumonosBreadCrumbs}>LCC Access</PageTitle>
              <LccPasswordGate />
            </>
          }
        />
        <Route
          path=':companyId/:folderId'
          element={
            <>
              <LccDetailPage />
            </>
          }
        />
      </Route>
    </Routes>
  )
}

const LccDetailPage: React.FC = () => {
  const {companyId, folderId} = useParams<{companyId?: string; folderId?: string}>()
  const [companyName, setCompanyName] = useState('Company')
  const [projectName, setProjectName] = useState('Project')

  useEffect(() => {
    let ignore = false
    const loadNames = async () => {
      if (!folderId) return
      try {
        const details = await fetchFolderDetails(folderId)
        if (ignore) return
        setCompanyName(details.company?.name || 'Company')
        setProjectName(details.folder?.name || 'Project')
      } catch {
        if (ignore) return
        setCompanyName('Company')
        setProjectName('Project')
      }
    }
    loadNames()
    return () => {
      ignore = true
    }
  }, [folderId])

  const crumbs: Array<PageLink> = [
    {
      title: 'Dashboard',
      path: '/kumonos/dashboard',
      isSeparator: false,
      isActive: false,
    },
    {
      title: companyName,
      path: '/kumonos/projects',
      isSeparator: false,
      isActive: false,
    },
    {
      title: projectName,
      path: `/kumonos/${companyId}/${folderId}`,
      isSeparator: false,
      isActive: true,
    },
  ]

  return (
    <>
      <PageTitle breadcrumbs={crumbs}>LCC Detail</PageTitle>
      <LccDetails />
    </>
  )
}

export default KumonosPage
