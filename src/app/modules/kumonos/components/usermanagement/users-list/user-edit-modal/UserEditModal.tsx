import {FC, useEffect, useState} from 'react'
import {UserEditModalHeader} from './UserEditModalHeader'
import {UserEditModalFormWrapper} from './UserEditModalFormWrapper'

type Props = {
  sendDataToParent: (data : any) => void
}

const UserEditModal: FC<Props> = ({ sendDataToParent }) => {
  const [getData, setGetData] = useState()
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  const getDataFromModal = (data: any) => {
    setGetData(data)
  }

  useEffect(() => {
    sendDataToParent(getData)
  }, [getData])

  return (
    <>
      <div
        className='modal fade show d-block'
        id='kt_modal_add_user'
        role='dialog'
        tabIndex={-10}
        aria-modal='true'
      >
        {/* begin::Modal dialog */}
        <div className='modal-dialog modal-dialog-centered mw-650px'>
          {/* begin::Modal content */}
          <div className='modal-content'>
            <UserEditModalHeader />
            {/* begin::Modal body */}
            <div className='modal-body mx-5 mx-xl-15 my-7'>
              <UserEditModalFormWrapper getDataUpdateFromModal={getDataFromModal}/>
            </div>
            {/* end::Modal body */}
          </div>
          {/* end::Modal content */}
        </div>
        {/* end::Modal dialog */}
      </div>
      {/* begin::Modal Backdrop */}
      <div className='modal-backdrop fade show'></div>
      {/* end::Modal Backdrop */}
    </>
  )
}

export {UserEditModal}
