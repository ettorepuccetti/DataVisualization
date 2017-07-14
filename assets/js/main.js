function app(){
	
    //var format = d3.time.format("%Y-%m-%d %H:%M:%S") 
    //var timeExtent = [new Date(2014, 6, 6, 8), new Date(2014, 6, 6, 22)];
    var hour = '8'
    var center = '1300247'
    var senderGraph
    var receiverGraph
    var egoGraph
    var day = "Fri"

    function me(){
        //aprire il topsender.csv 
        d3.csv("assets/data/counter_per_hour/sender_count_"+day+"_" +hour+ ".csv",function(error, data){
            if (error) throw error

            senderGraph = OrizontalGraph("top sender: ","sender");
            d3.select("#graph")
                .datum(data)
                .call(senderGraph)
        });
        
        //aprire il topreceiver.csv
        d3.csv("assets/data/counter_receiver_per_hour/receiver_count_"+day+"_" +hour+ ".csv",function(error, data){
            if (error) throw error
            console.log(data)
            receiverGraph = OrizontalGraph("top receiver: ","receiver");
            d3.select("#graph")
                .datum(data)
                .call(receiverGraph)
        });

        egoGraph = EgoNetwork();

        //aprire una ego network.json
        d3.json("assets/data/ego_per_hour/Fri/Fri_"+hour+"_"+center+".json", function(error, data){
            if (error) throw error

            if (data.nodes.length === 0) {
                console.log("ego network vuota");
                d3.select("#ego")
                    .datum({"nodes": [{"id": center}], "links": []})
                    .call(egoGraph);
            } else {
                egoGraph.egoCenter(center)
                d3.select("#ego")
                    .datum(data)
                    .call(egoGraph)
            }
        })

        var toolbar = ToolbarHours()
        d3.select("#toolbar")
            .call(toolbar)

        d3.select("#toolbar").select("div.btn-group") 
            .selectAll("button") 
            .classed("active",function(d){return d==hour}) 
            .classed("btn-primary",function(d){return d==hour});

        var toolbarday = ToolbarDays()
            d3.select("#toolbar_day")
            .call(toolbarday)

        d3.select("#toolbar_day").select("div.btn-group") 
            .selectAll("button") 
            .classed("active",function(d){return d==day}) 
            .classed("btn-primary",function(d){return d==day});
    }

    me.updateChartData = function() {
        d3.csv("assets/data/counter_per_hour/sender_count_" +day+ "_" + hour +".csv",function(error, data){
            if (error) throw error
            
            senderGraph.updateGraph(data);
        });

         d3.csv("assets/data/counter_receiver_per_hour/receiver_count_"+day+"_" + hour +".csv",function(error, data){
            if (error) throw error
            
            receiverGraph.updateGraph(data);
        });

        return me;
    }
    
    me.updateEgoData = function() {
        console.log("center:" +center)
        if (center !== '') {
            d3.json("assets/data/ego_per_hour/"+day+"/"+day+"_" +hour+ "_" +center+ ".json", function(error, data){
                console.log("percorso:  assets/data/ego_per_hour/"+day+"/"+day+"_" +hour+ "_" +center+ ".json")
                if (error) {
                    console.log("ID not in database");
                    d3.select("#ego")
                        .datum({"nodes": [{"id": center}], "links": []})
                        .call(egoGraph);
                    throw error
                }
                if (data.nodes.length === 0) {
                    console.log("ego network vuota");
                    d3.select("#ego")
                        .datum({"nodes": [{"id": center}], "links": []})
                        .call(egoGraph);
                } else {
                    egoGraph.egoCenter(center)
                    d3.select("#ego")
                        .datum(data)
                        .call(egoGraph)
                    
                    //egoGraph.restart(data.nodes, data.links)
                }
            });
        }
        return me;
    }

    me.hour = function(_){
		if(!arguments.length) return hour;
		hour = _;
    }

    me.day = function(_){
		if(!arguments.length) return day;
		day = _;
    }

    me.center = function(_) {
        if(!arguments.length) return center;
        center = _;
        egoGraph.egoCenter(_);
    }


    me.drawObserved = function(val){

        egoGraph.addObservedNode(val)
        
        var node = d3.select("#observed").selectAll("g")
            .data(egoGraph.observedNodes())
            .enter().append("g")
            .attr("class","row")
            .attr("id", function(d) {return "id"+d.toString()})

        node.append("li")
            .text(function(d,i){return i + ": " + d;})
        
        node.append("input")
            .attr("type","button")
            .attr("value", "remove")
            .attr("onclick", "myApp.removeObserved("+d+")")
    }


    me.removeObserved = function (d) {
        console.log(d)
        egoGraph.removeObservedNode(d.toString())
        d3.select("#observed")
            .selectAll("#id"+d.toString())
            .remove()
    }


    return me;
}

var myApp = app()
d3.select("#viz")
    .call(myApp)