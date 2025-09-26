import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar(){
  return (
    <nav style={{background:'#0d6efd',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',color:'white',position:'sticky',top:0,zIndex:1000}}>
      <div style={{fontWeight:800,fontSize:18}}>OS Scheduler</div>
      <div style={{display:'flex',gap:16,alignItems:'center'}}>
        <Link to="/" style={{color:'white'}}>Home</Link>
        <Link to="/read" style={{color:'white'}}>Read</Link>
        <Link to="/gantt" style={{color:'white'}}>Gantt</Link>
        <Link to="/try" style={{color:'white'}}>Try</Link>
        <Link to="/help" style={{color:'white'}}>Help</Link>
      </div>
    </nav>
  );
}
