/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import {FC} from 'react'
import {Routes, Route, BrowserRouter, Navigate} from 'react-router-dom'
import {PrivateRoutes} from './PrivateRoutes'
import {ErrorsPage} from '../modules/errors/ErrorsPage'
import {LccPasswordGate} from '../modules/kumonos/components/lcc/LccPasswordGate'
import {Logout, AuthPage, useAuth} from '../modules/auth'
import {App} from '../App'

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
// const {BASE_URL} = import.meta.env
// console.log("🚀 ~ BASE_URL:", BASE_URL)

function getBaseURL() {
  const url = window.location.pathname;
  const base = url.substring(0, url.indexOf('/', 1));
  return base;
}

const BASE_URL = getBaseURL();

const AppRoutes: FC = () => {
  const {currentUser} = useAuth()
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='logout' element={<Logout />} />
          {currentUser ? (
            <>
              <Route path='/*' element={<PrivateRoutes />} />
              <Route index element={<Navigate to='/kumonos/dashboard' />} />
            </>
          ) : (
            <>
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='*' element={<Navigate to='/auth' />} />
            </>
          )}
          <Route path='enterPassword/:id' element={<LccPasswordGate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export {AppRoutes}
