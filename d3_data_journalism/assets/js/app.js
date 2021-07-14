// @TODO: YOUR CODE HERE!
var svgWidth = 1000;
var svgHeight = 1000;
​
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
​
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
​
// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 50);
​
// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
​
  // Initial Params
var chosenXAxis = "age";
var chosenYAxis = "smoker";
​
// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}
​
// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis])-2,d3.max(data, d => d[chosenYAxis])+2])
      .range([height, 0]);
  
    return yLinearScale;
  
}
​
​
// functions used for updating X axis -- Try someting similar for Y axis
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
​
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newXScale(d[chosenYAxis]));
  
    return circlesGroup;
}
​
// Updating text locations for the texts on X axis -- Try someting similar for Y axis
function renderXText(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
​
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}
​
​
// function used for updating circles group 
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
​
    var xlabel;
    var ylabel;
  
    if (chosenXAxis === "age") {
      xlabel = "Age:";
    }
    else if (chosenXAxis === "poverty") {
      xlabel = "Poverty:";
    }
    
​
    if (chosenYAxis === 'smokers'){
        ylabel = "Smoker:"
    }
    else if (chosenYAxis === 'healthcare'){
        ylabel = "No Healthcare:"
    }
    
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .style("color", "")
      .style("background", '')
      .style("border", "")
      .style("border-width", "")
      .style("border-radius", "")
      .style("padding", "")
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
    .on("mouseout", function(data, index) {
    toolTip.hide(data);
    });
  
    return circlesGroup;
}
​
​
// Read the CSV data
d3.csv("d3_data_journalism/assets/data/data.csv").then(function(data, err) {
    if(err) throw err;

    // parse data
    data.forEach(d => {
      // convert to numbers 
	    d.poverty = +d.poverty;
      d.age = +d.age;
      d.smokes = +d.smokes;
      d.healthcare = +d.healthcare
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed('y-axis', true)
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("g");
​
    var circles = circlesGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 14)
      .classed('stateCircle', true);
​
    // append text inside circles
    var circlesText = circlesGroup.append("text")
      .text(d => d.abbr)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis])+5) //to center the text in the circles
      .classed('stateText', true);
  
    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
	
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "age") // value to grab for event listener
      .classed("active", true)
      .text("Age (Median)");
​
	// Similarly add more labels for each of the axis you want to see
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0-margin.left/4}, ${height/2})`);
  
  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smoker (%)");
	
	// updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
	
	// With all your xLabels -- try someting similar for Y label groups as well axis
	 xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          
          // functions here found above csv import and updates x scale for new data
          xLinearScale = xScale(data, chosenXAxis)
  
          // updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis)
  
          // updates circles with new x values
          circles = renderXCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
​
        //   updating text within circles
          circlesText = renderXText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            OtherLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if(chosenXAxis === 'poverty'){
            SomeOtherlabel
              .classed("active", true)
              .classed("inactive", false);
            OtherLabe2
              .classed("active", false)
              .classed("inactive", true);
          }
      
        }
      });
    })