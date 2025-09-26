import React, { useState, useEffect } from 'react';
function scheduleFCFS(processes) {
  const procs = processes.slice().sort((a,b)=>a.at - b.at);
  const segs = [];
  let time = 0;
  for (const p of procs) {
    const start = Math.max(time, p.at);
    const end = start + p.bt;
    segs.push({ pid: p.pid, start, end });
    time = end;
  }
  return segs;
}
function scheduleSJF(processes) {
  const rem = processes.map(p=>({...p}));
  const segs = [];
  let time = 0;
  while (rem.length) {
    const available = rem.filter(p=>p.at <= time);
    if (available.length === 0) {
      const nextAt = Math.min(...rem.map(p=>p.at));
      time = nextAt;
      continue;
    }
    let idx = 0;
    for (let i=1;i<available.length;i++){
      if (available[i].bt < available[idx].bt) idx = i;
    }
    const chosen = available[idx];
    const rIdx = rem.findIndex(x=>x.pid===chosen.pid && x.at===chosen.at && x.bt===chosen.bt);
    const start = Math.max(time, chosen.at);
    const end = start + chosen.bt;
    segs.push({ pid: chosen.pid, start, end });
    time = end;
    rem.splice(rIdx,1);
  }
  return segs;
}
function schedulePriority(processes) {
  const rem = processes.map(p=>({...p}));
  const segs = [];
  let time = 0;
  while (rem.length) {
    const available = rem.filter(p=>p.at <= time);
    if (available.length === 0) {
      time = Math.min(...rem.map(p=>p.at));
      continue;
    }
    let chosen = available.reduce((a,b)=> a.priority < b.priority ? a : b );
    const rIdx = rem.findIndex(x=>x.pid===chosen.pid && x.at===chosen.at && x.bt===chosen.bt);
    const start = Math.max(time, chosen.at);
    const end = start + chosen.bt;
    segs.push({ pid: chosen.pid, start, end });
    time = end;
    rem.splice(rIdx,1);
  }
  return segs;
}
function scheduleRR(processes, quantum=2) {
  const procs = processes.slice().map(p=>({ ...p, remaining: p.bt }));
  const segs = [];
  let time = 0;
  const queue = [];
  procs.sort((a,b)=>a.at - b.at);
  let i = 0;
  while (i < procs.length || queue.length) {
    while (i < procs.length && procs[i].at <= time) {
      queue.push(procs[i]);
      i++;
    }
    if (queue.length === 0) {
      if (i < procs.length) {
        time = procs[i].at;
        continue;
      } else break;
    }
    const p = queue.shift();
    const use = Math.min(quantum, p.remaining);
    const start = time;
    const end = time + use;
    segs.push({ pid: p.pid, start, end });
    p.remaining -= use;
    time = end;
    while (i < procs.length && procs[i].at <= time) {
      queue.push(procs[i]);
      i++;
    }
    if (p.remaining > 0) queue.push(p);
  }
  return segs;
}
export default function GanttChart({ processes: initialProcesses }) {
  const sample = [
    { pid: 'P1', at:0, bt:4, priority:2 },
    { pid: 'P2', at:1, bt:3, priority:1 },
    { pid: 'P3', at:2, bt:1, priority:3 }
  ];
  const [processes, setProcesses] = useState(initialProcesses && initialProcesses.length ? initialProcesses : sample);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum] = useState(2);
  const [segments, setSegments] = useState([]);
  useEffect(()=>{ generate(); }, [processes, algorithm, quantum]);
  function generate() {
    function mapTypes(segs){
      return segs.map(s => ({ ...s, type: (processes.find(p=>p.pid===s.pid)?.io ? 'io' : 'cpu') }));
    }

    let segs = [];
    if (algorithm === 'FCFS') segs = scheduleFCFS(processes);
    else if (algorithm === 'SJF') segs = scheduleSJF(processes);
    else if (algorithm === 'PRIORITY') segs = schedulePriority(processes);
    else if (algorithm === 'RR') segs = scheduleRR(processes, Number(quantum) || 2);
    setSegments(mapTypes(segs));
  }
  function addProcess() {
    const pid = prompt('Process name (e.g. P4):');
    if(!pid) return;
    const at = Number(prompt('Arrival Time (integer):','0'));
    const bt = Number(prompt('Burst Time (integer):','1'));
    const priority = Number(prompt('Priority (lower = higher priority):','1'));
    setProcesses(prev=>[...prev, { pid, at, bt, priority }].sort((a,b)=>a.at - b.at));
  }
  function computeMetrics() {
    const completed = {};
    segments.forEach(s=>{ completed[s.pid] = s.end; });
    const metrics = processes.map(p=>{
      const ct = completed[p.pid] !== undefined ? completed[p.pid] : null;
      const tat = ct !== null ? ct - p.at : null;
      const wt = tat !== null ? tat - p.bt : null;
      return { pid: p.pid, at: p.at, bt: p.bt, priority: p.priority, ct, tat, wt };
    });
    return metrics;
  }
  const totalTime = segments.length ? Math.max(...segments.map(s=>s.end)) : processes.reduce((a,b)=>a+b.bt,0);
  const metrics = computeMetrics();
  return (
    <div>
      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
        <label>
          Algorithm:
          <select value={algorithm} onChange={e=>setAlgorithm(e.target.value)} style={{marginLeft:8}}>
            <option value="FCFS">FCFS</option>
            <option value="SJF">SJF (non-preemptive)</option>
            <option value="PRIORITY">Priority (non-preemptive)</option>
            <option value="RR">Round Robin (preemptive)</option>
          </select>
        </label>
        {algorithm === 'RR' && (
          <label>
            Quantum:
            <input type="number" value={quantum} onChange={e=>setQuantum(e.target.value)} style={{width:60,marginLeft:8}} />
          </label>
        )}
        <button onClick={generate}>Generate</button>
        <button onClick={addProcess}>Add Process</button>
      </div>
      <div id="gantt-chart" style={{border:'1px solid #ddd',padding:12,minHeight:120}}>
        <div style={{display:'flex',height:40,alignItems:'center',position:'relative'}}>
          {segments.length === 0 && <div style={{padding:8}}>No schedule yet - click Generate</div>}
          {segments.map((s,i)=>{
            const width = totalTime ? ((s.end - s.start) / totalTime) * 100 : 0;
            const left = totalTime ? (s.start / totalTime) * 100 : 0;
            return (
              <div key={i} title={`${s.pid}: ${s.start} - ${s.end}`} style={{
                position:'absolute',
                left: `${left}%`,
                width:`${width}%`,
                height: '60%',
                background: (s.type === 'io' ? '#ff9f43' : '#6aa4ff'),
                border: '1px solid #2b6cb0',
                color:'#fff',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontWeight:700,
                boxSizing:'border-box'
              }}>{s.pid}</div>
            );
          })}
        </div>
        <div style={{marginTop:16}}>
          <strong>Timeline:</strong> {segments.length ? `0 — ${totalTime}` : 'N/A'}
        </div>
        <div style={{marginTop:12}}>
          <strong>Metrics:</strong>
          <table style={{width:'100%',borderCollapse:'collapse',marginTop:8}}>
            <thead>
              <tr>
                <th style={{border:'1px solid #ddd',padding:6}}>PID</th>
                <th style={{border:'1px solid #ddd',padding:6}}>AT</th>
                <th style={{border:'1px solid #ddd',padding:6}}>BT</th>
                <th style={{border:'1px solid #ddd',padding:6}}>Priority</th>
                <th style={{border:'1px solid #ddd',padding:6}}>CT</th>
                <th style={{border:'1px solid #ddd',padding:6}}>TAT</th>
                <th style={{border:'1px solid #ddd',padding:6}}>WT</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m,i)=>(
                <tr key={i}>
                  <td style={{border:'1px solid #ddd',padding:6}}>{m.pid}</td>
                  <td style={{border:'1px solid #ddd',padding:6}}>{m.at}</td>
                  <td style={{border:'1px solid #ddd',padding:6}}>{m.bt}</td>
                  <td style={{border:'1px solid #ddd',padding:6}}>{m.priority}</td>
                  <td style={{border:'1px solid #ddd',padding:6}}>{m.ct !== null ? m.ct : '-'}</td>
                  <td style={{border:'1px solid #ddd',padding:6}}>{m.tat !== null ? m.tat : '-'}</td>
                  <td style={{border:'1px solid #ddd',padding:6}}>{m.wt !== null ? m.wt : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
