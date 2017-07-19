function OrizontalGraph(mylabel,myMode){
    var width = 400, height = 300;
    var label = mylabel
    var svg
    var chart = nv.models.multiBarHorizontalChart()
   
   chart.multibar.dispatch.on('elementClick', function(e){
        console.log('element: ' + e.data.x);
        myApp.center(e.data.x);
	    myApp.updateEgoData();
    });
    
    //chart.yRange([0,10000])
    chart.yDomain([0,15000])
    chart.yScale(d3.scale.sqrt())
    
    chart.margin({left:70}) 
        .showLegend(true) 
        .showControls(false); 

    var barLength = d3.scale.linear()
            .range([1, 100])
            .domain([1, 8000]);
            
    var mode = myMode
    function me(selection) {

        var data = selection.datum()

        svg = selection.append("svg")
            .attr({width:"100%", height:height}); 

        me.updateGraph(data)

        return me
    }

    me.updateScale = function(hour) {

        if (hour === 'all'){
            chart.yDomain([0,75000])
        } else {
            chart.yDomain([0,15000])
        }

    }
    
    me.updateGraph = function(data) {

        svg.datum(prepareData(data,mode))
            .call(chart)

        return me;
    }

    function prepareData(data,mode) {
        var filtered = data.filter(function(d,i) {return i < 10})
        var r = [{
            key: label,
            values: filtered.map(function(d) {
                if (mode === "sender") return {key: label, x: d.sender, y: d.count};
                else return {key: label, x: d.receiver, y: d.count};
            })
        }]
        return r
    }

    return me
}