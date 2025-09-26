import React from 'react';
export default function Help(){
  return (
    <div style={{padding:20}}>
      <h1>Help — How to use the OS Scheduler app</h1>
      <p>This app demonstrates scheduling algorithms, allows you to generate Gantt charts and print them.</p>
      <h3>Frontend (Usage)</h3>
      <ol>
        <li>Open the application in your browser (Vite dev server, e.g. http://localhost:5173).</li>
        <li>Use the top navigation bar to go to <strong>Read</strong>, <strong>Gantt</strong>, or <strong>Help</strong>.</li>
        <li>On <strong>Gantt</strong> page:
          <ul>
            <li>Select an algorithm from the dropdown and click <em>Generate</em> to produce a schedule.</li>
            <li>Click <em>Add Process</em> to add a custom process (provide PID, AT, BT, Priority when prompted).</li>
            <li>For Round Robin, set the quantum value before generating.</li>
            <li>Click <em>Print Gantt Chart</em> to open a printable view and print it.</li>
          </ul>
        </li>
        <li>Use the <strong>Read</strong> page to learn theory, formulas, and hand-worked examples.</li>
      </ol>
      <h3>Backend (Usage)</h3>
      <p>The project includes a minimal Express backend for demo purposes. To run backend:</p>
      <pre>cd backend
npm install
npm start</pre>
      <p>Backend listens on port 4000 by default and exposes a sample endpoint <code>/api/ping</code>.</p>
      <h3>Running the whole project (both servers)</h3>
      <ol>
        <li>Open two terminals.</li>
        <li>Terminal A: start backend:
          <pre>cd backend
npm install
npm start</pre>
        </li>
        <li>Terminal B: start frontend:
          <pre>cd frontend
npm install
npm run dev</pre>
        </li>
        <li>Open the URL shown by Vite (usually http://localhost:5173).</li>
      </ol>
      <h3>Troubleshooting</h3>
      <ul>
        <li>If frontend fails because of a missing CSS file, ensure <code>frontend/src/index.css</code> exists; the build uses a fallback file if missing.</li>
        <li>If the Gantt chart doesn't print correctly, try using the browser's print preview to check content; the printable view captures the HTML markup used for the chart.</li>
        <li>Check browser console for errors (F12) and share logs if you need help—I'll debug them.</li>
      </ul>
    </div>
  );
}
