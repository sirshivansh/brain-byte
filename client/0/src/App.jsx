import React, { useState } from 'react';

function App() {
  return (
    <div style={{ backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1>SecureAI SOC Co-Pilot</h1>
      <input type="text" placeholder="Ask a security question..." style={{ width: '100%', padding: '10px' }} />
      <div className="timeline">
        {/* Niharika's Timeline Component goes here */}
        <p>Awaiting logs...</p>
      </div>
    </div>
  );
}

export default App;