import React, { useContext } from 'react';
import { UserContext } from '../UserContext';
import { Link, Navigate, useParams, } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import PlacesPage from './PlacesPage';
import AccountNav from './AccountNav';

export default function ProfilePage() {
    const[redirect,setRedirect]=useState(null)
    const { user, ready ,setUser} = useContext(UserContext);
    let { subpage } = useParams(); // Move useParams to the top

    if (!ready) {
        return 'Loading...';
    }

    if (ready && !user && !redirect) {
        return <Navigate to={'/login'} />;
    }
    if (subpage === undefined) {
        subpage = 'profile';
      }
    // console.log(subpage); // Uncomment if you need to debug
    async function logout(){
       await axios.post('/logout')
       setRedirect('/')
       setUser(null)
    }

   
      if(redirect){
        return <Navigate to={redirect}/>
      }
    return (
        <div>
          <AccountNav></AccountNav>
    {subpage==='profile' &&(
            <div className="text-center max-w-lg mx-auto">
                Logged in as {user.name}({user.email})<br/>
                <button className='primary max-w-sm mt-2' onClick={logout}>Logout</button>
            </div>
        )}
        {
            subpage==='places' &&(
                <PlacesPage></PlacesPage>
            )
        }
        </div>
    );
}
