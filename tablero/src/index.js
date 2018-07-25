import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import AppRoute from './Router'
import store from './store/store'

import './assets/temp.styl'

render(
  <Provider store={store}>
    <AppRoute/>
  </Provider>, document.getElementById('app')
)
