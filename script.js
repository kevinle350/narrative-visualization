d3.json("https://raw.githubusercontent.com/vega/vega-datasets/master/data/cars.json").then(data => {
    data = data.filter(d => d["Horsepower"] != null && d["Miles_per_Gallon"] != null);

    const container = d3.select("#visualization");
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };

    function updateDimensions() {
        const width = container.node().clientWidth;
        const height = container.node().clientHeight;

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d["Horsepower"])])
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d["Miles_per_Gallon"])])
            .range([height - margin.bottom, margin.top]);

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const scenes = [
            () => setupScene(svg, xScale, yScale, data, "All", width, height, margin),
            () => setupScene(svg, xScale, yScale, data, "HighMPG", width, height, margin),
            () => setupScene(svg, xScale, yScale, data, "HighHP", width, height, margin)
        ];

        let currentScene = 0;
        scenes[currentScene]();

        d3.select("#nextButton").on("click", () => {
            currentScene = (currentScene + 1) % scenes.length;
            svg.selectAll("*").remove(); 
            d3.select(".tooltip").remove(); 
            scenes[currentScene]();      
        });
    }

    window.addEventListener('resize', () => {
        container.select("svg").remove(); 
        updateDimensions();
    });

    updateDimensions();
});

function setupScene(svg, xScale, yScale, data, filter, width, height, margin) {
    svg.selectAll("*").remove();

    let filteredData = data;
    let annotations = [];
    if (filter === "HighMPG") {
        filteredData = data.filter(d => d["Miles_per_Gallon"] > 30);
        annotations = [{ x: 70, y: 40, text: "Cars with MPG > 30" }];
    } else if (filter === "HighHP") {
        filteredData = data.filter(d => d["Horsepower"] > 150);
        annotations = [{ x: 200, y: 500, text: "Cars with Horsepower > 150" }];
    } else {
        annotations = [
            { x: 40, y: 40, text: "High MPG, Low Horsepower" },
            { x: 120, y: 250, text: "Average MPG, Average Horsepower" },
            { x: 200, y: 500, text: "Low MPG, High Horsepower" }
        ];
    }

    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(xScale));
    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(yScale));

    svg.append("text")
       .attr("class", "x label")
       .attr("text-anchor", "end")
       .attr("x", width / 2)
       .attr("y", height - 10)
       .text("Horsepower");

    svg.append("text")
       .attr("class", "y label")
       .attr("text-anchor", "end")
       .attr("y", 15)
       .attr("x", -height / 2)
       .attr("dy", ".75em")
       .attr("transform", "rotate(-90)")
       .text("Miles per Gallon");

    svg.selectAll("circle")
       .data(filteredData)
       .enter()
       .append("circle")
       .attr("cx", d => xScale(d["Horsepower"]))
       .attr("cy", d => yScale(d["Miles_per_Gallon"]))
       .attr("r", 5)
       .attr("fill", filter === "HighMPG" ? "orange" : filter === "HighHP" ? "green" : "steelblue");

    svg.selectAll("text.annotation")
       .data(annotations)
       .enter()
       .append("text")
       .attr("class", "annotation")
       .attr("x", d => xScale(d.x))
       .attr("y", d => yScale(d.y))
       .attr("text-anchor", "start")
       .attr("font-size", "12px")
       .attr("fill", "black")
       .text(d => d.text);

    setupTooltips(svg, filteredData);
}

function setupTooltips(svg, data) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("circle")
       .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Name: ${d.Name}<br>Horsepower: ${d.Horsepower}<br>MPG: ${d.Miles_per_Gallon}`)
                   .style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
       .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}
