// File: src/components/KnowledgeGraph.jsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const KnowledgeGraph = ({ progress }) => {
  const d3Container = useRef(null);
  
  useEffect(() => {
    if (progress && d3Container.current) {
      renderKnowledgeGraph();
    }
  }, [progress]);
  
  const renderKnowledgeGraph = () => {
    // Clear previous rendering
    d3.select(d3Container.current).selectAll("*").remove();
    
    // Sample knowledge graph data structure
    // In a real app, this would be generated from the progress data
    const knowledgeData = transformProgressToGraphData(progress);
    
    const width = 600;
    const height = 400;
    
    // Create SVG
    const svg = d3.select(d3Container.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("class", "knowledge-graph-svg");
      
    // Create a force simulation
    const simulation = d3.forceSimulation(knowledgeData.nodes)
      .force("link", d3.forceLink(knowledgeData.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));
      
    // Create links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(knowledgeData.links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));
      
    // Create nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(knowledgeData.nodes)
      .enter()
      .append("g");
      
    // Add circles to nodes
    node.append("circle")
      .attr("r", d => getNodeRadius(d))
      .attr("fill", d => getNodeColor(d))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
        
    // Add labels to nodes
    node.append("text")
      .text(d => d.name)
      .attr("font-size", 10)
      .attr("dx", 15)
      .attr("dy", 4)
      .attr("fill", "#333");
      
    // Add tooltips
    node.append("title")
      .text(d => `${d.name}\nMastery: ${d.mastery}%`);
      
    // Update positions
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
        
      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };
  
  // Helper function to transform progress data into graph structure
  const transformProgressToGraphData = (progress) => {
    const nodes = [];
    const links = [];
    
    // This is a simplified example - in a real app, this would process 
    // the actual progress data structure
    if (progress?.topics) {
      // Create nodes for each topic
      Object.entries(progress.topics).forEach(([topicId, topicData]) => {
        nodes.push({
          id: topicId,
          name: topicData.name,
          type: 'topic',
          mastery: topicData.mastery || 0,
          status: topicData.status || 'not-started'
        });
        
        // Add prerequisite relationships
        if (topicData.prerequisites) {
          topicData.prerequisites.forEach(prereqId => {
            links.push({
              source: prereqId,
              target: topicId,
              value: 1
            });
          });
        }
      });
    }
    
    // Add some default nodes if none exist (for demo purposes)
    if (nodes.length === 0) {
      nodes.push(
        { id: "basics", name: "Programming Basics", type: "topic", mastery: 85, status: "completed" },
        { id: "variables", name: "Variables", type: "topic", mastery: 90, status: "completed" },
        { id: "conditionals", name: "Conditionals", type: "topic", mastery: 70, status: "in-progress" },
        { id: "loops", name: "Loops", type: "topic", mastery: 60, status: "in-progress" },
        { id: "functions", name: "Functions", type: "topic", mastery: 40, status: "in-progress" },
        { id: "objects", name: "Objects", type: "topic", mastery: 30, status: "not-started" },
        { id: "arrays", name: "Arrays", type: "topic", mastery: 25, status: "not-started" }
      );
      
      links.push(
        { source: "basics", target: "variables", value: 2 },
        { source: "variables", target: "conditionals", value: 2 },
        { source: "variables", target: "loops", value: 2 },
        { source: "conditionals", target: "functions", value: 2 },
        { source: "loops", target: "functions", value: 2 },
        { source: "functions", target: "objects", value: 2 },
        { source: "functions", target: "arrays", value: 2 }
      );
    }
    
    return { nodes, links };
  };
  
  const getNodeRadius = (node) => {
    // Size based on mastery level
    return 10 + (node.mastery / 10);
  };
  
  const getNodeColor = (node) => {
    // Color based on status
    switch (node.status) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'in-progress':
        return '#2196F3'; // Blue
      case 'recommended':
        return '#FF9800'; // Orange
      case 'not-started':
      default:
        return '#9E9E9E'; // Gray
    }
  };
  
  return (
    <div className="knowledge-graph-container">
      <div className="knowledge-graph" ref={d3Container} />
      <div className="graph-legend">
        <div className="legend-item">
          <span className="color-indicator completed"></span>
          <span className="legend-text">Mastered</span>
        </div>
        <div className="legend-item">
          <span className="color-indicator in-progress"></span>
          <span className="legend-text">In Progress</span>
        </div>
        <div className="legend-item">
          <span className="color-indicator recommended"></span>
          <span className="legend-text">Recommended</span>
        </div>
        <div className="legend-item">
          <span className="color-indicator not-started"></span>
          <span className="legend-text">Not Started</span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;