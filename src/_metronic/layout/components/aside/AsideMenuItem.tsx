import {FC, MouseEventHandler, ReactNode} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import {checkIsActive, KTIcon, WithChildren} from '../../../helpers'
import {useLayout} from '../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  onClick?: () => void
  onContextMenu?: MouseEventHandler<HTMLDivElement>
  actions?: ReactNode
}

const AsideMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet = false,
  onClick,
  onContextMenu,
  actions,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {aside} = config

  return (
    <div className='menu-item' onContextMenu={onContextMenu}>
      <Link
        className={clsx('menu-link without-sub d-flex align-items-center', {active: isActive})}
        to={to}
        onClick={onClick}
      >
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {icon && aside.menuIcon === 'svg' && (
          <span className='menu-icon'>
            <KTIcon iconName={icon} className='fs-2' />
          </span>
        )}
        {fontIcon && aside.menuIcon === 'font' && <i className={clsx('bi fs-3', fontIcon)}></i>}
        <span className='menu-title ms-3 flex-grow-1 text-truncate' style={{minWidth: 0}}>
          {title}
        </span>
        {actions && (
          <span className='ms-2 d-flex align-items-center gap-1' onClick={(e) => e.stopPropagation()}>
            {actions}
          </span>
        )}
      </Link>
      {children}
    </div>
  )
}

export {AsideMenuItem}
