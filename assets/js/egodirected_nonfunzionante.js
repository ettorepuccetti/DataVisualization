function EgoNetwork() {
            
    var width = 700;
    var height = 500;
    var simulation
    var svg
    var g
    var node
    var link

    var nodes
    var links
    
    var marker
    var circle
    var path
    var node

    var observedNodes = []

    var center

    function me(selection){
        svg = selection.append("svg")
                .attr("width",width)
                .attr("height",height)

        nodes = selection.datum().nodes
        links = selection.datum().links

        if(links.length > 0) {
            document.getElementById("max").innerHTML = "max count:  "+ d3.max(links, function(d) { return +d.value; }).toString()
        } else {
            document.getElementById("max").innerHTML = "max count: 0 "
        }
        
        simulation = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([width, height])
            .linkDistance(200)
            .charge(-1500)
            .on("tick", tick)
            .alpha(1);
    
        simulation.start();
        

        g = svg.append("g");
        link = g.append("g").selectAll(".link");
        node = g.append("g").selectAll(".node");
        
        me.restart(nodes,links);

        return me
    }

    me.restart = function(newNodes, newLinks) {

        nodes = newNodes;
        links = newLinks;
            //prima cosa: quando faccio la data con nodes, siccome non è partira la simulazione,
            //nodes non ha ancora le informazioni che mi servono, ha solo l'id.
        node = node.data(nodes ,function(d) {return d.id;})
        node.exit().remove()
        node = node.enter().append("g")
            .attr("class", "node");
        
        // Apply the general update pattern to the links.
        link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; })
        link.exit().remove()
        link = link.enter().append("svg:path");

        
        simulation.nodes(nodes);
        simulation.links(links);
        simulation.start();
        simulation.alpha(0.5);

        circle = node.append("circle")
            .style("fill", function (d) { 
                if (d.id === center ) return 'orange'; 
                else if (observedNodes.indexOf(d.id) === -1) return '#ccc';
                    else return '#008000';
                })
            .attr("r", function (d) { if (d.id === center) return 9; else return 6; })
 
        node.append("text")
            .attr("x", 12)
            .attr("dy", ".35em")
            .attr("fill", function(d) {if (observedNodes.indexOf(d.id) === -1) return 'red'; else return '#008000'})
            .text(function(d) { return d.id; });

        node.call(simulation.drag);

        link.attr("class", "link")
            .attr("stroke", "grey")
            .attr("stroke-width", function (d) {return (d.value)})
            .attr("fill", "none")

        return me;        
    }
    
    // add the curvy lines
    function tick() {
        link.attr("d", function(d) {
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
