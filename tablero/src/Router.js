import React, { Component }  from 'react'
import { BrowserRouter as Router} from 'react-router-dom'
import { Route, Switch, IndexRoute } from 'react-router-dom'


import Board from './containers/Board/Board'

class AppRouter extends Component {

  render () {
    return (
      <Router>
      <Switch>
        <Route path='/' component={Board}/>
      </Switch>
    </Router>
    )
  }
}

export default AppRouter