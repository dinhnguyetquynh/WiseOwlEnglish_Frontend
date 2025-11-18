import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HomeProvider } from './context/AuthContext.tsx'
import { SnackbarProvider } from "notistack";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <HomeProvider>
        <App />
      </HomeProvider>
    </SnackbarProvider>


  </StrictMode>,
)
