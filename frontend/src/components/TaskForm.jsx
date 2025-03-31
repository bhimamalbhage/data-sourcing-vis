import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ onTaskCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    startYear: 2023,
    endYear: 2025,
    priceMin: '',
    priceMax: '',
    location: '',
    // Companies from Source A
    sourceACompanies: {
      Honda: false,
      Toyota: false,
      Ford: false,
      Tesla: false,
      BMW: false
    },
    // Companies from Source B
    sourceBCompanies: {
      Honda: false,
      Toyota: false,
      Ford: false,
      Tesla: false,
      BMW: false
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyChange = (source, company) => {
    const field = source === 'A' ? 'sourceACompanies' : 'sourceBCompanies';
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [company]: !prev[field][company]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract selected companies from both sources
      const sourceABrands = Object.keys(formData.sourceACompanies)
        .filter(brand => formData.sourceACompanies[brand]);
      
      const sourceBBrands = Object.keys(formData.sourceBCompanies)
        .filter(brand => formData.sourceBCompanies[brand]);
      
      // Create payload for API
      const payload = {
        name: formData.name,
        start_year: parseInt(formData.startYear),
        end_year: parseInt(formData.endYear),
        source_a_brands: sourceABrands,
        source_b_brands: sourceBBrands,
        price_range: {
          min: formData.priceMin ? parseFloat(formData.priceMin) : null,
          max: formData.priceMax ? parseFloat(formData.priceMax) : null
        },
        location: formData.location || null
      };
      
      const response = await axios.post('http://localhost:8000/tasks', payload);
      
      // Reset form
      setFormData({
        name: '',
        startYear: 2023,
        endYear: 2025,
        priceMin: '',
        priceMax: '',
        location: '',
        sourceACompanies: {
          Honda: false,
          Toyota: false,
          Ford: false,
          Tesla: false,
          BMW: false
        },
        sourceBCompanies: {
          Honda: false,
          Toyota: false,
          Ford: false,
          Tesla: false,
          BMW: false
        }
      });
      
      // Notify parent component
      onTaskCreated(response.data);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Common styling for checkbox labels
  const checkboxStyle = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '1rem',
    marginBottom: '0.5rem',
    cursor: 'pointer'
  };

  const companies = ['Honda', 'Toyota', 'Ford', 'Tesla', 'BMW'];

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {/* <h2>Create New Data Task</h2> */}
      
      {/* Task Name */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">Task Name</label>
        <input
          id="name"
          type="text"
          name="name"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter a descriptive name for your task"
          required
        />
      </div>
      
      {/* Year Range */}
      <div className="form-section">
        <h3>Year Range</h3>
        <div className="input-row">
          <div className="form-group">
            <label htmlFor="startYear" className="form-label">Start Year</label>
            <input
              id="startYear"
              type="number"
              name="startYear"
              className="form-input"
              value={formData.startYear}
              onChange={handleChange}
              min="2020"
              max="2025"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endYear" className="form-label">End Year</label>
            <input
              id="endYear"
              type="number"
              name="endYear"
              className="form-input"
              value={formData.endYear}
              onChange={handleChange}
              min="2020"
              max="2025"
            />
          </div>
        </div>
      </div>
      
      {/* Source A Companies */}
      <div className="form-section">
        <h3>Source A Companies</h3>
        <div className="checkbox-group">
          {companies.map(company => (
            <label key={`sourceA-${company}`} style={checkboxStyle}>
              <input
                type="checkbox"
                checked={formData.sourceACompanies[company]}
                onChange={() => handleCompanyChange('A', company)}
                style={{ marginRight: '0.5rem' }}
              />
              {company}
            </label>
          ))}
        </div>
      </div>
      
      {/* Source B Companies */}
      <div className="form-section">
        <h3>Source B Companies</h3>
        <div className="checkbox-group">
          {companies.map(company => (
            <label key={`sourceB-${company}`} style={checkboxStyle}>
              <input
                type="checkbox"
                checked={formData.sourceBCompanies[company]}
                onChange={() => handleCompanyChange('B', company)}
                style={{ marginRight: '0.5rem' }}
              />
              {company}
            </label>
          ))}
        </div>
      </div>
      
      {/* Price Range */}
      <div className="form-section">
        <h3>Price Range</h3>
        <div className="input-row">
          <div className="form-group">
            <label htmlFor="priceMin" className="form-label">Minimum Price ($)</label>
            <input
              id="priceMin"
              type="number"
              name="priceMin"
              className="form-input"
              value={formData.priceMin}
              onChange={handleChange}
              min="0"
              placeholder="Min price"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="priceMax" className="form-label">Maximum Price ($)</label>
            <input
              id="priceMax"
              type="number"
              name="priceMax"
              className="form-input"
              value={formData.priceMax}
              onChange={handleChange}
              min="0"
              placeholder="Max price"
            />
          </div>
        </div>
      </div>
      
      {/* Location */}
      <div className="form-section">
        <h3>Location</h3>
        <div className="form-group">
          <label htmlFor="location" className="form-label">Select Location</label>
          <select
            id="location"
            name="location"
            className="form-input"
            value={formData.location}
            onChange={handleChange}
          >
            <option value="">All Locations</option>
            <option value="Chicago">Chicago</option>
            <option value="Dallas">Dallas</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="form-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;