d3.json("https://raw.githubusercontent.com/vega/vega-datasets/master/data/cars.json").then(data => {
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
    if (filter === "HighMPG") {
        filteredData = data.filter(d => d["Miles_per_Gallon"] > 30);
    } else if (filter === "HighHP") {
        filteredData = data.filter(d => d["Horsepower"] > 150);
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