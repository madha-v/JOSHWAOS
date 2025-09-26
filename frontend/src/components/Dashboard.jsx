import React, { useState, useEffect, useRef } from 'react'
import GanttChart from './GanttChart'

export default function Dashboard({ token, username }){
  const [processes, setProcesses] = useState([]);
  const [algo, setAlgo] = useState('fcfs');
  const [quantum, setQuantum] = useState(2);
  const [schedule, setSchedule] = useState([]);
  const [log, setLog] = useState([]);
  const visualRef = useRef(null);

  function addLog(msg){ setLog(l=>[...l, msg]); }

  function addProcess(p){ setProcesses(prev=>[...prev, p]); }
  function removeProcess(i){ setProcesses(prev=> prev.filter((_,idx)=>idx!==i)); }

  useEffect(()=>{ renderTable(); }, [processes]);

  function renderTable(){ }

  async function api(path, method='POST', body){
    const headers = {'Content-Type':'application/json'};
    if(token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch('/api' + path, { method, headers, body: body? JSON.stringify(body): undefined });
    return { ok: res.ok, data: await res.json() };
  }

  async function run(){
    if(processes.length===0) return alert('Add processes');
    addLog('Requesting schedule...');
    const payload = { processes, algorithm: algo, quantum };
    const r = await api('/schedule','POST', payload);
    if(!r.ok){ alert('Server error: ' + (r.data.error||'unknown')); return; }
    setSchedule(r.data.schedule);
    addLog('Schedule computed');
    visualRef.current.innerHTML = '';
    r.data.schedule.forEach(s=>{
      const d = document.createElement('div'); d.textContent = `${s.pid}  ${s.start} -> ${s.end}`; d.className='step'; visualRef.current.appendChild(d);
    });
  }

  return (
    <div className="layout">
      <aside className="left card">
        <h3>Processes</h3>
        <form onSubmit={e=>{ e.preventDefault(); const pid=e.target.pname.value||`P${processes.length+1}`; const arrival=Number(e.target.arrival.value||0); const burst=Number(e.target.burst.value||1); const priority=Number(e.target.priority.value||0); addProcess({pid,arrival,burst,priority}); e.target.reset(); }}>
          <input name="pname" placeholder="P1" />
          <input name="arrival" type="number" placeholder="Arrival" defaultValue="0" />
          <input name="burst" type="number" placeholder="Burst" defaultValue="1" />
          <input name="priority" type="number" placeholder="Priority" defaultValue="0" />
          <div style={{display:'flex',gap:8,marginTop:8}}><button className="small primary" type="submit">Add</button><button type="button" className="ghost small" onClick={()=>{ setProcesses([]); setSchedule([]); }}>Clear</button></div>
        </form>

        <div className="table-wrap">
          <table><thead><tr><th>PID</th><th>Arr</th><th>Burst</th><th>Prio</th><th></th></tr></thead>
            <tbody>{processes.map((p,i)=>(<tr key={i}><td>{p.pid}</td><td>{p.arrival}</td><td>{p.burst}</td><td>{p.priority}</td><td><button className="ghost small" onClick={()=>removeProcess(i)}>Del</button></td></tr>))}</tbody>
          </table>
        </div>

        <label>Algorithm
          <select value={algo} onChange={e=>setAlgo(e.target.value)}>
            <option value="fcfs">FCFS</option>
            <option value="sjf">SJF (non-preemptive)</option>
            <option value="sjf-preemptive">SJF (preemptive)</option>
            <option value="priority">Priority (non-preemptive)</option>
            <option value="priority-preemptive">Priority (preemptive)</option>
            <option value="rr">Round Robin</option>
          </select>
        </label>
        <label style={{display: algo==='rr' ? 'block' : 'none'}}>Time Quantum<input type="number" value={quantum} onChange={e=>setQuantum(Number(e.target.value))} /></label>
        <div style={{marginTop:10}}><button className="primary" onClick={run}>Run (Backend)</button></div>
      </aside>

      <section className="right">
        <div className="card gantt-card"><h3>Gantt</h3><GanttChart schedule={schedule} /></div>
        <div className="card algo-visual"><h3>Algorithm Visual</h3><div ref={visualRef} className="visual-area"></div></div>
      </section>
    </div>
  )
}
