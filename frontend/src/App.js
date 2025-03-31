import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskAnalytics from './components/TaskAnalytics';
import './App.css';

function App() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('create'); 
  
  const refreshTasks = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTaskCreated = (task) => {
    refreshTasks();
    setActiveTab('view');
    setSelectedTaskId(task.id);
  };

  useEffect(() => {
    if (selectedTaskId && activeTab === 'create') {
      setActiveTab('view');
    }
  }, [selectedTaskId]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Data Sourcing & Visualization Dashboard</h1>
        <p>Create tasks to fetch and analyze sales data from multiple sources</p>
      </header>
      
      <div className="app-main">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create New Task
          </button>
          <button 
            className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            View & Analyze Tasks
          </button>
        </div>
        
        {/* Create Task View */}
        {activeTab === 'create' && (
          <div className="create-view">
            <div className="task-creation-container">
              <TaskForm onTaskCreated={handleTaskCreated} />
            </div>
          </div>
        )}
        
        {/* View Tasks & Analytics View */}
        {activeTab === 'view' && (
          <div className="analysis-view">
            <div className="task-list-wrapper">
              <h2>Your Tasks</h2>
              <TaskList 
                onSelect={setSelectedTaskId} 
                selectedTaskId={selectedTaskId}
                refreshTrigger={refreshTrigger}
              />
            </div>
            
            <div className="analytics-wrapper">
              <TaskAnalytics taskId={selectedTaskId} />
            </div>
          </div>
        )}
      </div>
      
      <footer className="app-footer">
        <p>Car Sales Analytics Dashboard © 2025</p>
      </footer>
    </div>
  );
}

export default App;