function ToolbarHours(){
		
        var toolbar
		
		function me(selection) {
            toolbar = selection;
            // create a selector for Years
            toolbar.append("label")
                .text("Hour:");

            hourSet = Array(16).fill().map((_, i) => (i+8).toString())
            hourSet.push("all")
            var tbYear = toolbar.append("div")
                .attr({id:"mode-group", class:"btn-group", "data-toggle":"buttons" })
                .selectAll("button")
                .data(hourSet)
                .enter()
                .append("button")
                .attr({class:"btn btn-group btn-default", role:"group"})
                .text(function(d){return d})
                .on("click", function(d){ 
                    dispatch.changeHour(d); 
                }); 
	}
    return me
}