import React, { useState } from 'react'

export default function LoginModal({ onClose, onLogin }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function api(path, method='POST', body){
    const res = await fetch('/api' + path, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    return await res.json();
  }

  async function doRegister(){
    if(!username||!password) return alert('enter username and password');
    const r = await api('/register','POST',{ username, password });
    if(r && r.ok) alert('Registered, now login'); else alert('Register error: '+(r.error||JSON.stringify(r)));
  }

  async function doLogin(){
    if(!username||!password) return alert('enter username and password');
    const r = await api('/login','POST',{ username, password });
    if(r && r.token){
      onLogin(r.username, r.token);
    } else {
      alert('Login failed: '+(r.error||JSON.stringify(r)));
    }
  }

  return (
    <div className="modal">
      <div className="modal-card">
        <h3>Login / Register</h3>
        <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{display:'flex',gap:8}}>
          <button className="primary" onClick={doLogin}>Login</button>
          <button className="ghost" onClick={doRegister}>Register</button>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
