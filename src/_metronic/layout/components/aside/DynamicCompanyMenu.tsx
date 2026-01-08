import {FC, MouseEvent, useCallback, useEffect, useMemo, useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import axios from 'axios'
import {AsideMenuItemWithSub} from './AsideMenuItemWithSub'
import {AsideMenuItem} from './AsideMenuItem'
import {useAuth} from '../../../../app/modules/auth'
import {
  LccCompany,
  createCompany,
  createLccFile,
  createLccFolder,
  deleteCompany,
  deleteLccFolder,
  fetchLccTree,
} from '../../../../app/modules/kumonos/components/lcc/api'
import {
  LCC_FILES_CHANGED_EVENT,
  LCC_OPEN_ADD_DATA_EVENT,
  LCC_TREE_CHANGED_EVENT,
} from '../../../../app/modules/kumonos/components/lcc/events'
import Swal from 'sweetalert2'

type OpenState = {companyId?: string | null}
type ActiveState = {companyId: string; folderId: string; path: string}

type ContextMenuBase = {x: number; y: number}
type ContextMenuState =
  | ({type: 'root'} & ContextMenuBase)
  | ({type: 'company'; companyId: string; companyName: string} & ContextMenuBase)
  | ({
      type: 'folder'
      companyId: string
      companyName: string
      folderId: string
      folderName: string
    } & ContextMenuBase)

type CreationMode =
  | {type: 'company'}
  | {type: 'folder'; companyId: string; companyName: string}
  | {type: 'file'; folderId: string; folderName: string}

const LS_OPEN_KEY = 'aside.dynamic.open'
const LS_ACTIVE_KEY = 'aside.dynamic.active'
const LS_OPEN_ADD_DATA_KEY = 'lcc.open-add-data'
const defaultOpenState: OpenState = {companyId: null}

const readJSON = <T,>(k: string): T | null => {
  try {
    const raw = localStorage.getItem(k)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const writeJSON = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    // ignore
  }
}

const removeItem = (k: string) => {
  try {
    localStorage.removeItem(k)
  } catch {
    // ignore
  }
}

const buildLeafPath = (companyId: string, folderId: string) =>
  `/kumonos/${encodeURIComponent(companyId)}/${encodeURIComponent(folderId)}`

const generatePassword = (len: number) => {
  const digits = '0123456789'
  let out = ''
  for (let i = 0; i < len; i += 1) {
    out += digits[Math.floor(Math.random() * digits.length)]
  }
  return out
}

const DynamicCompanyMenu: FC = () => {
  const {pathname} = useLocation()
  const navigate = useNavigate()
  const {currentUser} = useAuth()
  const userId = currentUser?._id ? String(currentUser._id) : undefined

  const [open, setOpen] = useState<OpenState>(() => readJSON<OpenState>(LS_OPEN_KEY) ?? defaultOpenState)
  const [companies, setCompanies] = useState<LccCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [creationModal, setCreationModal] = useState<{
    mode: CreationMode | null
    name: string
    saving: boolean
    selectedFolder: string | null
    uploadFiles: File[]
    uploadStatus: string
    uploadProgress: number
    enablePassword: boolean
    password: string
    confirmPassword: string
  }>({
    mode: null,
    name: '',
    saving: false,
    selectedFolder: null,
    uploadFiles: [],
    uploadStatus: '',
    uploadProgress: 0,
    enablePassword: false,
    password: '',
    confirmPassword: '',
  })
  const shouldShowProjectList = (path: string) =>
    path === '/kumonos/projects' || /^\/kumonos\/[^/]+\/[^/]+/.test(path)
  const [showProjectList, setShowProjectList] = useState(() => shouldShowProjectList(pathname))
  // Force upload base to localhost:9000 as requested
  const UPLOAD_API_BASE = 'http://localhost:9000'
  const duplicateMessages = new Set([
    'Company name already exists',
    'LCC title name already exists in this company',
    'LCC file name already exists in this title',
  ])

  const fetchHierarchy = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLccTree()
      setCompanies(data)
    } catch (err) {
      console.error('Unable to load company hierarchy', err)
      setError('Unable to load sidebar data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const active = readJSON<Record<string, unknown>>(LS_ACTIVE_KEY)
    if (active && 'projectId' in active) {
      removeItem(LS_ACTIVE_KEY)
    }
    const openState = readJSON<Record<string, unknown>>(LS_OPEN_KEY)
    if (openState && 'projectId' in openState) {
      removeItem(LS_OPEN_KEY)
      setOpen(defaultOpenState)
    }
    if (!openState) {
      setOpen(defaultOpenState)
    }
  }, [])

  useEffect(() => {
    fetchHierarchy()
  }, [fetchHierarchy])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleTreeChanged = () => {
      fetchHierarchy()
    }
    window.addEventListener(LCC_TREE_CHANGED_EVENT, handleTreeChanged)
    return () => {
      window.removeEventListener(LCC_TREE_CHANGED_EVENT, handleTreeChanged)
    }
  }, [fetchHierarchy])

  useEffect(() => {
    setShowProjectList(shouldShowProjectList(pathname))
  }, [pathname])

  const confirmDelete = useCallback(
    async (title: string, text: string, confirmButtonText = 'Delete'): Promise<boolean> => {
      const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText,
        cancelButtonText: 'Cancel',
        focusCancel: true,
      })
      return result.isConfirmed
    },
    []
  )

  const clearSelectionAfterDelete = useCallback((params: {companyId?: string; folderId?: string}) => {
    setOpen((prev) => {
      let next = prev
      if (params.companyId && prev.companyId === params.companyId) {
        next = {companyId: null}
      }

      if (next !== prev) {
        writeJSON(LS_OPEN_KEY, next)
        return next
      }

      return prev
    })

    const active = readJSON<ActiveState>(LS_ACTIVE_KEY)
    if (
      active &&
      ((params.companyId && active.companyId === params.companyId) ||
        (params.folderId && active.folderId === params.folderId))
    ) {
      removeItem(LS_ACTIVE_KEY)
    }
  }, [])

  const onToggleCompany = useCallback((companyId: string) => {
    setOpen((prev) => {
      const nextCompany = prev.companyId === companyId ? null : companyId
      const next: OpenState = {companyId: nextCompany}
      writeJSON(LS_OPEN_KEY, next)
      return next
    })
  }, [])

  const onFolderClick = useCallback((companyId: string, folderId: string) => {
    const targetPath = buildLeafPath(companyId, folderId)
    const active: ActiveState = {companyId, folderId, path: targetPath}
    writeJSON(LS_ACTIVE_KEY, active)
    const nextOpen = {companyId}
    setOpen(nextOpen)
    writeJSON(LS_OPEN_KEY, nextOpen)
  }, [])

  useEffect(() => {
    const active = readJSON<ActiveState>(LS_ACTIVE_KEY)
    if (!active) return
    const next = {companyId: active.companyId}
    setOpen(next)
    writeJSON(LS_OPEN_KEY, next)
  }, [])

  useEffect(() => {
    if (!companies.length) return
    for (const company of companies) {
      for (const folder of company.folders) {
        const targetPath = buildLeafPath(company.id, folder.id)
        if (pathname.startsWith(targetPath)) {
          const next = {companyId: company.id}
          setOpen(next)
          writeJSON(LS_OPEN_KEY, next)
          writeJSON(LS_ACTIVE_KEY, {companyId: company.id, folderId: folder.id, path: targetPath})
          return
        }
      }
    }
  }, [pathname, companies])

  useEffect(() => {
    const closeMenu = () => setContextMenu(null)
    document.addEventListener('click', closeMenu)
    window.addEventListener('scroll', closeMenu, true)
    return () => {
      document.removeEventListener('click', closeMenu)
      window.removeEventListener('scroll', closeMenu, true)
    }
  }, [])

  const openCreation = useCallback((mode: CreationMode) => {
    setCreationModal({
      mode,
      name: '',
      saving: false,
      selectedFolder: null,
      uploadFiles: [],
      uploadStatus: '',
      uploadProgress: 0,
      enablePassword: false,
      password: '',
      confirmPassword: '',
    })
    setContextMenu(null)
  }, [])

  const openAddData = useCallback(
    (companyId: string, folderId: string, folderName: string) => {
      const targetPath = buildLeafPath(companyId, folderId)
      const active: ActiveState = {companyId, folderId, path: targetPath}
      writeJSON(LS_ACTIVE_KEY, active)
      const nextOpen = {companyId}
      setOpen(nextOpen)
      writeJSON(LS_OPEN_KEY, nextOpen)
      setShowProjectList(true)
      localStorage.setItem(LS_OPEN_ADD_DATA_KEY, folderId)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(LCC_OPEN_ADD_DATA_EVENT, {detail: {folderId, folderName}})
        )
      }
      navigate(targetPath)
    },
    [navigate]
  )

  const handleRootContextMenu = useCallback(
    (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('.menu-item') || target?.closest('.lcc-context-menu')) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      openCreation({type: 'company'})
    },
    [openCreation]
  )

  const handleContextMenu = (
    event: MouseEvent,
    nextMenu:
      | {type: 'root'}
      | {type: 'company'; companyId: string; companyName: string}
      | {
          type: 'folder'
          companyId: string
          companyName: string
          folderId: string
          folderName: string
        }
  ) => {
    event.preventDefault()
    event.stopPropagation()
    if (nextMenu.type === 'root') {
      openCreation({type: 'company'})
      return
    }
    setContextMenu({
      ...nextMenu,
      x: event.clientX,
      y: event.clientY,
    } as ContextMenuState)
  }

  useEffect(() => {
    const container = document.getElementById('kt_aside_menu_wrapper')
    if (!container) return
    container.addEventListener('contextmenu', handleRootContextMenu)
    return () => {
      container.removeEventListener('contextmenu', handleRootContextMenu)
    }
  }, [handleRootContextMenu])

  const closeCreationModal = () =>
    setCreationModal({
      mode: null,
      name: '',
      saving: false,
      selectedFolder: null,
      uploadFiles: [],
      uploadStatus: '',
      uploadProgress: 0,
      enablePassword: false,
      password: '',
      confirmPassword: '',
    })

  const creationTitle = useMemo(() => {
    switch (creationModal.mode?.type) {
      case 'company':
        return 'Create company'
      case 'folder':
        return `Create LCC project`
      case 'file':
        return `Add LCC data `
      default:
        return ''
    }
  }, [creationModal.mode])

  const isFileMode = creationModal.mode?.type === 'file'
  const canSubmit =
    creationModal.name.trim().length > 0 &&
    (!isFileMode || creationModal.uploadFiles.length > 0)
  const passwordValue = creationModal.password.trim()
  const confirmValue = creationModal.confirmPassword.trim()
  const passwordTooShort = creationModal.enablePassword && passwordValue.length > 0 && passwordValue.length < 8
  const passwordMissing = creationModal.enablePassword && passwordValue.length === 0
  const confirmMissing = creationModal.enablePassword && confirmValue.length === 0
  const confirmMismatch =
    creationModal.enablePassword && confirmValue.length > 0 && passwordValue !== confirmValue

  const submitCreation = async () => {
    if (!creationModal.mode) return
    setCreationModal((prev) => ({...prev, saving: true}))

    try {
      const trimmedName = creationModal.name.trim()
      if (creationModal.mode.type === 'company') {
        await createCompany(trimmedName, userId ? {createdBy: userId, updatedBy: userId} : undefined)
      } else if (creationModal.mode.type === 'folder') {
        const createdFolder = await createLccFolder(
          creationModal.mode.companyId,
          trimmedName,
          userId ? {createdBy: userId, updatedBy: userId} : undefined
        )
        const targetPath = buildLeafPath(creationModal.mode.companyId, createdFolder.id)
        const active: ActiveState = {
          companyId: creationModal.mode.companyId,
          folderId: createdFolder.id,
          path: targetPath,
        }
        writeJSON(LS_ACTIVE_KEY, active)
        const nextOpen = {companyId: creationModal.mode.companyId}
        setOpen(nextOpen)
        writeJSON(LS_OPEN_KEY, nextOpen)
        navigate(targetPath)
      } else if (creationModal.mode.type === 'file') {
        const folderId = creationModal.mode.folderId
        const folderName = creationModal.mode.folderName
        const company = companies.find((c) => c.folders.some((f) => f.id === folderId))
        if (!company) throw new Error('Company not found for folder')
        if (creationModal.uploadFiles.length === 0) {
          setCreationModal((prev) => ({...prev, saving: false, uploadStatus: 'Please choose a zip file to upload'}))
          return
        }
        if (creationModal.enablePassword) {
          const pwd = creationModal.password.trim()
          if (!pwd) {
            setCreationModal((prev) => ({
              ...prev,
              saving: false,
              uploadStatus: 'error: Password is required',
            }))
            return
          }
          if (pwd.length < 8) {
            setCreationModal((prev) => ({
              ...prev,
              saving: false,
              uploadStatus: 'error: Password must be at least 8 characters',
            }))
            return
          }
          if (pwd !== creationModal.confirmPassword.trim()) {
            setCreationModal((prev) => ({
              ...prev,
              saving: false,
              uploadStatus: 'error: Passwords do not match',
            }))
            return
          }
        }

        const formData = new FormData()
        formData.append('companyName', company.name || 'company_default')
        formData.append('projectName', folderName || 'project_default')
        formData.append('titleName', trimmedName || folderName || 'title_default')
        // ✅ ใส่ folderId ก่อน
        formData.append('folderId', folderId)

        // ✅ แล้วค่อย file
        formData.append('file', creationModal.uploadFiles[0])

        const uploadRes = await axios.post(`${UPLOAD_API_BASE}/upload`, formData, {
          headers: {'Content-Type': 'multipart/form-data'},
          onUploadProgress: (event) => {
            if (!event.total) return
            const percent = Math.round((event.loaded * 100) / event.total)
            setCreationModal((prev) => ({...prev, uploadProgress: percent}))
          },
        })

        const folderUrl: string | undefined = uploadRes.data?.folderUrl
        const entryFile: string | undefined = uploadRes.data?.entryFile

        if (!folderUrl || !entryFile) {
          setCreationModal((prev) => ({
            ...prev,
            saving: false,
            uploadStatus: 'error: Zip does not contain any .lcc files',
          }))
          return
        }

        const friendlyName =
          creationModal.name.trim() ||
          entryFile.split('/').pop() ||
          'file.lcc'
        await createLccFile(folderId, {
          name: friendlyName,
          link: `${UPLOAD_API_BASE}${folderUrl}/${entryFile}`,
          enablePassword: creationModal.enablePassword,
          password: creationModal.enablePassword ? creationModal.password.trim() : undefined,
          ...(userId ? {createdBy: userId, updatedBy: userId} : {}),
        })

        setCreationModal((prev) => ({...prev, uploadStatus: 'Uploaded successfully', uploadProgress: 100}))
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent<{folderId: string}>(LCC_FILES_CHANGED_EVENT, {
              detail: {folderId},
            })
          )
        }
        const targetPath = buildLeafPath(company.id, folderId)
        const active: ActiveState = {companyId: company.id, folderId, path: targetPath}
        writeJSON(LS_ACTIVE_KEY, active)
        const nextOpen = {companyId: company.id}
        setOpen(nextOpen)
        writeJSON(LS_OPEN_KEY, nextOpen)
        if (!pathname.startsWith(targetPath)) {
          navigate(targetPath)
        }
      }
      closeCreationModal()
      await fetchHierarchy()
    } catch (err) {
      const message = (err as any)?.response?.data?.message
      if (message && duplicateMessages.has(message)) {
        Swal.fire({icon: 'error', title: 'Duplicate name', text: message})
        closeCreationModal()
      }
      console.error('Unable to create entity', err)
      setCreationModal((prev) => ({...prev, saving: false}))
    }
  }

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    const confirmed = await confirmDelete(
      'Delete company?',
      `Delete company "${companyName}"? All nested LCC projects and files will be removed.`
    )
    if (!confirmed) return
    setContextMenu(null)
    setLoading(true)
    setError(null)
    try {
      await deleteCompany(companyId)
      clearSelectionAfterDelete({companyId})
      await fetchHierarchy()
    } catch (err) {
      console.error('Unable to delete company', err)
      setError('Unable to delete company.')
      setLoading(false)
    }
  }

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    const confirmed = await confirmDelete(
      'Delete LCC project?',
      `Delete LCC project "${folderName}"? All files inside will be removed.`
    )
    if (!confirmed) return
    setContextMenu(null)
    setLoading(true)
    setError(null)
    try {
      await deleteLccFolder(folderId)
      clearSelectionAfterDelete({folderId})
      await fetchHierarchy()
    } catch (err) {
      console.error('Unable to delete folder', err)
      setError('Unable to delete LCC project.')
      setLoading(false)
    }
  }
  const renderContextMenu = () => {
    if (!contextMenu) return null

    const actions: Array<{label: string; onSelect: () => void}> = []

    if (contextMenu.type === 'root') {
      actions.push({
        label: 'Create company',
        onSelect: () => openCreation({type: 'company'}),
      })
    } else if (contextMenu.type === 'company') {
      actions.push({
        label: 'Create project',
        onSelect: () =>
          openCreation({
            type: 'folder',
            companyName: contextMenu.companyName,
            companyId: contextMenu.companyId,
          }),
      })
      actions.push({
        label: 'Delete company',
        onSelect: () => handleDeleteCompany(contextMenu.companyId, contextMenu.companyName),
      })
    } else if (contextMenu.type === 'folder') {
      actions.push({
        label: 'Create LCC data',
        onSelect: () => openAddData(contextMenu.companyId, contextMenu.folderId, contextMenu.folderName),
      })
      actions.push({
        label: 'Delete project',
        onSelect: () => handleDeleteFolder(contextMenu.folderId, contextMenu.folderName),
      })
    }

    return (
      <div
        className='lcc-context-menu'
        style={{top: contextMenu.y, left: contextMenu.x}}
        onClick={(event) => event.stopPropagation()}
      >
        {actions.map((action) => (
          <button
            type='button'
            className='lcc-context-menu__item'
            key={action.label}
            onClick={action.onSelect}
            title={action.label}
            aria-label={action.label}
          >
            {action.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
      <div
        className='lcc-tree-root'
        style={{minHeight: '100%'}}
        onContextMenu={(event) => handleContextMenu(event, {type: 'root'})}
      >
        <div className='lcc-tree-wrapper' onContextMenu={(event) => handleContextMenu(event, {type: 'root'})}>
          <div className='lcc-tree-header' onContextMenu={(event) => handleContextMenu(event, {type: 'root'})}>
          {!showProjectList ? (
            <>
              <button
                type='button'
                className='lcc-user-card lcc-project-card w-100 mt-3 text-start'
                onClick={() => {
                  setShowProjectList(false)
                  navigate('/kumonos/dashboard')
                }}
              >
                <div className='d-flex align-items-center flex-grow-1 gap-3'>
                  <div className='lcc-user-card__icon'>
                    <i className='bi bi-speedometer2'></i>
                  </div>
                  <div>
                    <div className='fw-semibold'>Dashboard</div>
                    <div className='text-muted small'>Overview and stats</div>
                  </div>
                </div>
              </button>

              <button
                type='button'
                className='lcc-user-card lcc-project-card w-100 mt-3 text-start'
                onClick={() => {
                  setShowProjectList(true)
                  removeItem(LS_ACTIVE_KEY)
                  navigate('/kumonos/projects')
                }}
              >
                <div className='d-flex align-items-center flex-grow-1 gap-3'>
                  <div className='lcc-user-card__icon'>
                    <i className='bi bi-diagram-3'></i>
                  </div>
                  <div>
                    <div className='fw-semibold'>Project List</div>
                    <div className='text-muted small'>Companies and LCC projects</div>
                  </div>
                </div>
              </button>

              <Link to='/kumonos/user-management' className='lcc-user-card mt-3'>
                <div className='lcc-user-card__icon'>
                  <i className='bi bi-people'></i>
                </div>
                <div>
                  <div className='fw-semibold'>User Management</div>
                  <div className='text-muted small'>Administer users and roles</div>
                </div>
              </Link>
            </>
          ) : (
              <div className='d-flex flex-column gap-3'>
                <button
                  type='button'
                  className='btn btn-sm btn-primary w-100'
                  onClick={() => openCreation({type: 'company'})}
                >
                  + Create company
                </button>
              </div>
          )}
        </div>

          {showProjectList && (
            <div className='lcc-project-list' onContextMenu={(event) => handleContextMenu(event, {type: 'root'})}>
            {error && <div className='text-danger small mb-4'>{error}</div>}

            {loading && (
              <div className='text-center text-muted small py-4'>
                <div className='spinner-border spinner-border-sm text-primary me-2' role='status' />
                Loading companies...
              </div>
            )}

            {!loading && !companies.length && !error && (
              <div className='text-muted small py-4'>No companies yet. Right-click to create the first one.</div>
            )}

            {!loading &&
              companies.map((company) => (
                <AsideMenuItemWithSub
                  key={company.id}
                  to={`/companies/${company.id}`}
                  title={company.name}
                  icon={'briefcase'}
                  isOpen={open.companyId === company.id}
                  onClick={() => onToggleCompany(company.id)}
                  actions={
                    <>
                      <button
                        type='button'
                        className='btn btn-icon btn-sm lcc-inline-action'
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          openCreation({
                            type: 'folder',
                            companyName: company.name,
                            companyId: company.id,
                          })
                        }}
                        title='Create project'
                        aria-label='Create project'
                      >
                        <i className='bi bi-plus-lg'></i>
                      </button>
                      <button
                        type='button'
                        className='btn btn-icon btn-sm lcc-inline-action lcc-inline-action--danger'
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          handleDeleteCompany(company.id, company.name)
                        }}
                        title='Delete company'
                        aria-label='Delete company'
                      >
                        <i className='bi bi-trash'></i>
                      </button>
                    </>
                  }
                  onContextMenu={(event) =>
                    handleContextMenu(event, {type: 'company', companyId: company.id, companyName: company.name})
                  }
                >
                  {company.folders.map((folder) => {
                    const targetPath = buildLeafPath(company.id, folder.id)
                    return (
                      <AsideMenuItem
                        key={folder.id}
                        to={targetPath}
                        title={folder.name}
                        icon={'element-6'}
                        onClick={() => onFolderClick(company.id, folder.id)}
                        actions={
                          <button
                            type='button'
                            className='btn btn-icon btn-sm lcc-inline-action lcc-inline-action--danger'
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              handleDeleteFolder(folder.id, folder.name)
                            }}
                            title='Delete project'
                            aria-label='Delete project'
                          >
                            <i className='bi bi-trash'></i>
                          </button>
                        }
                        onContextMenu={(event) =>
                          handleContextMenu(event, {
                            type: 'folder',
                            companyId: company.id,
                            companyName: company.name,
                            folderId: folder.id,
                            folderName: folder.name,
                          })
                        }
                      />
                    )
                  })}
                </AsideMenuItemWithSub>
              ))}
            </div>
          )}
        </div>
      </div>

      {renderContextMenu()}

      <Modal show={Boolean(creationModal.mode)} onHide={closeCreationModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{creationTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='mb-5'>
            <label className='form-label required'>Title Name</label>
            <input
              type='text'
              className='form-control'
              value={creationModal.name}
              onChange={(event) => setCreationModal((prev) => ({...prev, name: event.target.value}))}
              placeholder='Enter name'
            />
          </div>

          {isFileMode && (
            <div>
              <div className='form-check form-switch mb-3'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='lcc-create-enable-password'
                  checked={creationModal.enablePassword}
                  onChange={(event) => {
                    const nextEnabled = event.target.checked
                    const nextPwd = nextEnabled ? generatePassword(8) : ''
                    setCreationModal((prev) => ({
                      ...prev,
                      enablePassword: nextEnabled,
                      password: nextPwd,
                      confirmPassword: nextPwd,
                      uploadStatus: '',
                    }))
                  }}
                />
                <label className='form-check-label' htmlFor='lcc-create-enable-password'>
                  Enable password
                </label>
              </div>
              {creationModal.enablePassword && (
                <div className='mb-4'>
                  <label className='form-label required'>Password</label>
                  <input
                    type='password'
                    className={`form-control mb-3 ${
                      passwordMissing || passwordTooShort ? 'is-invalid' : ''
                    }`}
                    value={creationModal.password}
                    onChange={(event) => setCreationModal((prev) => ({...prev, password: event.target.value}))}
                    placeholder='Enter password'
                  />
                  <label className='form-label required'>Confirm password</label>
                  <input
                    type='password'
                    className={`form-control ${
                      confirmMissing || confirmMismatch ? 'is-invalid' : ''
                    }`}
                    value={creationModal.confirmPassword}
                    onChange={(event) => setCreationModal((prev) => ({...prev, confirmPassword: event.target.value}))}
                    placeholder='Confirm password'
                  />
                </div>
              )}
              <label className='form-label'>Upload zip</label>
              <div className='d-flex align-items-center gap-3 mb-2'>
                <Button variant='primary' size='sm' onClick={() => document.getElementById('lcc-create-folder-picker')?.click()}>
                  Upload zip
                </Button>
                <span className='text-muted small'>
                  {creationModal.selectedFolder ? creationModal.selectedFolder : 'No zip selected'}
                </span>
              </div>
              <input
                id='lcc-create-folder-picker'
                type='file'
                style={{display: 'none'}}
                accept='.zip'
                onChange={(event) => {
                  const fileList = event.target.files ? Array.from(event.target.files) : []
                  const zipName = fileList[0]?.name || ''
                  setCreationModal((prev) => ({
                    ...prev,
                    selectedFolder: zipName || null,
                    uploadFiles: fileList.length ? [fileList[0]] : [],
                    uploadStatus: fileList.length ? `${fileList[0].name} selected` : 'No files selected',
                    uploadProgress: 0,
                    // prefill only if empty; keep user-typed name
                    name: prev.name || zipName,
                  }))
                }}
              />
              {creationModal.uploadStatus && (
                <div
                  className={
                    creationModal.uploadStatus.startsWith('error:') ? 'form-text text-danger' : 'form-text'
                  }
                >
                  {creationModal.uploadStatus.replace(/^error:\s*/i, '')}
                </div>
              )}
              {creationModal.uploadProgress > 0 && (
                <div className='progress mt-2' style={{height: 6}}>
                  <div
                    className='progress-bar bg-primary'
                    role='progressbar'
                    style={{width: `${creationModal.uploadProgress}%`}}
                    aria-valuenow={creationModal.uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              )}
              {creationModal.uploadFiles.length > 0 && (
                <div className='mt-3'>
                  <div className='fw-semibold small mb-1'>Files to upload</div>
                  <ul className='mb-0 ps-3 small text-muted'>
                    {creationModal.uploadFiles.slice(0, 5).map((file) => (
                      <li key={file.name}>{file.name}</li>
                    ))}
                    {creationModal.uploadFiles.length > 5 && (
                      <li>+{creationModal.uploadFiles.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='light' onClick={closeCreationModal} disabled={creationModal.saving}>
            Cancel
          </Button>
          <Button variant='primary' onClick={submitCreation} disabled={creationModal.saving || !canSubmit}>
            {creationModal.saving ? 'Saving...' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export {DynamicCompanyMenu}

