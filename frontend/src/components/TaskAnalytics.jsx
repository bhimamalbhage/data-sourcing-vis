import { useEffect, useState } from "react";
import * as d3 from "d3";
import axios from "axios";

const TaskAnalytics = ({ taskId }) => {
  const [task, setTask] = useState(null);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [yearRange, setYearRange] = useState([2022, 2025]);
  const [brandFilter, setBrandFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch task data when taskId changes
  useEffect(() => {
    if (!taskId) {
      setTask(null);
      setFilteredRecords([]);
      return;
    }

    const fetchTask = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:8000/tasks/${taskId}`
        );
        console.log("Fetched task data:", response.data);

        if (response.data.records && response.data.records.length > 0) {
          // Extract available years from the data to set initial year range
          const years = response.data.records.map((r) =>
            parseInt(r.date_of_sale.slice(0, 4))
          );
          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);
          setYearRange([minYear, maxYear]);
        }

        setTask(response.data);
        setFilteredRecords(response.data.records || []);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Failed to load task data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Apply filters when year range, brand filter, or task changes
  useEffect(() => {
    if (task && task.records) {
      const [start, end] = yearRange;
      const filtered = task.records.filter((r) => {
        const year = parseInt(r.date_of_sale.slice(0, 4));
        return (
          year >= start &&
          year <= end &&
          (brandFilter === "" ||
            r.company.toLowerCase().includes(brandFilter.toLowerCase()))
        );
      });
      setFilteredRecords(filtered);
    }
  }, [yearRange, brandFilter, task]);

  // Render charts when filtered records change
  useEffect(() => {
    if (filteredRecords.length > 0) {
      renderLineChart();
      renderBarChart();
      renderPieChart();
      renderAvgPriceBarChart();
    }
  }, [filteredRecords]);

  // Clean up charts when component unmounts
  useEffect(() => {
    return () => {
      d3.select("#lineChart").selectAll("*").remove();
      d3.select("#barChart").selectAll("*").remove();
    };
  }, []);

  const renderLineChart = () => {
    // Clear previous chart
    d3.select("#lineChart").selectAll("*").remove();

    // Group records by year and count them
    const salesByYear = d3.rollup(
      filteredRecords,
      (v) => v.length,
      (d) => d.date_of_sale.slice(0, 4)
    );

    const data = Array.from(salesByYear, ([year, count]) => ({
      year: +year,
      count,
    })).sort((a, b) => a.year - b.year);

    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3
      .select("#lineChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X and Y scales
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) * 1.1])
      .nice()
      .range([height, 0]);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .call((g) => g.select(".domain").attr("stroke", "#999"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#ddd"))
      .call((g) =>
        g.selectAll("text").attr("font-size", "10px").attr("fill", "#666")
      );

    // Add Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").attr("stroke", "#999"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#ddd"))
      .call((g) =>
        g.selectAll("text").attr("font-size", "10px").attr("fill", "#666")
      );

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#333")
      .text("Sales Records by Year");

    // Add X axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#666")
      .text("Year");

    // Add Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#666")
      .text("Number of Sales");

    // Add gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(""))
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "#f0f0f0")
          .attr("stroke-opacity", 0.7)
      );

    // Add line
    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3498db")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add circles
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.count))
      .attr("r", 5)
      .attr("fill", "#3498db")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7).attr("fill", "#2980b9");

        // Add tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.year))
          .attr("y", y(d.count) - 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .text(`${d.year}: ${d.count} sales`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("fill", "#3498db");

        // Remove tooltip
        svg.selectAll(".tooltip").remove();
      });
  };

  const renderBarChart = () => {
    // Clear previous chart
    d3.select("#barChart").selectAll("*").remove();

    // Group records by company and sum prices
    const salesByCompany = d3.rollup(
      filteredRecords,
      (v) => d3.sum(v, (d) => d.price),
      (d) => d.company
    );

    const data = Array.from(salesByCompany, ([company, total]) => ({
      company,
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
    })).sort((a, b) => b.total - a.total); // Sort by total in descending order

    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3
      .select("#barChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X and Y scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.company))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total) * 1.1]) // Add 10% padding
      .nice()
      .range([height, 0]);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select(".domain").attr("stroke", "#999"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#ddd"))
      .call((g) =>
        g
          .selectAll("text")
          .attr("font-size", "10px")
          .attr("fill", "#666")
          .attr("transform", "rotate(-40)")
          .attr("text-anchor", "end")
          .attr("dx", "-0.8em")
          .attr("dy", "0.15em")
      );

    // Add Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y).tickFormat((d) => `$${d.toLocaleString()}`))
      .call((g) => g.select(".domain").attr("stroke", "#999"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#ddd"))
      .call((g) =>
        g.selectAll("text").attr("font-size", "10px").attr("fill", "#666")
      );

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#333")
      .text("Total Sales by Company");

    // Add X axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 60)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#666")
      .text("Company");

    // Add Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#666")
      .text("Total Sales ($)");

    // Add gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(""))
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "#f0f0f0")
          .attr("stroke-opacity", 0.7)
      );

    // Add bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.company))
      .attr("y", (d) => y(d.total))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.total))
      .attr("fill", "#2ecc71")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#27ae60");

        // Add tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.company) + x.bandwidth() / 2)
          .attr("y", y(d.total) - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .text(`$${d.total.toLocaleString()}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#2ecc71");
        svg.selectAll(".tooltip").remove();
      });
  };

  const renderPieChart = () => {
    // Clear previous chart
    d3.select("#pieChart").selectAll("*").remove();

    // Group sales by customer_type
    const salesByType = d3.rollup(
      filteredRecords,
      (v) => v.length,
      (d) => d.customer_type
    );

    const data = Array.from(salesByType, ([type, count]) => ({ type, count }));

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Create SVG
    const svg = d3
      .select("#pieChart")
      .append("svg")
      .attr("width", width + 150) // Extra width for legend
      .attr("height", height + 40)
      .append("g")
      .attr("transform", `translate(${radius},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const pie = d3.pie().value((d) => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Draw pie slices
    svg
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.type))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1.05)");

        // Show tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("text-anchor", "middle")
          .attr("y", -radius - 10)
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .text(`${d.data.type}: ${d.data.count} sales`);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1)");
        svg.selectAll(".tooltip").remove();
      });

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${radius + 20}, ${-height / 2})`);

    data.forEach((d, i) => {
      const yOffset = i * 20;

      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", yOffset)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(d.type));

      legend
        .append("text")
        .attr("x", 18)
        .attr("y", yOffset + 10)
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .text(d.type);
    });
  };

  const renderAvgPriceBarChart = () => {
    d3.select("#avgPriceBarChart").selectAll("*").remove();

    const avgByBrand = d3.rollup(
      filteredRecords,
      (v) => d3.mean(v, (d) => d.price),
      (d) => d.company
    );

    const data = Array.from(avgByBrand, ([company, avg]) => ({
      company,
      avg: Math.round(avg),
    }));

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select("#avgPriceBarChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.company))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.avg) * 1.1])
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .call(d3.axisLeft(y).tickFormat((d) => `$${d.toLocaleString()}`));

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.company))
      .attr("y", (d) => y(d.avg))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.avg))
      .attr("fill", "#9b59b6")
      .append("title")
      .text((d) => `$${d.avg}`);
  };

  // Handle year range change
  const handleYearStartChange = (e) => {
    const value = parseInt(e.target.value);
    setYearRange([value, yearRange[1]]);
  };

  const handleYearEndChange = (e) => {
    const value = parseInt(e.target.value);
    setYearRange([yearRange[0], value]);
  };

  // Handle brand filter change
  const handleBrandFilterChange = (e) => {
    setBrandFilter(e.target.value);
  };

  return (
    <div className="analytics-container">
      <h2>Data Analytics</h2>

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading data...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            color: "red",
            padding: "1rem",
            background: "#fff1f0",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {!taskId && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p className="empty-state-text">Select a task to view analytics</p>
          <p className="empty-state-subtext">
            Choose a task from the list to see detailed visualization of the
            data
          </p>
        </div>
      )}

      {taskId &&
        task &&
        task.records &&
        task.records.length === 0 &&
        !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">📉</div>
            <p className="empty-state-text">No data available</p>
            <p className="empty-state-subtext">
              This task doesn't contain any records to visualize
            </p>
          </div>
        )}

      {taskId &&
        task &&
        task.records &&
        task.records.length > 0 &&
        !loading && (
          <>
            <div className="filter-controls">
              <div className="form-group">
                <label className="form-label">Start Year:</label>
                <input
                  type="number"
                  className="form-input"
                  value={yearRange[0]}
                  onChange={handleYearStartChange}
                  min="2020"
                  max="2025"
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Year:</label>
                <input
                  type="number"
                  className="form-input"
                  value={yearRange[1]}
                  onChange={handleYearEndChange}
                  min="2020"
                  max="2025"
                />
              </div>

              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Brand Filter:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by brand name"
                  value={brandFilter}
                  onChange={handleBrandFilterChange}
                />
              </div>
            </div>

            <div
              className="record-info"
              style={{
                marginBottom: "1rem",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              Showing {filteredRecords.length} of {task.records.length} records
            </div>

            {filteredRecords.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "2rem", color: "#888" }}
              >
                <p>No records match your current filters</p>
                <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  Try adjusting your year range or brand filter
                </p>
              </div>
            ) : (
              <div className="charts-container">
                {/* Top Row */}
                <div className="chart-row">
                  <div className="chart-wrapper">
                    <h3 className="chart-title">Sales Records by Year</h3>
                    <div
                      id="lineChart"
                      style={{ width: "100%", height: "300px" }}
                    ></div>
                  </div>
                  <div className="chart-wrapper">
                    <h3 className="chart-title">Total Sales by Company</h3>
                    <div
                      id="barChart"
                      style={{ width: "100%", height: "400px" }}
                    ></div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="chart-row">
                  <div className="chart-wrapper">
                    <h3 className="chart-title">
                      Sales Share by Customer Type
                    </h3>
                    <div
                      id="pieChart"
                      style={{ width: "100%", height: "300px" }}
                    ></div>
                  </div>
                  <div className="chart-wrapper">
                    <h3 className="chart-title">Average Price per Brand</h3>
                    <div
                      id="avgPriceBarChart"
                      style={{ width: "100%", height: "300px" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default TaskAnalytics;
