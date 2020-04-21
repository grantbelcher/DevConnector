import React, { Fragment } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

import Register from './components/auth/Register.js'
import Login from './components/auth/Login.js'
import Alert from './components/layout/Alert.js'
import Navbar from './components/layout/Navbar.js';
import Landing from './components/layout/Landing.js'
// Redux
import { Provider } from 'react-redux';
import store from './store.js'



import './App.css';

const App = () => 
    <Provider store = {store}>
      <Router>
          <Fragment>
            <Navbar />
            <Route exact path="/" component={ Landing } />
            <section className="container">
              <Alert/>
                <Switch>
                  <Route exact path="/register" component={Register} />
                  <Route exact path="/login" component={Login} />
                </Switch>
            </section>
          </Fragment>
      </Router>
    </Provider>


export default App;
