import {useQuery} from 'react-query'
import {UserEditModalForm} from './UserEditModalForm'
import {isNotEmpty, QUERIES} from '../../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {getUserById} from '../core/_requests'
import {FC, useEffect, useState } from 'react'

type Props = {
  getDataUpdateFromModal: (data : any) => void
}

const UserEditModalFormWrapper: FC<Props> = ({ getDataUpdateFromModal }) => {
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()
  const enabledQuery: boolean = isNotEmpty(itemIdForUpdate)
  const [getDataUpdated, setGetDataUpdated] = useState()
  const {
    isLoading,
    data: user,
    error,
  } = useQuery(
    `${QUERIES.USERS_LIST}-user-${itemIdForUpdate}`,
    () => {
      return getUserById(itemIdForUpdate)
    },
    {
      cacheTime: 0,
      enabled: enabledQuery,
      onError: (err) => {
        setItemIdForUpdate(undefined)
        console.error(err)
      },
    }
  )

  const getUpdatedData = (data : any) => {
    setGetDataUpdated(data)
  } 

  useEffect(() => {
    getDataUpdateFromModal(getDataUpdated)
  }, [getDataUpdated])


  if (!itemIdForUpdate) {
    return <UserEditModalForm isUserLoading={isLoading} user={{_id: undefined}} haveBeenUpadtedData={getUpdatedData} />
  }

  if (!isLoading && !error && user) {
    return <UserEditModalForm isUserLoading={isLoading} user={user} haveBeenUpadtedData={getUpdatedData}/>
  }

  return null
}

export {UserEditModalFormWrapper}
