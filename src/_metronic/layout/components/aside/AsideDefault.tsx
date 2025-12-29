import {useState} from 'react'
import {Link} from 'react-router-dom'
import clsx from 'clsx'
import {useLayout} from '../../core'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {AsideTabs} from './AsideTabs'
import {AsideFooter} from './AsideFooter'
import {TabsBase} from './Tabs/_TabsBase'

const AsideDefault = () => {
  const {config} = useLayout()
  const {classes} = useLayout()
  const [link, setLink] = useState<string>('projects')

  return (
    <div
      id='kt_aside'
      className={clsx('aside aside-extended', classes.aside.join(' '))}
      data-kt-drawer='true'
      data-kt-drawer-name='aside'
      data-kt-drawer-activate='{default: true, lg: false}'
      data-kt-drawer-overlay='false'
      data-kt-drawer-width='auto'
      data-kt-drawer-direction='start'
      data-kt-drawer-toggle='#kt_aside_toggle'

      style={{maxWidth:"300px"}}
    >

      {/* end::Primary */}
      {config.aside.secondaryDisplay && (
        <>
          {/* begin::Secondary */}
          <div className='aside-secondary d-flex flex-row-fluid '>
            {/* begin::Workspace */}
            <div className='aside-workspace my-5 p-5' id='kt_aside_wordspace'>
              <TabsBase link={link} />
            </div>
            {/* end::Workspace */}
          </div>
          {/* end::Secondary */}
          {/* begin::Aside Toggle */}
          <button
            id='kt_aside_toggle'
            className={clsx(
              'btn btn-sm btn-icon bg-body btn-color-gray-700 btn-active-primary position-absolute translate-middle start-100 end-0 bottom-0 shadow-sm d-none d-lg-flex mb-4',
              classes.asideToggle.join(' ')
            )}
            data-kt-toggle='true'
            data-kt-toggle-state='active'
            data-kt-toggle-target='body'
            data-kt-toggle-name='aside-minimize'
          >
            <KTIcon iconName='arrow-left' className='fs-2 rotate-180' />
          </button>
          {/* end::Aside Toggle */}
        </>
      )}
    </div>
  )
}

export {AsideDefault}
