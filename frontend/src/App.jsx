import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/authSlice';
import axios from 'axios';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

// Set base URL dynamically: localhost for dev, relative (Vercel same-domain) for production
axios.defaults.baseURL = import.meta.env.DEV ? 'http://localhost:5000' : '';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is logged in
    axios.get('/auth/current_user', { withCredentials: true })
      .then(res => {
        if (res.data) {
          dispatch(setUser(res.data));
        }
      })
      .catch(err => console.log(err));
  }, [dispatch]);

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard/*" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
