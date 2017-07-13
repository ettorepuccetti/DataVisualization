

function TimelineBrush(){
	var width = 960;
	var height = 50;
	
	var x = d3.scaleTime()
		.domain([new Date(2014, 6, 6, 8), new Date(2014, 6, 6, 22)])
		.range([0,width]);
	
	var brush = d3.svg.brush()
		.x(x)
		.extent([0,10])
		.on("brush", brushed);
	
	function me(selection){
		
		var svg = selection.append("svg")
			.attr({width: width+40, height: height+40})
		.append("g");
		
		svg.append("rect")
			.attr({width: width, height: height, fill:"#ddd"});
		
		svg.append("g")
			.classed("x grid", true)
			.attr("transform", "translate(0,"+height+")")
			.call(d3.svg.axis()
				.scale(x)
				.orient("bottom")
			);
			
		var gBrush = svg.append("g")
			.attr("class", "brush")
		.call(brush);
	
		gBrush.selectAll("rect")
		.attr("height", height);
		
	}

	 me.domain = function(_){ 
		if(!arguments.length) return x.domain(); 
		x.domain(_); 
		
		return me; 
	}
	
	function brushed(){
		var extent0 = brush.extent(),
			extent1;

		//extent1 = extent0.map(function(d){return Math.round(d)});
		
		dispatch.intervalSelection(extent0); 
		//d3.select(this).call(brush.extent(extent1));
	}

	return me;
}