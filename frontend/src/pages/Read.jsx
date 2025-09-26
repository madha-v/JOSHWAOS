import React from 'react';

const AlgorithmSection = ({title, description, formulas, example, gantt}) => (
  <div style={{marginBottom:20,padding:12,border:'1px solid #eee',borderRadius:8}}>
    <h2>{title}</h2>
    <p>{description}</p>
    <h4>Formulas</h4>
    <ul>
      {formulas.map((f,i)=><li key={i}>{f}</li>)}
    </ul>
    <h4>Example</h4>
    <div style={{overflowX:'auto'}}>
      <table style={{borderCollapse:'collapse',minWidth:400}}>
        <thead>
          <tr>
            {Object.keys(example[0]).map((k,i)=><th key={i} style={{border:'1px solid #ddd',padding:6}}>{k}</th>)}
          </tr>
        </thead>
        <tbody>
          {example.map((row,ri)=>
            <tr key={ri}>
              {Object.values(row).map((v,ci)=><td key={ci} style={{border:'1px solid #ddd',padding:6}}>{v}</td>)}
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <h4>Gantt Chart</h4>
    <pre style={{background:'#f7f7f7',padding:8,borderRadius:6}}>{gantt}</pre>
  </div>
);

export default function Read(){
  const fcfsExample = [
    { Process: 'P1', AT: 0, BT: 4, CT: 4, TAT: 4, WT: 0 },
    { Process: 'P2', AT: 1, BT: 3, CT: 7, TAT: 6, WT: 3 },
    { Process: 'P3', AT: 2, BT: 1, CT: 8, TAT: 6, WT: 5 },
  ];

  const sjfExample = [
    { Process: 'P1', AT: 0, BT: 7, CT: 7, TAT: 7, WT: 0 },
    { Process: 'P2', AT: 2, BT: 4, CT: 11, TAT: 9, WT: 5 },
    { Process: 'P3', AT: 4, BT: 1, CT: 8, TAT: 4, WT: 3 },
    { Process: 'P4', AT: 5, BT: 4, CT: 15, TAT: 10, WT: 6 },
  ];

  const rrExample = [
    { Process: 'P1', AT: 0, BT: 4, CT: 8, TAT: 8, WT: 4 },
    { Process: 'P2', AT: 1, BT: 3, CT: 7, TAT: 6, WT: 3 },
    { Process: 'P3', AT: 2, BT: 1, CT: 5, TAT: 3, WT: 2 },
  ];

  const priorityExample = [
    { Process: 'P1', AT: 0, BT: 4, Priority: 2, CT: 4, TAT: 4, WT: 0 },
    { Process: 'P2', AT: 1, BT: 3, Priority: 1, CT: 7, TAT: 6, WT: 3 },
    { Process: 'P3', AT: 2, BT: 1, Priority: 3, CT: 8, TAT: 6, WT: 5 },
  ];

  return (
    <div style={{padding:20}}>
      <h1>Scheduling Algorithms - Complete Read</h1>
      <AlgorithmSection
        title="First Come First Serve (FCFS)"
        description="FCFS schedules processes in the order of their arrival times. It is non-preemptive: once a process starts, it runs to completion."
        formulas={[
          'Turnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)',
          'Waiting Time (WT) = Turnaround Time (TAT) - Burst Time (BT)',
          'Response Time (RT) = Start Time - Arrival Time (AT)'
        ]}
        example={fcfsExample}
        gantt={"P1 [0-4] | P2 [4-7] | P3 [7-8]"}
      />

      <AlgorithmSection
        title="Shortest Job First (SJF) - Non-preemptive"
        description="SJF picks the process with the smallest burst time from the ready queue. Non-preemptive SJF means once a process starts it runs to completion."
        formulas={[
          'TAT = CT - AT',
          'WT = TAT - BT'
        ]}
        example={sjfExample}
        gantt={"P1 [0-7] | P3 [7-8] | P2 [8-12] | P4 [12-16] (example order depends on arrivals)"}
      />

      <AlgorithmSection
        title="Priority Scheduling (Non-preemptive)"
        description="Each process is assigned a priority. The scheduler selects the process with the highest priority (can be defined as lowest numerical value). Non-preemptive variant runs chosen process to completion."
        formulas={[
          'TAT = CT - AT',
          'WT = TAT - BT'
        ]}
        example={priorityExample}
        gantt={"P1 [0-4] | P2 [4-7] | P3 [7-8]"}
      />

      <AlgorithmSection
        title="Round Robin (RR) - Preemptive"
        description="RR assigns a fixed time quantum. Processes are given CPU in round-robin order for a time slice — if process is not finished it is requeued."
        formulas={[
          'Average waiting time and turnaround depend on time quantum.',
          'Smaller quantum -> more context switches, better responsiveness.'
        ]}
        example={rrExample}
        gantt={"P1 [0-2] | P2 [2-4] | P3 [4-5] | P1 [5-7] | P2 [7-8] (example with quantum=2)"}
      />

      <div style={{marginTop:20,padding:12,borderTop:'1px solid #eee'}}>
        <h3>Notes</h3>
        <ul>
          <li>Use FCFS for simple batch systems but note 'convoy effect' where short jobs wait behind long jobs.</li>
          <li>SJF minimizes average waiting time but needs knowledge of burst times.</li>
          <li>Priority scheduling can cause starvation; use aging to avoid it.</li>
          <li>Round Robin is suitable for time-sharing systems; choose quantum carefully.</li>
        </ul>
      </div>
    </div>
  );
}
