$(function () {
    var w = 1200
    var h = 800

    // ########## SVG ##########
    var svg = d3.select("#canvas")
        .attr("width", w)
        .attr("height", h);

    var borderPath = svg.append("rect")
        .attr("id", "canvas-border")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", h)
        .attr("width", w)

    // ########## Data: Nodes and Links ##########

    d3.json("data/data.json", function (error, data) {
        if (error) throw error;

        graph = data;

        // ########## Links and nodes ##########

        var link = svg.selectAll(".link")
            .data(graph.links).enter()
            .append("line")
            .attr("class", "link");

        var node = svg.selectAll(".node")
            .data(graph.nodes).enter()
            .append("circle")          
            .attr("class", "node")
            .attr("fill", function (d) { return d.color; })
            .attr("stroke-width", 0)
            .attr("r", 10)

        var label = svg.selectAll(".label")
            .data(graph.nodes).enter()
            .append("text")
            .attr("class", "label")
            .text(function (d) { return d.id; });

        // ########## Names ##########

        node.append("title")
            .text(function (d) { return d.id; });

        // ########## Force ##########

        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(100))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(w / 2, h / 2));

        simulation.nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        function ticked() {
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });

            label
                .attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y - 20; });
        }

        // ########## Toggle ##########

        node.on("click", toggleSelected);

        function toggleSelected(d) {
            d.isSelected = !d.isSelected;
            d3.select(this).attr("stroke-width", d.isSelected ? 5:0);
        };

        // ########## Drag and Drop ##########

        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        };

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        };

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            if (!d.isSelected) {
                d.fx = null;
                d.fy = null;
            };
        };

        // ########## Zoom & Pan ##########

        var zoom = d3.zoom()
            .scaleExtent([0.5, 3])
            .on("zoom", zoomed);

        svg.call(zoom);

        function zoomed() {
            node.attr("transform", d3.event.transform);
            link.attr("transform", d3.event.transform);
            label.attr("transform", d3.event.transform);
        }

    });
});


