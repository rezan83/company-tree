const dims = { height: 600, width: 800 };

const svg = d3
    .select(".canvas")
    .append("svg")
    .attr("width", dims.width + 200)
    .attr("height", dims.height + 200);

const graph = svg.append("g").attr("transform", "translate(50, 50)");

const stratify = d3
    .stratify()
    .id((d) => d.name)
    .parentId((d) => d.parent);

const tree = d3.tree().size([dims.width, dims.height]);

function observeData(collection, updateChart) {
    db.collection(collection).onSnapshot((response) => {
        response.docChanges().forEach((change) => {
            let doc = { ...change.doc.data(), id: change.doc.id };
            switch (change.type) {
                case "added":
                    data.push(doc);
                    break;
                case "modified":
                    let index = data.findIndex((d) => d.id === doc.id);
                    data[index] = doc;
                    break;
                case "removed":
                    data = data.filter((d) => d.id !== doc.id);
                    break;
                default:
                    break;
            }
        });

        updateChart(data);
    });
}

function updateChart(data) {
    let treeData = tree(stratify(data));
    let linksData = treeData.links();
    let nodesData = treeData.descendants();

    let colors = d3.scaleOrdinal(d3.schemeAccent);
    colors.domain(data.map((d) => d.department));

    // delete old graph
    // graph.selectAll(".link").remove();
    graph.selectAll(".node").remove();

    // initialize liks pathes with data
    const links = graph.selectAll(".link").data(linksData);

    // create new (enter) pathes
    links
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#7aafff")
        .attr("stroke-width", 2)
        .attr("class", "link")
        .merge(links)
        .attr(
            "d",
            d3
                .linkVertical()
                .x((d) => d.x)
                .y((d) => d.y)
        );

    // initialize tree nodes with data
    const nodes = graph.selectAll(".node").data(nodesData);

    // create new (enter) nodes
    const enterNodes = nodes
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // give rectangle shape to nodes
    enterNodes
        .append("rect")
        .attr("fill", (d) => colors(d.data.department))
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("height", 50)
        .attr("width", (d) => d.data.name.length * 20)
        .attr("transform", (d) => `translate(${-5},${-30})`);

    enterNodes
        .append("text")
        .text((d) => d.data.name)
        .attr("fill", "white");
}

observeData("employees", updateChart);
