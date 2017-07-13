function EgoNetwork() {
            
    var width = 450;
    var height = 300;
    var radius = 15;

    function me(selection){

        var graph = selection.datum()

        var svg = selection.append("svg")
            .attr("width",450)
            .attr("height",300)

        var force = d3.layout.force()
            .gravity(0.05)
            .distance(150)
            .charge(-1000)
            .size([width, height])
            .nodes(graph.nodes)
            .links(graph.links);
        
        //force.linkDistance(width/2);
    
        var link = svg.selectAll('.link')
            .data(graph.links)
            .enter().append('line')
            .attr('class', 'link');
        
        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .call(force.drag);
        
        var circle = svg.selectAll('.circle')
            .data(graph.nodes)
            .enter()
            .append("circle")
            .attr("class","node")
        
        var label = svg.selectAll(".mytext")
            .data(graph.nodes)
            .enter()
            .append("text")
            .text(function (d) { return d.id; })
            .attr("dx", 12)
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("stroke", "blue")
            .style("font-family", "Arial")
            .style("font-size", 12);

        force.on('end', function() {
            circle.attr('r',radius)
                .attr('cx', function(d) {  return d.x = Math.max(radius, Math.min(width - radius, d.x)) })
                .attr('cy', function(d) {  return d.y = Math.max(radius, Math.min(height - radius, d.y)) });
            
            label.attr("x", function(d) {return d.x; })
                .attr("y", function (d) {return d.y - 10; });

            link.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

        });
        force.start();
        
        return me
    }
return me
}
