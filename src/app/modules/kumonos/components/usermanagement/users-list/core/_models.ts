import {ID, Response} from '../../../../../../../_metronic/helpers'
export type User = {
  _id?: ID
  username?: string
  first_name?: string
  avatar?: string
  email?: string
  position?: string
  role?: string
  last_login?: string
  createdBy?: ID | null
  updatedBy?: ID | null
  createdAt?: string
  updatedAt?: string
  two_steps?: boolean
  joined_day?: string
  online?: boolean
  initials?: {
    label: string
    state: string
  }
  last_name?: string
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  avatar: 'avatars/300-6.jpg',
  position: 'Art Director',
  role: 'Administrator',
  username: '',
  email: '',
}
