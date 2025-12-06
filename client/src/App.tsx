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
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Layout from './components/Layout';
import CookieConsent from './components/CookieConsent';
import { AlertProvider } from './context/AlertContext';
import AlertModal from './components/AlertModal';
import './index.css';

function App() {
  return (
    <AlertProvider>
      <Router>
        <CookieConsent />
        <AlertModal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          
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
    </AlertProvider>
  );
}

export default App;
