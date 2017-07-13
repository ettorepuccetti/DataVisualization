function EgoNetwork() {
            
    var width = 700;
    var height = 500;
    var force
    var svg

    var nodes
    var links
    
    var marker
    var circle
    var path
    var node

    var observedNodes = []

    var center

    function me(selection){

        if(force) {
            resetForce()
        }
     
        nodes = d3.values(selection.datum().nodes)
        links = selection.datum().links

        if(links.length > 0) {
            document.getElementById("max").innerHTML = "max count:  "+ d3.max(links, function(d) { return +d.value; }).toString()
        } else {
            document.getElementById("max").innerHTML = "max count: 0 "
        }

    
        force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkDistance(200)
            .charge(-1500)
            .on("tick", tick);

        force.start();


        if (!svg) {
            svg = selection.append("svg")
                .attr("width",width)
                .attr("height",height)
        }


        // build the arrow.
       svg.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .attr("markerUnits", "userSpaceOnUse")
        .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        // add the links and the arrows
        path = svg.append("svg:g").selectAll("path")
            .data(links, function(d) {return d.source.id + "-" + d.target.id;})
        path.enter().append("svg:path")
            .attr("class", "link")
            .attr("marker-end", "url(#end)")
            .attr("stroke", "grey")
            .attr("stroke-width", function (d) {return (d.value)})
            .attr("fill", "none")
        
        // define the nodes
        node = svg.selectAll(".node")
            .data(nodes,function(d) {return d.id});
        node.enter().append("g")
            .attr("class", "node");


        node.call(force.drag);

        // add the nodes
        circle = node.append("circle")
            .style("fill", function (d) { 
                if (d.id === center ) return 'orange'; 
                else if (observedNodes.indexOf(d.id) === -1) return '#ccc';
                    else return '#008000';
                })
            .attr("r", function (d) { if (d.id === center) return 9; else return 6; })

        // add the text 
        node.append("text")
            .attr("x", 12)
            .attr("dy", ".35em")
            .attr("fill", function(d) {if (observedNodes.indexOf(d.id) === -1) return 'red'; else return '#008000'})
            .text(function(d) { return d.id; });


        // add the curvy lines
        function tick() {
            path.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + 
                    d.source.x + "," + 
                    d.source.y + "A" + 
                    dr + "," + dr + " 0 0,1 " + 
                    d.target.x + "," + 
                    d.target.y;
            });
            node
                .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")"; });
        }

        return me
    }


    function resetForce() {
        circle = {};
        node.remove();
        path.remove();
        d3.selectAll('defs').remove();
        nodes = [];
        links = [];
    }

    me.egoCenter = function(_) {
        if(!arguments.length) return center;
		center = _;

        return me;
    }

    me.observedNodes = function(_) {
        if(!arguments.length) return observedNodes;
		observedNodes = _;

        return me;
    }
    me.addObservedNode = function(val) {
        observedNodes.push(val);
        
        return me;
    }

    me.removeObservedNode = function(val) {
        if (observedNodes.indexOf(val) > -1)
            observedNodes.splice(observedNodes.indexOf(val),1)
        else
            console.log("sto cancellando un elemento non presente :/")
    }
    return me
}
