import {Column} from 'react-table'
import {UserInfoCell} from './UserInfoCell'
import {FullnameCell} from "./FullnameCell"
import {UserEmailCell} from './UserEmailCell'
import {UserActionsCell} from './UserActionsCell'
import {UserCustomHeader} from './UserCustomHeader'
import {LastNameCell} from "./lastNameCell"
import {User} from '../../core/_models'

const usersColumns: ReadonlyArray<Column<User>> = [
  {
    Header: (props) => <UserCustomHeader tableProps={props} title='Username' className='min-w-125px' />,
    id: 'name',
    Cell: ({...props}) => <UserInfoCell user={props.data[props.row.index].username} />,
  },

  {
    Header: (props) => <UserCustomHeader tableProps={props} title='Fullname' className='min-w-125px' />,
    id: 'fullname',
    Cell: ({...props}) => <FullnameCell fullname={props.data[props.row.index].first_name} />,
  },

    {
    Header: (props) => <UserCustomHeader tableProps={props} title='Last Name' className='min-w-125px' />,
    id: 'lastName',
    Cell: ({...props}) => <LastNameCell last_name={props.data[props.row.index].last_name} />,
  },

  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title='Role' className='min-w-125px' />
    ),
    id: 'role',
    Cell: ({...props}) => <UserInfoCell user={props.data[props.row.index].role} />,
  },
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title='Email' className='min-w-125px' />
    ),
    id: 'Email',
    Cell: ({...props}) => <UserEmailCell email={props.data[props.row.index].email} />,
  },
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title='Actions' className='w-100px' />
    ),
    id: 'actions',
    Cell: ({...props}) => <UserActionsCell id={props.data[props.row.index]._id} />,
  },
]

export {usersColumns}
