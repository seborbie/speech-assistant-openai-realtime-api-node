'use client';

import { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

interface LogEntry {
  type: string;
  timestamp: string;
  data: any;
}

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = new W3CWebSocket('ws://localhost:5050/media-stream');

    client.onopen = () => {
      console.log('WebSocket Client Connected');
      setIsConnected(true);
    };

    client.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data.toString());
        const newLog: LogEntry = {
          type: data.event || data.type,
          timestamp: new Date().toISOString(),
          data: data
        };
        setLogs(prevLogs => [...prevLogs, newLog]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    client.onclose = () => {
      console.log('WebSocket Client Disconnected');
      setIsConnected(false);
    };

    return () => {
      client.close();
    };
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Call Logs</h1>
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-auto max-h-[70vh]">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center">Waiting for calls...</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-600">{log.type}</span>
                    <span className="text-sm text-gray-500">{log.timestamp}</span>
                  </div>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
