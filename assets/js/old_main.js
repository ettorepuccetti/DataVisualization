function app(){
	
    var svg;
    var format = d3.time.format("%Y-%m-%d %H:%M:%S")

    function me(selection){
        
        var timeExtent = [new Date(2014, 6, 6, 8), new Date(2014, 6, 6, 9)];
        

        //aprire il .csv 
        d3.csv("assets/data/comm-data-Fri-short.csv",function(error, data){
            if (error) throw error
            
            // chi manda più messaggi di tutti, a chi li manda?
            var groupedCountFrom = d3.nest()
                .key(function(d) {return d.from; })
                .key(function(d) {return d.to; })
                .entries(data)
            
           

            groupedCountFrom.sort(function(x,y) {
                return y.values.length - x.values.length
            })

            for (var i = 0; i < groupedCountFrom.length; i++) {
                groupedCountFrom[i].values.sort(function(x,y) {
                    return y.values.length - x.values.length;
                })
            }

            prepareDataForChart(groupedCountFrom.slice(0,10), "top senders  :")
            console.log(groupedCountFrom)

            //chi riceve più messaggi di tutti, da chi li riceve?

           var groupedCountTo = d3.nest()
                .key(function(d) {return d.to; })
                .key(function(d) {return d.from; })
                .entries(data);

            groupedCountTo.sort(function(x,y) {
                return y.values.length - x.values.length
            })
            
            for (var i = 0; i < groupedCountTo.length; i++) {
                groupedCountTo[i].values.sort(function(x,y) {
                    return y.values.length - x.values.length;
                })
            }

            prepareDataForChart(groupedCountTo.slice(0,10), "top receivers  :")


        /*chi ha fatto più chiamate verso sempre la stessa persona
         (chiamate effettuate dalla stessa persona verso la stessa persona.)
         ordinate per coppie di conversanti, in ogni record c'è:
        {
            to: "id"
            from: "id"
            messageList: "array di object[location, timestamp]"
        }
            var groupedCountFromTo = d3.nest()
                .key(function(d) {return d.from; })
                .key(function(d) {return d.to; })
                .entries(data);
            
            var frequentContacts = []

            for (i = 0; i < groupedCountFromTo.length; i++) {
                for (j = 0; j < groupedCountFromTo[i].values.length; j++) {
                    frequentContacts.push({
                        from: groupedCountFromTo[i].key,
                        to: groupedCountFromTo[i].values[j].key,
                        messageList: groupedCountFromTo[i].values[j].values.map(function (d){
                            return {timestamp: d.Timestamp, location: d.location};
                        })
                    });
                }
            }
            frequentContacts.sort(function(x,y){
                return y.messageList.length - x.messageList.length;
            })*/

            //console.log(frequentContacts)   

            var timeline = TimelineBrush(); 
            d3.select("#timeline") 
            .call(timeline); 
        })
    
    }


    function prepareDataForChart(selection,label) {
        var r = [{
            key: label,
            values: selection.map(function(d) {
                return {key: label, x: d.key, y: d.values.length};
            })
        }]
        console.log(r)
        var chart = nv.models.multiBarHorizontalChart();
        svg = d3.select("#viz")
            .append("svg")
            .attr("width",450)
            .attr("height",300)
            .datum(r)
            .call(chart);
    }

    me.timeExtent = function(_){
		if(!arguments.length) return timeExtent;
		timeExtent = _;
        //console.log(format(timeExtent[0]));
        //console.log(format(timeExtent[1]));
    }

    return me;
}

var myApp = app()
d3.select('#viz')
.call(myApp)