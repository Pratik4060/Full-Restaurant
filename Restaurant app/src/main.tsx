import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OrderProvider } from './contexts/OrderContext.tsx'

createRoot(document.getElementById('root')!).render(

  <OrderProvider>

    <App />
  </OrderProvider>
)
