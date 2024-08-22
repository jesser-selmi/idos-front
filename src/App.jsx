import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import HrPage from './pages/HrPage';
import UserPage from './pages/UserPage';
import RequestsPage from './pages/RequestsPage';
import AllUsers from './pages/AllUsers';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Navigate } from 'react-router-dom';
import Request from './pages/Request';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';

const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/hr" element={<HrPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/allUsers" element={<AllUsers />} />
          <Route path="/request" element={<Request />} />
          <Route path="/login" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
