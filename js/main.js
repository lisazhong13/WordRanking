function createNetworkGraph() {
    const width = document.getElementById('network-chart').clientWidth;
    const height = document.getElementById('network-chart').clientHeight;

    const svg = d3.select("#network-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // create force simulation
    const simulation = d3.forceSimulation(networkData.nodes)
        .force("link", d3.forceLink(networkData.links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // draw links
    const link = svg.append("g")
        .selectAll("line")
        .data(networkData.links)
        .join("line")
        .style("stroke", "#999")
        .style("stroke-opacity", 0.6)
        .style("stroke-width", d => Math.sqrt(d.value));

    // create nodes
    const node = svg.append("g")
        .selectAll("circle")
        .data(networkData.nodes)
        .join("circle")
        .attr("r", d => d.size)
        .style("fill", d => d.group === 1 ? "#ff7675" : d.group === 2 ? "#74b9ff" : "#55efc4")
        .call(drag(simulation));

    // add node drag function
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // 更新节点和连接线位置
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

// 
function createTimelineChart() {
    const width = document.getElementById('timeline-chart').clientWidth;
    const height = document.getElementById('timeline-chart').clientHeight;
    
    const timelineData = [
        { date: "2023-01", value: 45 },
        { date: "2023-02", value: 62 },
        { date: "2023-03", value: 78 },
        { date: "2023-04", value: 95 },
        { date: "2023-05", value: 130 }
    ];

    const svg = d3.select("#timeline-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleTime()
        .domain(d3.extent(timelineData, d => new Date(d.date)))
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(timelineData, d => d.value)])
        .range([innerHeight, 0]);

    const line = d3.line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.value));

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // add X axis
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

    // add Y axis
    g.append("g")
        .call(d3.axisLeft(y));

    // draw line
    g.append("path")
        .datum(timelineData)
        .attr("fill", "none")
        .attr("stroke", "#3498db")
        .attr("stroke-width", 2)
        .attr("d", line);
}

/**
 * Initialize the page when DOM is fully loaded
 * - Sets up page navigation
 * - Sets up intersection observer for lazy loading charts
 */
document.addEventListener('DOMContentLoaded', () => {
    setupPageNavigation();
    setupIntersectionObserver();
    // 等待所有资源加载完成
    window.addEventListener('load', () => {
        // 显示页面容器
        document.querySelector('.page-container').style.opacity = '1';
        // 显示文字框
        document.querySelector('#page1 .title-box').style.opacity = '1';
    });
});

/**
 * Sets up the page navigation system
 * - Handles page scrolling
 * - Updates navigation dots
 * - Manages scroll events
 */
function setupPageNavigation() {
    // Get DOM elements
    const pages = document.querySelectorAll('.page');
    const navDots = document.querySelectorAll('.page-nav li');
    const pageContainer = document.querySelector('.page-container');
    let currentPage = 0;
    let isScrolling = false;

    /**
     * Scrolls to a specific page
     * @param {number} index - The index of the target page
     */
    function scrollToPage(index) {
        if (index >= 0 && index < pages.length) {
            isScrolling = true;
            currentPage = index;
            // Smooth scroll to target page
            pageContainer.scrollTo({
                top: index * window.innerHeight,
                behavior: 'smooth'
            });
            updateActiveDot();
            // Reset scrolling flag after animation
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }

    /**
     * Updates the active state of navigation dots
     */
    function updateActiveDot() {
        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
    }

    /**
     * Handles scroll events
     * - Calculates current page based on scroll position
     * - Updates navigation dots accordingly
     */
    function handleScroll() {
        if (isScrolling) return;
        const scrollPosition = pageContainer.scrollTop;
        const pageHeight = window.innerHeight;
        const newPage = Math.round(scrollPosition / pageHeight);

        if (newPage !== currentPage) {
            currentPage = newPage;
            updateActiveDot();
        }
    }

    // Add event listeners
    pageContainer.addEventListener('scroll', handleScroll);

    // Setup click handlers for navigation dots
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => scrollToPage(index));
    });

    // Initialize navigation dots
    updateActiveDot();
}

/**
 * Sets up intersection observer for lazy loading charts
 * - Monitors when pages enter viewport
 * - Initializes charts when their container becomes visible
 */
function setupIntersectionObserver() {
    const options = {
        root: null,        // Use viewport as root
        rootMargin: '0px', // No margin
        threshold: 0.1     // Trigger when 10% visible
    };

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Initialize appropriate chart based on page ID
                const id = entry.target.id;
                if (id === 'page4') {
                    createWorldMap();
                } else if (id === 'page5') {
                    createTimeline();
                } else if (id === 'page6') {
                    createScatterplot();
                }
                // Stop observing after initialization
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Start observing all pages
    document.querySelectorAll('.page').forEach(page => {
        observer.observe(page);
    });
}

// resize when window is resized
window.addEventListener('resize', () => {
    document.getElementById('network-chart').innerHTML = '';
    document.getElementById('timeline-chart').innerHTML = '';
    createNetworkGraph();
    createTimelineChart();
});

document.addEventListener('scroll', () => {
    const page1 = document.getElementById('page1');
    const background = page1.querySelector('.background-image');
    const scrollPosition = window.scrollY;

    // 只在第一页时应用效果
    if (page1.getBoundingClientRect().top <= 0 && page1.getBoundingClientRect().bottom > 0) {
        background.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    }
});