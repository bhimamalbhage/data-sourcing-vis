import { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ onTaskCreated }) => {
  const [name, setName] = useState('');
  const [startYear, setStartYear] = useState(2023);
  const [endYear, setEndYear] = useState(2025);
  const [brands, setBrands] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const brandArray = brands.split(',').map(b => b.trim());
    const res = await axios.post('http://localhost:8000/tasks', {
      name,
      start_year: startYear,
      end_year: endYear,
      brands: brandArray
    });
    onTaskCreated(res.data);
    setName('');
    setBrands('');
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Task Name" required />
      <input type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="Start Year" />
      <input type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} placeholder="End Year" />
      <input value={brands} onChange={(e) => setBrands(e.target.value)} placeholder="Brands (comma-separated)" />
      <button type="submit">Create Task</button>
    </form>
  );
};

export default TaskForm;