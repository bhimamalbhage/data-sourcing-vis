import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

const TaskAnalytics = ({ taskId }) => {
  const [task, setTask] = useState(null);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [yearRange, setYearRange] = useState([2022, 2025]);
  const [brandFilter, setBrandFilter] = useState('');

  useEffect(() => {
    if (taskId) {
      axios.get(`http://localhost:8000/tasks/${taskId}`).then(res => {
        setTask(res.data);
        setFilteredRecords(res.data.records);
      });
    }
  }, [taskId]);

  useEffect(() => {
    if (task && task.records) {
      const [start, end] = yearRange;
      const filtered = task.records.filter(r => {
        const year = parseInt(r.date_of_sale.slice(0, 4));
        return (
          year >= start &&
          year <= end &&
          (brandFilter === '' || r.company.toLowerCase().includes(brandFilter.toLowerCase()))
        );
      });
      setFilteredRecords(filtered);
    }
  }, [yearRange, brandFilter, task]);

  useEffect(() => {
    if (filteredRecords.length > 0) {
      renderLineChart();
      renderBarChart();
    }
  }, [filteredRecords]);

  const renderLineChart = () => {
    d3.select("#lineChart").selectAll("*").remove();

    const salesByYear = d3.rollup(
      filteredRecords,
      v => v.length,
      d => d.date_of_sale.slice(0, 4)
    );

    const data = Array.from(salesByYear, ([year, count]) => ({
      year: +year,
      count
    })).sort((a, b) => a.year - b.year);

    const svg = d3.select("#lineChart")
      .append("svg")
      .attr("width", 500)
      .attr("height", 300);

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([margin.left, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).nice()
      .range([height, margin.top]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.count));

    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("transform", `translate(${margin.left},0)`);

    svg.append("g")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .attr("transform", `translate(0,${height})`);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
  };

  const renderBarChart = () => {
    d3.select("#barChart").selectAll("*").remove();

    const salesByCompany = d3.rollup(
      filteredRecords,
      v => d3.sum(v, d => d.price),
      d => d.company
    );

    const data = Array.from(salesByCompany, ([company, total]) => ({
      company,
      total
    }));

    const svg = d3.select("#barChart")
      .append("svg")
      .attr("width", 500)
      .attr("height", 300);

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .domain(data.map(d => d.company))
      .range([margin.left, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total)]).nice()
      .range([height, margin.top]);

    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("transform", `translate(${margin.left},0)`);

    svg.append("g")
      .call(d3.axisBottom(x))
      .attr("transform", `translate(0,${height})`)
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.company))
      .attr("y", d => y(d.total))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.total))
      .attr("fill", "teal");
  };

  return (
    <div>
      <h3>Analytics</h3>
      {task ? (
        <>
          <div style={{ marginBottom: 10 }}>
            <label>Year Range: </label>
            <input type="number" value={yearRange[0]} onChange={e => setYearRange([+e.target.value, yearRange[1]])} />
            <input type="number" value={yearRange[1]} onChange={e => setYearRange([yearRange[0], +e.target.value])} />
            <input placeholder="Filter by Brand" value={brandFilter} onChange={e => setBrandFilter(e.target.value)} />
          </div>
          <div id="lineChart"></div>
          <div id="barChart" style={{ marginTop: 40 }}></div>
        </>
      ) : (
        <p>Select a task to see analytics.</p>
      )}
    </div>
  );
};

export default TaskAnalytics;
