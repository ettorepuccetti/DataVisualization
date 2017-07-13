var dispatch = d3.dispatch("changeHour","changeDay","changeCenter","addObserved");


dispatch.on("changeHour", function(d){
	newHour = d
	myApp.hour(d);
	myApp.updateChartData();
	myApp.updateEgoData();
	console.log("click hour", d);
	d3.select("#toolbar").select("div.btn-group") 
      .selectAll("button") 
      .classed("active",function(d){return d==newHour}) 
      .classed("btn-primary",function(d){return d==newHour}); 
});

dispatch.on("changeDay", function(d){
	newday = d
	myApp.day(d);
	myApp.updateChartData();
	myApp.updateEgoData();
	console.log("click day", d);
	d3.select("#toolbar_day").select("div.btn-group") 
      .selectAll("button") 
      .classed("active",function(d){return d==newday}) 
      .classed("btn-primary",function(d){return d==newday}); 
});

dispatch.on("changeCenter", function() {
	d = document.getElementById("textbox").value
	myApp.center(d);
	myApp.updateEgoData();
});

dispatch.on("addObserved", function() {
	d = document.getElementById("observedTextbox").value
	if (d.length > 0) {
	    myApp.drawObserved(d)
	}
})