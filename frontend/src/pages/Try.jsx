import React, { useState } from 'react';
import GanttChart from '../components/GanttChart';

export default function Try(){
  const [processes, setProcesses] = useState([
    { pid: 'P1', at:0, bt:4, io:false, priority:2 },
    { pid: 'P2', at:1, bt:3, io:true,  priority:1 },
  ]);
  const [pid, setPid] = useState('');
  const [at, setAt] = useState(0);
  const [bt, setBt] = useState(1);
  const [io, setIo] = useState(false);
  const [prio, setPrio] = useState(1);

  function addProcess(e){
    e.preventDefault();
    if(!pid) return alert('Enter PID');
    setProcesses(prev => {
      const next = [...prev, { pid, at: Number(at), bt: Number(bt), io: !!io, priority: Number(prio) }];
      next.sort((a,b)=>a.at - b.at);
      return next;
    });
    setPid(''); setAt(0); setBt(1); setIo(false); setPrio(1);
  }

  function reset(){
    setProcesses([]);
  }

  return (
    <div style={{padding:20, minHeight:'80vh'}}>
      <h1>Try — Interactive Scheduler</h1>
      <p>Use the form to add processes. Choose whether the burst is CPU or I/O and visualize on the Gantt chart.</p>

      <div style={{display:'flex',gap:20,flexWrap:'wrap',alignItems:'flex-start'}}>
        <form onSubmit={addProcess} style={{minWidth:280, padding:12, border:'1px solid #eee', borderRadius:8}}>
          <div style={{marginBottom:8}}>
            <label>PID:</label><br/>
            <input value={pid} onChange={e=>setPid(e.target.value)} />
          </div>
          <div style={{marginBottom:8}}>
            <label>Arrival Time (AT):</label><br/>
            <input type="number" value={at} onChange={e=>setAt(e.target.value)} />
          </div>
          <div style={{marginBottom:8}}>
            <label>Burst Time (BT):</label><br/>
            <input type="number" value={bt} onChange={e=>setBt(e.target.value)} />
          </div>
          <div style={{marginBottom:8}}>
            <label>Priority:</label><br/>
            <input type="number" value={prio} onChange={e=>setPrio(e.target.value)} />
          </div>
          <div style={{marginBottom:8}}>
            <label><input type="checkbox" checked={io} onChange={e=>setIo(e.target.checked)} /> I/O Burst (otherwise CPU)</label>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button type="submit">Add Process</button>
            <button type="button" onClick={reset}>Reset</button>
          </div>
        </form>

        <div style={{flex:1, minWidth:420}}>
          <h3>Processes</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th>PID</th><th>AT</th><th>BT</th><th>Type</th><th>Prio</th></tr></thead>
            <tbody>
              {processes.map((p,i)=>(
                <tr key={i} style={{borderTop:'1px solid #eee'}}>
                  <td style={{padding:6}}>{p.pid}</td>
                  <td style={{padding:6}}>{p.at}</td>
                  <td style={{padding:6}}>{p.bt}</td>
                  <td style={{padding:6}}>{p.io ? 'I/O' : 'CPU'}</td>
                  <td style={{padding:6}}>{p.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:12}}>
            <GanttChart processes={processes} />
          </div>
        </div>
      </div>
    </div>
  );
}
