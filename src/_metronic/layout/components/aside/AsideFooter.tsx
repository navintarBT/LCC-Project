import { useAuth } from '../../../../app/modules/auth';
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {HeaderNotificationsMenu, HeaderUserMenu, QuickLinks} from '../../../partials'

const AsideFooter = () => {
  const { currentUser } = useAuth();
  return (
    <div
      className='aside-footer d-flex flex-column align-items-center flex-column-auto'
      id='kt_aside_footer'
    >

      {/* begin::User */}
      <div className='d-flex align-items-center ' id='kt_header_user_menu_toggle'>
        {/* begin::Menu wrapper */}
        <div
          className='cursor-pointer symbol symbol-35px mt-2'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='false'
          data-kt-menu-placement='top-start'
          title='User profile'
        >
          {currentUser?.segment != "systory" ?(
            <img src={toAbsoluteUrl('media/avatars/blank.png')} alt='avatar' />
          ):(
            <img src={`https://trimble.systory.la/public/images/users/${currentUser?.img}`} alt='avatar' />
          )} 
        </div>
        {/* end::Menu wrapper */}
        <HeaderUserMenu />
      </div>
      {/* end::User */}
    </div>
  )
}

export {AsideFooter}
