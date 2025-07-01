import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Record from './components/Record.jsx'
import LandingPage from './components/LandingPage.jsx'
import Preview from './components/preview.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route
          path='/preview'
          element={
            <ProtectedRoute>
              <Preview />
            </ProtectedRoute>
          }
        />
        <Route
          path='/call/:roomId'
          element={
            <ProtectedRoute>
              <Record />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
