import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
export default function RegisterPage() {
    const [name,setName]=useState('')
    const [password,setPassword]=useState('')
    const [email,setEmail]=useState('')
    async function registerUser(ev){
     ev.preventDefault();
     try {
        await axios.post('/register',{
            name,
            email,
            password,
          }) 
         alert('Registration Completed') 
     } catch (error) {
        alert('registration failed')
        console.log(error)
     }
         
    }
    return (
        
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center">Register</h1>
                <form action="" className="max-w-md mx-auto" onSubmit={registerUser}>
                    <input type="text"
                     placeholder="John Doe" 
                    value={name} 
                    onChange={event=> setName(event.target.value)}/>
                    <input type="email" 
                    placeholder="your@emailid" 
                    value={email}
                    onChange={event=>setEmail(event.target.value)}
                    />
                    <input type="password"
                    placeholder="password" 
                    value={password}
                    onChange={event=>setPassword(event.target.value)}
                    />
                    <button className="primary">Register</button>
                    <div className="text-center py-2 text-gray-500">Already Registered?
                        <Link to={'/login'} className="underline text-black">Login</Link>
                    </div>
                </form>
            </div>

        </div>
    )
}