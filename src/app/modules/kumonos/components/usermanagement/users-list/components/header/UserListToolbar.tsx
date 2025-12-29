import {KTIcon} from '../../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {UsersListFilter} from './UsersListFilter'
import { useAuth } from '../../../../../../../modules/auth/core/Auth'

const UsersListToolbar = () => {
  const {setItemIdForUpdate} = useListView();
  const { currentUser } = useAuth()  
  const openAddUserModal = () => {
    setItemIdForUpdate(null)
  }

  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      {currentUser?.role == 'administrator' && 
      <button type='button' className='btn btn-primary' onClick={openAddUserModal}>
        <KTIcon iconName='plus' className='fs-2' />
        Add User
      </button>
      }
      {/* end::Add user */}
    </div>
  )
}

export {UsersListToolbar}
