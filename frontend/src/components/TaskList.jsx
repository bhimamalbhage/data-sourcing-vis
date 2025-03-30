import { useEffect, useState } from 'react';
import axios from 'axios';

const TaskList = ({ onSelect }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const interval = setInterval(fetchTasks, 3000);
    fetchTasks();
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get('http://localhost:8000/tasks');
    setTasks(res.data);
  };

  return (
    <div>
      <h3>Tasks</h3>
      <ul>
        {tasks.map(task => (
          <li key={task.id} onClick={() => onSelect(task.id)}>
            <strong>{task.name}</strong> — <em>{task.status}</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;