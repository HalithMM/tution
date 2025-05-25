import { onAuthStateChanged } from 'firebase/auth'
import  { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth} from '../config/firebase'

export const Protectedroute = ({children}) => {
    const navigate = useNavigate()
    const [isAuthorized, setIsAuthorized] = useState(false)
    useEffect(()=>{
        const unSubscribe = onAuthStateChanged(Auth, async(user)=>{
            const properLogin = sessionStorage.getItem('didProperLogin');
            if (!user||!user.emailVerified || !properLogin) {
                navigate('/unauthorized', { replace: true })
            } 
            else {
                setIsAuthorized(true)
            }
        })
        return ()=> unSubscribe()
    },[navigate])
  return isAuthorized ? children : null
}
