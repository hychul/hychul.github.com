import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ReactPage from 'page/ReactPage';
import Navigator from 'component/Navigator/Navigator';
import MainPage from 'page/MainPage';
import PostListPage from 'page/PostListPage';
import PostPage from 'page/PostPage';
import TestPage from 'page/TestPage';
import Copyright from 'component/Copyright/Copyright';
import ScrollToTop from 'component/Util/ScrollToTop';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: 'white',
    }}>
      <Navigator />
      <BrowserRouter>
        <ScrollToTop />
        <Switch>
          {/* <Route exact path='/' component={MainPage} /> */}
          <Route exact path='/' component={PostListPage} />
          <Route exact path='/posts' component={PostListPage} />
          <Route exact path='/posts/:id' component={PostPage} />
          <Route exact path='/react' component={ReactPage} />
          <Route exact path='/test' component={TestPage} />
        </Switch>
      </BrowserRouter>
      <div style={{
        width: 'calc(100% - 2vmin * 2)',
        marginTop: '10px 2vmin',
        borderTop: 'solid 1px #EAECEF',
        padding: '42px 0px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#242A2D',
      }}>
        <Copyright/>
      </div>
    </div>
  );
}

export default App;
