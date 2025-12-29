import {FC, useEffect, useMemo, useState} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
import {CustomHeaderColumn} from './columns/CustomHeaderColumn'
import {CustomRow} from './columns/CustomRow'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {usersColumns} from './columns/_columns'
import {User} from '../core/_models'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {UsersListPagination} from '../components/pagination/UsersListPagination'
import {KTCard, KTCardBody} from '../../../../../../../_metronic/helpers'

type Props = {
  dataToChild?: any;
}

const UsersTable: FC<Props> = ({ dataToChild }) => {

const users = useQueryResponseData();
// const users = dataToChild ? dataToChild : useQueryResponseData();

  // useMemo for constant values
const data = useMemo(() => users, [users]);
const columns = useMemo(() => usersColumns, []);

// Other hooks
const isLoading = useQueryResponseLoading();

const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
  columns,
  data,
});

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive' style={{ height : "68vh"}}>
        <table id='kt_table_users' className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer' {...getTableProps()}>
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<User>) => (
                <CustomHeaderColumn key={column.id} column={column} />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<User>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.id}`} />
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No matching records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div>
        <UsersListPagination />
      </div>
      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export {UsersTable}
