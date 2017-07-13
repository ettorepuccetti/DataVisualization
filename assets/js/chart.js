

function FilteredChart(){
	// the column to use to group data
	var dimension = "Technique";
	// a function to filter a subset of rows
	var filter= function(d){return true};
	var svg;
	var nvchart;
	
	function me(selection){
		console.log("chart data", selection.datum());
		
		if(!svg){
			selection.append("h4")
			.text(dimension);
			
			svg = selection.append("svg")
			.attr({width:"100%", height:400});
			
			nvchart = nv.models.multiBarHorizontalChart()
				.margin({left:50})
				.showLegend(false)
				.showControls(false);
		}
		svg.datum(groupDataBy(selection.datum(),dimension))
		.call(nvchart);
	}
	
	me.dimension = function(_){
		if(!arguments.length) return dimension;
		dimension = _;
		
		return me;
	}
	
	me.filter = function(_){
		if(!arguments.length) return filter;
		filter = _;
		
		return me;
	}
	
	function groupDataBy(data, dimension){
		var filtered = data.filter(filter);

		
		var grouped = d3.nest()
			.key(function(d){return d[dimension]})
			.rollup(function(leaves){return leaves.length})
		.entries(filtered);
		
		return [
			{
				key:"Count " + dimension,
				values: grouped
					.map(function(d){return {x:d.key, y:d.values}}) // rename proerty name of objects
					.sort(function(a,b){return -a.y + b.y}) // sort by frequency
					.filter(function(d,i){return i < 10})  // select only first 10 rows
			}
		]
	}
	
	
	
	return me;
}