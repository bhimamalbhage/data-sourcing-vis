import React, { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskAnalytics from './components/TaskAnalytics';

function App() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      <h1>Car Sales Analytics</h1>
      <TaskForm onTaskCreated={() => {}} />
      <TaskList onSelect={setSelectedTaskId} />
      <TaskAnalytics taskId={selectedTaskId} />
    </div>
  );
}

export default App;