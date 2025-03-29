/*
    This file was used for testing while setting up the MERN stack.
    It is not indended to be used, but may serve as a useful source for changes we may make in the future.
    I think it may be worth keeping around, at least for the time being.
*/
import React, { useState } from 'react';
import { buildPath } from './Path';
import { jwtDecode } from "jwt-decode";
import { storeToken } from '../tokenStorage';

interface JWTPayLoad {
    userId: number;
    firstName: string;
    lastName: string;
}

function Login()
{

    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = React.useState('');
    const [loginPassword,setPassword] = React.useState('');

    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();

        var obj = {login:loginName,password:loginPassword};
        var js = JSON.stringify(obj);

        try
        {
            const response = await fetch(buildPath('api/login'), {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            var res = await response.json();
            const { accessToken } = res;
            const decoded = jwtDecode(accessToken) as JWTPayLoad;

            // Store the token so that it can be used later
            storeToken(accessToken)

            try
            {
                var ud = decoded;
                var userId = ud.userId;
                var firstName = ud.firstName;
                var lastName = ud.lastName;

                if (userId <= 0)
                {
                    setMessage('User/Password combination incorrect');
                }
                else
                {
                    var user = {firstName:firstName,lastName:lastName,id:userId};
                    localStorage.setItem('user_data', JSON.stringify(user));

                    setMessage('');
                    window.location.href = '/cards';
                }
            }
            catch(e: any)
            {
                alert( e.toString() );
                return;
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }
    };

    function handleSetLoginName( e: any ) : void
    {
        setLoginName( e.target.value );
    }

    function handleSetPassword( e: any ) : void
    {
        setPassword( e.target.value );
    }

    return(
        <div id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br />
            Login: <input type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName} />
            Password: <input type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} />
            <input type="submit" id="loginButton" className="buttons" value = "Do It" onClick={doLogin} />
            <span id="loginResult">{message}</span>
        </div>
    );
};

export default Login;