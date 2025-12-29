import {useEffect, useState} from 'react'
import {Tab} from 'bootstrap'
import {
  MenuComponent,
  DrawerComponent,
  ScrollComponent,
  ScrollTopComponent,
  StickyComponent,
  ToggleComponent,
  SwapperComponent,
} from './assets/ts/components'
import {ThemeModeComponent} from './assets/ts/layout'

import {useLayout} from './layout/core'
import { useLocation } from 'react-router-dom'

export function MasterInit() {
  const {config} = useLayout()
  const [initialized, setInitialized] = useState(false)
  const location = useLocation()

  const pluginsInitialization = () => {
    ThemeModeComponent.init()
    setTimeout(() => {
      ToggleComponent.bootstrap()
      ScrollTopComponent.bootstrap()
      DrawerComponent.bootstrap()
      StickyComponent.bootstrap()
      MenuComponent.bootstrap()
      ScrollComponent.bootstrap()
      SwapperComponent.bootstrap()
      document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
        Tab.getOrCreateInstance(tab)
      })
    }, 1000)
  }

  useEffect(() => {
    setTimeout(() => {
    DrawerComponent.reinitialization()
    DrawerComponent.bootstrap()
    }, 1000)
    
    if (!initialized) {
      setInitialized(true)
      pluginsInitialization()
    }
    }, [config, location])

  return <></>
}
