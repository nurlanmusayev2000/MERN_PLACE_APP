import {BrowserRouter as Router , Route} from 'react-router-dom'
import Users from './user/containers/Users';
import NewContainer from './places/containers/NewContainer';
import { Redirect, Switch } from 'react-router-dom/cjs/react-router-dom.min';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import UserContainer from './places/containers/UserContainer';
import UpdateContainer from './places/containers/UpdateContainer';
import Auth from './user/containers/Auth';
import { AuthContext } from './shared/context/auth-context';
import { useCallback, useEffect, useState } from 'react';

let logoutTimer;

function App ()
{
  const [ token, setToken ] = useState( false );
  const [ userId, setUserId ] = useState( false );
  const[tokenExperationDate,setTokenExperationDate] = useState()

  const login = useCallback( (uid,token,expirationDate) =>
  {
    setToken( token );
    console.log(uid);

    setUserId( uid );
    const tokenExpiration =expirationDate || new Date( new Date().getTime() + 1000 *60 *60 );
    setTokenExperationDate( tokenExpiration );
    localStorage.setItem( 'userData', JSON.stringify( {
      userId: uid,
      token: token,
      expiration: tokenExpiration.toISOString()
    } ) );
  }, [] );

  const logout = useCallback( () =>
  {
    setToken( null );
    setTokenExperationDate(null)
    setUserId( null );
    localStorage.removeItem( 'userData' );
  }, [] );

  useEffect( () =>
  {
    if ( token && tokenExperationDate )
    {
      const remainingTime = tokenExperationDate.getTime() - new Date().getTime();
     logoutTimer= setTimeout(logout,remainingTime)
    } else
    {
      clearTimeout(logoutTimer);
    }
  },[token,logout,tokenExperationDate])

  useEffect( () =>
  {
    const storedData = JSON.parse( localStorage.getItem( 'userData' ));
    if ( storedData && storedData.token &&
      new Date( storedData.expiration ) > new Date())
    {

      login(storedData.userId,storedData.token, new Date( storedData.expiration ))
    }

  }, [ login ] )

  let routes;

  if (token) {
    routes = (
      <>
        <Route path="/" exact><Users /></Route>
        <Route path="/:userId/places" exact>
            <UserContainer/>
      </Route>
        <Route path="/container/new" exact><NewContainer /></Route>
        <Route path="/places/:placeId">
          <UpdateContainer />
        </Route>
        <Redirect to="/" />
      </>

    )
  } else
  {
    routes = (
      <>
        <Route path="/" exact><Users /></Route>
        <Route path="/:userId/places" exact>
            <UserContainer/>
        </Route>
        <Route path="/auth" exact>
            <Auth />
        </Route>
        <Redirect to="/auth" />
      </>
    )
  }

  return (
  <AuthContext.Provider value={{isLoggedIn:!!token, token:token, login:login,logout:logout,userId:userId}}>
    <Router>
      <MainNavigation />
      <main>
        <Switch>
          {routes}
        </Switch>
      </main>
    </Router>
  </AuthContext.Provider>
  );
}

export default App;
