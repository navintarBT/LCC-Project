import {FC, useEffect, useState } from 'react'
import {ListViewProvider, useListView} from './core/ListViewProvider'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider} from './core/QueryResponseProvider'
import {UsersListHeader} from './components/header/UsersListHeader'
import {UsersTable} from './table/UsersTable'
import {UserEditModal} from './user-edit-modal/UserEditModal'
import {KTCard} from '../../../../../../_metronic/helpers'

type Props = {
  dataToChild?: any;
}

const UsersList: FC = () => {
  const {itemIdForUpdate} = useListView()
  const [getDataFromProp, setGetDataFromProp] = useState<any>();
  const [sendDataToParent, setSendDataToParent] = useState<any>()

  const getPropData = (data : any) => {
    setGetDataFromProp(data)
  }

  useEffect(() => {
    setSendDataToParent(getDataFromProp)
  }, [getDataFromProp])
  return (
    <>
      <KTCard>
        <UsersListHeader />
        <UsersTable dataToChild={sendDataToParent}/>
      </KTCard>
      {itemIdForUpdate !== undefined && <UserEditModal sendDataToParent={getPropData} />}
    </>
  )
}

const UsersListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <UsersList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {UsersListWrapper}
