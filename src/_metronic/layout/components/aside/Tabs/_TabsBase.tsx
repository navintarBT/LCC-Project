
import {FC} from 'react'
import {KTIcon} from '../../../../helpers'
import {AuthorsTab} from './AuthorsTab'
import {MenuTab} from './MenuTab'
import {NotificationsTab} from './NotificationsTab'
import {ProjectsTab} from './ProjectsTab'
import {SubscriptionsTab} from './SubscriptionsTab'
import {TasksTab} from './TasksTab'
import { AsideFooter } from '../AsideFooter'

type Props = {
  link: string
}

const SelectedTab: FC<Props> = ({link}) => {
  switch (link) {

    case 'menu':
      return <MenuTab />
 
    default:
      return <MenuTab />
  }
}

const TabsBase: FC<Props> = ({link}) => {
  return (
    <div className='d-flex h-100 flex-column'>
      {/* begin::Wrapper */}
      <div
        className='flex-column-fluid hover-scroll-y me-3'
        data-kt-scroll='true'
        data-kt-scroll-activate='true'
        data-kt-scroll-height='auto'
        data-kt-scroll-wrappers='#kt_aside_wordspace'
        data-kt-scroll-dependencies='#kt_aside_secondary_footer'
        data-kt-scroll-offset='0px'
      >
        {/* begin::Tab content */}
        <div className='tab-content'>
          <div
            className='tab-pane fade active show'
            id={`kt_aside_nav_tab_${link}`}
            role='tabpanel'
          >
            <SelectedTab link={link} />
          </div>
        </div>
        {/* end::Tab content */}
      </div>
      {/* end::Wrapper */}
      {/* begin::Footer */}

      <div className='d-flex' id='kt_aside_secondary_footer'>
      <AsideFooter />

        <span
          className='btn btn-color-gray-600 btn-flex btn-active-color-primary flex-center w-100'
          style={{ cursor: 'default' }}
        >
        {/* <span className='btn-label'>powered by systory</span> */}
        </span>
      </div>
      {/* end::Footer */}
    </div>
  )
}

export {TabsBase}
