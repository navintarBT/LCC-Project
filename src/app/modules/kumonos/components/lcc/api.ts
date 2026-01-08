import axios from 'axios'

const BASE_URL = process.env.VITE_SERVER_URL
const LCC_API_URL = `${BASE_URL}/lcc`

export type LccFile = {
  id: string
  name: string
  link: string
  enablePassword?: boolean
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

export type LccFolder = {
  id: string
  name: string
  companyId: string
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
  files?: LccFile[]
}

export type LccCompany = {
  id: string
  name: string
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
  folders: LccFolder[]
}

export type LccFolderDetails = {
  folder: {
    id: string
    name: string
    createdBy?: string | null
    updatedBy?: string | null
  }
  company: {
    id: string
    name: string
    createdBy?: string | null
    updatedBy?: string | null
  } | null
  files: LccFile[]
}

type LccAuditPayload = {
  createdBy?: string
  updatedBy?: string
}

export const fetchLccTree = async (): Promise<LccCompany[]> => {
  const response = await axios.get<LccCompany[]>(`${LCC_API_URL}/tree`)
  return response.data
}

export const fetchFolderDetails = async (folderId: string): Promise<LccFolderDetails> => {
  const response = await axios.get<LccFolderDetails>(`${LCC_API_URL}/folders/${folderId}`)
  return response.data
}

export const createCompany = async (name: string, audit?: LccAuditPayload): Promise<LccCompany> => {
  const response = await axios.post<LccCompany>(`${LCC_API_URL}/companies`, {name, ...audit})
  return response.data
}

export const updateCompany = async (
  companyId: string,
  payload: {name: string} & LccAuditPayload
): Promise<LccCompany> => {
  const response = await axios.put<LccCompany>(`${LCC_API_URL}/companies/${companyId}`, payload)
  return response.data
}

export const createLccFolder = async (
  companyId: string,
  name: string,
  audit?: LccAuditPayload
): Promise<LccFolder> => {
  const response = await axios.post<LccFolder>(`${LCC_API_URL}/companies/${companyId}/folders`, {
    name,
    ...audit,
  })
  return response.data
}

export const updateLccFolder = async (
  folderId: string,
  payload: {name: string} & LccAuditPayload
): Promise<LccFolder> => {
  const response = await axios.put<LccFolder>(`${LCC_API_URL}/folders/${folderId}`, payload)
  return response.data
}

export const createLccFile = async (
  folderId: string,
  payload: {name: string; link: string; enablePassword?: boolean; password?: string} & LccAuditPayload
): Promise<LccFile> => {
  const response = await axios.post<LccFile>(`${LCC_API_URL}/folders/${folderId}/files`, payload)
  return response.data
}

export const updateLccFile = async (
  fileId: string,
  payload: {name?: string; link?: string; enablePassword?: boolean; password?: string} & LccAuditPayload
): Promise<LccFile> => {
  const response = await axios.put<LccFile>(`${LCC_API_URL}/files/${fileId}`, payload)
  return response.data
}

export const deleteLccFile = async (fileId: string): Promise<void> => {
  await axios.delete(`${LCC_API_URL}/files/${fileId}`)
}

export const fetchLccFile = async (fileId: string): Promise<LccFile> => {
  const response = await axios.get<LccFile>(`${LCC_API_URL}/lccData/${fileId}`)
  return response.data
}

export const checkLccPassword = async (
  fileId: string,
  password: string
): Promise<{success: boolean; message: string; token?: string}> => {
  const response = await axios.post<{success: boolean; message: string; token?: string}>(
    `${LCC_API_URL}/lccData/checkPassword/${fileId}`,
    {password}
  )
  return response.data
}

export const deleteCompany = async (companyId: string): Promise<void> => {
  await axios.delete(`${LCC_API_URL}/companies/${companyId}`)
}

export const deleteLccFolder = async (folderId: string): Promise<void> => {
  await axios.delete(`${LCC_API_URL}/folders/${folderId}`)
}
