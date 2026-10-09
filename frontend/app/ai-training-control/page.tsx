'use client';

import { useState } from 'react';
import AISidebar from '../components/AISidebar';
import { aiApi, apiUrl } from '../../lib/api';

export default function TrainingControl() {
  const [log, setLog] = useState('');
  const [running, setRunning] = useState(false);

  const runTraining = async (endpoint: string) => {
    setRunning(true);
    setLog('');
    try {
      if (endpoint === 'train') {
        const response = await aiApi.trainModels();
        setLog(JSON.stringify(response.data, null, 2));
      } else {
        const response = await fetch(apiUrl(`/api/ai/training/${endpoint}`), { method: 'POST' });
        const data = await response.json();
        setLog(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setLog(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setRunning(false);
  };

  return (
    <div style={{ display: 'flex' }}>
      <AISidebar />
      <div style={{ padding: '20px', flex: 1 }}>
        <h1>Training Control</h1>
        <div>
          <button onClick={() => runTraining('build-dataset')} disabled={running}>Build Dataset</button>
          <button onClick={() => runTraining('train')} disabled={running}>Train Models</button>
          <button onClick={() => runTraining('retrain')} disabled={running}>Retrain with Deals</button>
        </div>
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', height: '400px', overflow: 'auto', backgroundColor: '#f9f9f9' }}>
          <pre>{log}</pre>
        </div>
      </div>
    </div>
  );
}
