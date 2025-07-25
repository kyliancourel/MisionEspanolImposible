import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  console.log('App rendered');
  return <div style={{ padding: 20 }}>Page d’accueil simple test</div>;
}

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Accueil</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
