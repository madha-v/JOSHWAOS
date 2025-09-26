import React from 'react';
import GanttChart from '../components/GanttChart';
export default function Gantt(){
  const handlePrint = () => {
    const el = document.getElementById('gantt-chart');
    if(!el){alert('Gantt chart element not found.');return;}
    const pri = window.open('', '_blank', 'width=900,height=700');
    pri.document.write('<html><head><title>Gantt Chart</title>');
    pri.document.write('<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px} table{border-collapse:collapse;width:100%} td,th{border:1px solid #ddd;padding:6px}</style>');
    pri.document.write('</head><body>');
    pri.document.write('<h2>Gantt Chart Print</h2>');
    pri.document.write(el.outerHTML);
    pri.document.write('</body></html>');
    pri.document.close();pri.focus();setTimeout(()=>{pri.print();pri.close();},700);
  };
  return (
    <div style={{padding:20}}>
      <h1>Gantt Chart</h1>
      <GanttChart />
      <div style={{marginTop:12}}>
        <button onClick={handlePrint}>Print Gantt Chart</button>
      </div>
    </div>
  );
}
