function OrizontalGraph(mylabel,myMode){
    
    var label = mylabel
    var svg
    var chart = nv.models.multiBarHorizontalChart();
    var barLength = d3.scale.linear()
            .range([1, 100])
            .domain([1, 8000]);
    var mode = myMode
    function me(selection) {

        var data = selection.datum()

        svg = selection.append("svg")
            .attr("width",450)
            .attr("height",300)

        me.updateGraph(data)

        return me
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