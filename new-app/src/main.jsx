import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css';
import './i18n';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)









// import { useState } from 'react'
// import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import './App.css'
// import "leaflet/dist/leaflet.css"; 
// import Navigation from './components/Navigation'
// import MainHero from './components/MainHero'
// import Login from './components/Auth/Login';
// import Register from './components/Auth/Register';
// import 'leaflet-draw/dist/leaflet.draw.css';
// import { AuthProvider } from './context/AuthContext';
// // START: Import the new SocketProvider
// import { SocketProvider } from './context/SocketContext';
// // END: Import
// import AdminPanel from './pages/AdminPanel';
// import ForgotPassword from './components/Auth/ForgotPassword';
// import ResetPassword from './components/Auth/ResetPassword';
// import MapModal from './components/MapModal';
// // @import '~leaflet/dist/leaflet.css';

// function App() {
//   return (
//     <AuthProvider>
//       {/* START: Wrap the application with SocketProvider */}
//       {/* It's placed inside AuthProvider so it can access the auth token */}
//       <SocketProvider>
//         <BrowserRouter>
//           <div>
//             {/* <Navigation/> */}
//             <Routes>
//               <Route path='/' element={<MainHero/>}/>
//               <Route path='/login' element={<Login/>}/>
//               <Route path='/register' element={<Register/>}/>
//               <Route path='/admin' element={<AdminPanel/>}/>
//               {/* <Route path='/map' element={<MapModal/>}/> */}
//               <Route path="/forgot-password" element={<ForgotPassword />} />
//               <Route path="/reset-password" element={<ResetPassword />} />
//               {/* <Route path='/' element={<Form/>}/> */}         
//             </Routes>
//             {/* <Footer/> */}
//           </div>
//         </BrowserRouter>
//       </SocketProvider>
//       {/* END: Wrap */}
//     </AuthProvider>
//   )
// }

// export default App