import {FC, useContext, useState, useEffect, useMemo} from 'react'
import {useQuery} from 'react-query'
import {
  createResponseContext,
  initialQueryResponse,
  initialQueryState,
  PaginationState,
  QUERIES,
  stringifyRequestQuery,
  WithChildren,
} from '../../../../../../../_metronic/helpers'
import {getUsers} from './_requests'
import {User} from './_models'
import {useAuth} from '../../../../../auth'
import {useQueryRequest} from './QueryRequestProvider'

import {defaultUserInfos} from "../../../../../../../_metronic/helpers"

const infos = defaultUserInfos;

const QueryResponseContext = createResponseContext<User>(initialQueryResponse)

const QueryResponseProvider: FC<WithChildren> = ({children}) => {
  
  const {state} = useQueryRequest()
  const [query, setQuery] = useState<string>(stringifyRequestQuery(state))
  const updatedQuery = useMemo(() => stringifyRequestQuery(state), [state])
  
  useEffect(() => {
    if (query !== updatedQuery) {
      setQuery(updatedQuery)
    }
  }, [updatedQuery])
  
  const { isFetching, refetch, data: response, } = useQuery(    
    `${QUERIES.USERS_LIST}-${query}`,
    () => {
      return getUsers(query)
    },
    {cacheTime: 0, keepPreviousData: true, refetchOnWindowFocus: false}
  )
  
  return (
    <QueryResponseContext.Provider value={{isLoading: isFetching, refetch, response, query}}>
      {children}
    </QueryResponseContext.Provider>
  )
}

const useQueryResponse = () => useContext(QueryResponseContext)

const useQueryResponseData = () => {
  const {response} = useQueryResponse()
  const {currentUser} = useAuth()
  
  if (!response) {
    return []
  }

  const data = response?.data || []
  if (currentUser?.role === 'normal_user' && currentUser?._id) {
    const userId = String(currentUser._id)
    return data.filter((user) => String(user._id) === userId)
  }
  return data
}


const useQueryResponsePagination = () => {
  const defaultPaginationState: PaginationState = {
    links: [],
    ...initialQueryState,
  }

  const {response} = useQueryResponse()
  if (!response || !response.payload || !response.payload.pagination) {
    return defaultPaginationState
  }

  return response.payload.pagination
}

const useQueryResponseLoading = (): boolean => {
  const {isLoading} = useQueryResponse()
  return isLoading
}

export {
  QueryResponseProvider,
  useQueryResponse,
  useQueryResponseData,
  useQueryResponsePagination,
  useQueryResponseLoading,
}
