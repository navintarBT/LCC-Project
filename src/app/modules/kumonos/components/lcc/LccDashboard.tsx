import React, {useCallback, useEffect, useState} from 'react'
import {fetchLccTree} from './api'
import {LCC_FILES_CHANGED_EVENT, LCC_TREE_CHANGED_EVENT} from './events'
import './lcc-details.css'

type StatsState = {
  companies: number
  titles: number
  files: number
  loading: boolean
  error: string | null
}

const LccDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsState>({
    companies: 0,
    titles: 0,
    files: 0,
    loading: true,
    error: null,
  })

  const loadStats = useCallback(async () => {
    setStats((prev) => ({...prev, loading: true, error: null}))
    try {
      const tree = await fetchLccTree()
      const companies = tree.length
      const titles = tree.reduce((acc, c) => acc + c.folders.length, 0)
      const files = tree.reduce(
        (acc, c) =>
          acc + c.folders.reduce((fAcc, f) => fAcc + (f.files ? f.files.length : 0), 0),
        0
      )
      setStats({companies, titles, files, loading: false, error: null})
    } catch (err) {
      console.error('Unable to load LCC stats', err)
      setStats({companies: 0, titles: 0, files: 0, loading: false, error: 'Unable to load stats'})
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleTreeChanged = () => {
      loadStats()
    }
    const handleFilesChanged = () => {
      loadStats()
    }
    window.addEventListener(LCC_TREE_CHANGED_EVENT, handleTreeChanged)
    window.addEventListener(LCC_FILES_CHANGED_EVENT, handleFilesChanged)
    return () => {
      window.removeEventListener(LCC_TREE_CHANGED_EVENT, handleTreeChanged)
      window.removeEventListener(LCC_FILES_CHANGED_EVENT, handleFilesChanged)
    }
  }, [loadStats])

  return (
    <div className='card'>
      <div className='card-body'>
        {stats.error && (
          <div className='alert alert-danger d-flex align-items-center mb-6'>
            <span className='svg-icon svg-icon-2hx svg-icon-danger me-4'>
              <i className='bi bi-exclamation-triangle'></i>
            </span>
            <div>
              <h4 className='mb-1 text-danger'>Error</h4>
              <div className='text-gray-700'>{stats.error}</div>
            </div>
          </div>
        )}

        <div className='lcc-home'>
          <div className='lcc-home__body'>
            <div className='lcc-home__header'>
              <div className='d-flex align-items-center gap-3'>
                <div className='lcc-home__icon'>
                  <i className='bi bi-diagram-3-fill'></i>
                </div>
                <div>
                  <div className='fs-2 fw-bold'>LCC Home</div>
                  <div className='text-muted small'>Overview of companies, projects, and files.</div>
                </div>
              </div>
            </div>

            <div className='lcc-home__stats'>
              <div className='lcc-home__stat'>
                <div className='lcc-home__stat-icon'>
                  <i className='bi bi-buildings'></i>
                </div>
                <div>
                  <div className='lcc-home__stat-label'>Companies</div>
                  <div className='lcc-home__stat-value'>
                    {stats.loading ? 'Loading...' : stats.companies.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className='lcc-home__stat'>
                <div className='lcc-home__stat-icon'>
                  <i className='bi bi-folder2-open'></i>
                </div>
                <div>
                  <div className='lcc-home__stat-label'>LCC Projects</div>
                  <div className='lcc-home__stat-value'>
                    {stats.loading ? 'Loading...' : stats.titles.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className='lcc-home__stat'>
                <div className='lcc-home__stat-icon'>
                  <i className='bi bi-file-earmark-binary'></i>
                </div>
                <div>
                  <div className='lcc-home__stat-label'>LCC Files</div>
                  <div className='lcc-home__stat-value'>
                    {stats.loading ? 'Loading...' : stats.files.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {LccDashboard}
