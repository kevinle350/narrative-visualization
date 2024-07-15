// Load the dataset and create the visualization
d3.json("https://raw.githubusercontent.com/vega/vega-datasets/master/data/cars.json").then(data => {
    // Filter out data points with null MPG or Horsepower
    data = data.filter(d => d["Horsepower"] != null && d["Miles_per_Gallon"] != null);

    const width = 800;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 50, left: 60 };
    let currentScene = 0;

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Horsepower"])])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Miles_per_Gallon"])])
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    setupScene(svg, xScale, yScale, data);

    const scenes = [
        () => setupScene(svg, xScale, yScale, data, "All"),
        () => setupScene(svg, xScale, yScale, data, "HighMPG"),
        () => setupScene(svg, xScale, yScale, data, "HighHP")
    ];

    d3.select("#nextButton").on("click", () => {
        currentScene = (currentScene + 1) % scenes.length;
        svg.selectAll("*").remove(); 
        scenes[currentScene]();      
    });
});

function setupScene(svg, xScale, yScale, data, filter = "All") {
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 10, right: 10, bottom: 50, left: 60 };

    let filteredData = data;
    let annotations = [];
    if (filter === "HighMPG") {
        filteredData = data.filter(d => d["Miles_per_Gallon"] > 30);
        annotations = [{ x: 300, y: 100, text: "Cars with MPG > 30" }];
    } else if (filter === "HighHP") {
        filteredData = data.filter(d => d["Horsepower"] > 150);
        annotations = [{ x: 500, y: 500, text: "Cars with Horsepower > 150" }];
    } else {
        annotations = [
            { x: 50, y: 40, text: "High MPG, Low Horsepower" },
            { x: 200, y: 250, text: "Average MPG, Average Horsepower" },
            { x: 500, y: 550, text: "Low MPG, High Horsepower" }
        ];
    }

    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(xScale));
    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(yScale));

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
