import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Read from './pages/Read';
import Help from './pages/Help';
import Try from './pages/Try';
import Gantt from './pages/Gantt';

function Home(){
  return <div style={{padding:20}}><h1>Welcome to OS Scheduler</h1><p>Use the navigation to explore scheduling algorithms and Gantt charts.</p></div>
}

export default function App(){
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/read' element={<Read/>} />
        <Route path='/help' element={<Help/>} />
        <Route path='/gantt' element={<Gantt/>} />
        <Route path='/try' element={<Try/>} />
      </Routes>
    </Router>
  );
}
