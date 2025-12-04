import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import CreateQuote from './pages/CreateQuote';
import EditQuote from './pages/EditQuote';
import EditClient from './pages/EditClient';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="/clients/:id/edit" element={<EditClient />} />
          <Route path="/quotes/new" element={<CreateQuote />} />
          <Route path="/quotes/:id/edit" element={<EditQuote />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
