// feel free to change any part of the code
class Scatterplot {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // Set up the SVG drawing area
        vis.width = document.getElementById(vis.containerId).clientWidth;
        vis.height = document.getElementById(vis.containerId).clientHeight;

        // Set margins
        vis.margin = { top: 20, right: 20, bottom: 40, left: 50 };
        vis.innerWidth = vis.width - vis.margin.left - vis.margin.right;
        vis.innerHeight = vis.height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.containerId)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // Create group for the visualization
        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Initialize scales
        vis.x = d3.scaleLinear()
            .range([0, vis.innerWidth]);

        vis.y = d3.scaleLinear()
            .range([vis.innerHeight, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.x);
        vis.yAxis = d3.axisLeft(vis.y);

        // Add axes groups
        vis.xAxisGroup = vis.g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.innerHeight})`);

        vis.yAxisGroup = vis.g.append("g")
            .attr("class", "y-axis");

        // Initialize visualization
        this.render();
    }

    render() {
        const vis = this;

        // Clear existing content
        vis.g.selectAll("*").remove();

        // Update scales
        vis.x.domain([0, d3.max(vis.data, d => d.rank)]);
        vis.y.domain([0, d3.max(vis.data, d => d.frequency)]);

        // Update axes
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);

        // Draw points
        vis.g.selectAll("circle")
            .data(vis.data)
            .join("circle")
            .attr("cx", d => vis.x(d.rank))
            .attr("cy", d => vis.y(d.frequency))
            .attr("r", 5)
            .attr("fill", "#3498db")
            .attr("opacity", 0.6);

        // Add axis labels
        vis.g.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.innerWidth / 2)
            .attr("y", vis.innerHeight + 35)
            .attr("text-anchor", "middle")
            .text("Rank");

        vis.g.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.innerHeight / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .text("Frequency");
    }
}
