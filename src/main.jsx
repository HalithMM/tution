import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' 
import Whole from '../Whole'

createRoot(document.getElementById('root')).render(
  <StrictMode> 
    <Whole/>
  </StrictMode>,
)
