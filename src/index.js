import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import Auth from './auth0/Auth'

const auth = new Auth()

ReactDOM.render(<Router><App auth={auth} /></Router>, document.getElementById('root'))
registerServiceWorker()
