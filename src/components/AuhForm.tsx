"use client"

import React, { use, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'
import { useRouter } from 'next/navigation'
import { isValidEmail, isValidPasswordFun } from '@/lib/util'

const AuthForm = () => {
    const nameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const [isValidUsername, setIsValidUsername] = useState(true);
    const [isValidPassword, setIsValidpass] = useState(true);
    const [isLogin, setLogin] = useState(true)
    const router = useRouter()

    // handeling toast alert
    const { toast } = useToast();

    const submitHandler = async () => {

        if (nameRef && passwordRef) {

            const name = nameRef.current?.value;
            const password = passwordRef.current?.value;
            var endpoint, titleMsg, titleWrongMsg, wrongMsg;
            if (isLogin) {
                endpoint = 'users/Login'
                titleMsg = 'Logged in Successfuly'
                titleWrongMsg = 'Invalid username password!'
                wrongMsg = 'Please Try again'
            } else {
                endpoint = 'users'
                titleMsg = 'Signed in Successfuly'
                titleWrongMsg = 'Username already exist!'
                wrongMsg = 'Use diffrent username'
            }

            if (await authCall(endpoint, name, password)) {
                router.push('/dashboard')
                return toast({
                    title: titleMsg,
                    description: 'Redirecting to Dashboard',
                    variant: 'default',
                })
            }
            else {
                if (passwordRef.current) {
                    passwordRef.current.value = '';
                }
                return toast({
                    title: titleWrongMsg,
                    description: wrongMsg,
                    variant: 'destructive',
                })
            }
        }


    }
    return (
        <>
            <div className='form mx-auto w-[300px] text-left border-2 border-blue-500 p-8 rounded-3xl bg-white/90' id="formId">
                <div className="mb-8"><label className='pl-5' htmlFor="email">Email</label>
                    <Input ref={nameRef} id="email" type="email" placeholder="enter your email" onChange={()=>setIsValidUsername(true)} onBlur={() => setIsValidUsername(isValidEmail(nameRef.current?.value))} />
                    {!isValidUsername && <p className='text-center text-[12px] mt-1 text-red-500 font-semibold'>Invalid Email!</p>}
                </div>

                <div className="mb-8"> <label className='pl-5' htmlFor="password">Password</label>
                    <Input ref={passwordRef} id="password" type="password" placeholder="enter password" onChange={()=>setIsValidpass(true)} onBlur={()=>{setIsValidpass(isValidPasswordFun(passwordRef.current?.value))}}/>
                    {!isValidPassword && <p className='text-center text-[12px] mt-1 text-red-500 font-semibold'>Must be 6 or more character long!</p>}
                </div>

                {isValidUsername && isValidPassword && <div><Button onClick={submitHandler}>
                    {isLogin && 'Login'}
                    {!isLogin && 'Sign'}
                </Button></div>}

                {(!isValidUsername || !isValidPassword ) && <div><Button onClick={submitHandler} disabled>
                    {isLogin && 'Login'}
                    {!isLogin && 'Sign'}
                </Button></div>}
            </div>

            {isLogin && <p className='text-[18px] mt-5'>New User? <button className='text-blue-600' onClick={() => { { setLogin(!isLogin) } }}>Create one</button></p>}
            {!isLogin && <p className='text-[18px] mt-5'>Already have an account? <button className='text-blue-600' onClick={() => { { setLogin(!isLogin) } }}>Login</button></p>}

        </>
    )
}

async function authCall(endpoint: string, username: string | undefined, password: string | undefined) {
    try {
        // Send a POST request to create a new user
        const response = await fetch('http://localhost:3000/' + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        // Check if the request was successful
        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData)
            const userId = responseData._id;
            const email = responseData.username;
            setCookie('user', userId, 2);
            setCookie('email', email, 2);

            return true
        } else {
            const errorData = await response.json();
            return false
        }
    } catch (error) {
        console.error('Error:', error);
        return false
    }
}

function setCookie(name: string, value: string, hours: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

export default AuthForm