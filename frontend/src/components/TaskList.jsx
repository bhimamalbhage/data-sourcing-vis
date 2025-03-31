import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TaskList = ({ onSelect, selectedTaskId, refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks initially and whenever refreshTrigger changes
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  // Set up polling for task status updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks(false); // Don't show loading state for polling
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const response = await axios.get('http://localhost:8000/tasks');
      console.log("Fetched tasks:", response.data);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchTasks();
  };

  // Format timestamp to a readable date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in_progress';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          {isLoading && <span style={{ fontSize: '0.8rem', color: '#666' }}>Loading...</span>}
        </div>
        <button
          onClick={handleRefresh}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#3498db',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ marginRight: '0.25rem' }}>↻</span> Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#888' }}>
          <p>No tasks found.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Create a new task to get started</p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li 
              key={task.id} 
              onClick={() => onSelect(task.id)}
              className={`task-item ${selectedTaskId === task.id ? 'selected' : ''}`}
            >
              <div className="task-details">
                <span className="task-name">{task.name}</span>
                <span className="task-info">Created: {formatDate(task.created_at)}</span>
              </div>
              <span className={`task-status ${getStatusClass(task.status)}`}>
                {task.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;