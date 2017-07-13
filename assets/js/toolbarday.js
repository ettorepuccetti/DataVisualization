function ToolbarDays(){
		
        var toolbar
		
		function me(selection) {
            toolbar = selection;
            // create a selector for Years
            toolbar.append("label")
                .text("Day:");

            daySet =["Fri","Sat","Sun"]
            var tbYear = toolbar.append("div")
                .attr({id:"mode-group", class:"btn-group", "data-toggle":"buttons" })
                .selectAll("button")
                .data(daySet)
                .enter()
                .append("button")
                .attr({class:"btn btn-group btn-default", role:"group"})
                .text(function(d){return d})
                .on("click", function(d){ 
                    dispatch.changeDay(d); 
                }); 
	}
    return me
}