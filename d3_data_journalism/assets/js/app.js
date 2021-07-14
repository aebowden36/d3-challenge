// @TODO: YOUR CODE HERE!
var svgWidth = 1000;
var svgHeight = 1000;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 50);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

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

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) - 2, d3.max(data, d => d[chosenYAxis]) + 2])
    .range([height, 0]);
  return yLinearScale;
}

// function used for x axis
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition().duration(1000).call(bottomAxis);
  return xAxis;
}

// function used for y axis
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition().duration(1000).call(leftAxis);
  return yAxis;
}

// functions used for updating X axis -- Try someting similar for Y axis
function renderXCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// Updating text locations for the texts on X axis -- Try someting similar for Y axis
function renderXText(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used for updating circles group 
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age:";
  }
  else {
    xlabel = "Income:"
  }

  if (chosenYAxis === 'healthcare') {
    ylabel = "Healthcare:"
  }
  else if (chosenYAxis === 'smokes') {
    ylabel = "Smokes:"
  }
  else {
    ylabel = "Obesity:"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .style("color", "white")
    .style("background", "black")
    .style("border", "4 px solid black")
    .style("border-width", "4px")
    .style("border-radius", "12px")
    .style("padding", "5px")
    .html(function (d) {
      return (`<div>${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%</div>`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data, this);
    });
  return circlesGroup;
}


// Read the CSV data
d3.csv("d3_data_journalism/assets/data/data.csv").then(function (data, err) {
  if (err) throw err;

  // parse data
  data.forEach(d => {
    // convert to numbers 
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare;
    d.obesity = +d.obesity;
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

  var circles = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 14)
    .attr("opacity", "0.5")
    .classed('stateCircle', true);

  // append text inside circles
  var circlesText = circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 5) //to center the text in the circles
    .attr("dy", 3)
    .classed('stateText', true);

  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .classed("aText", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Household Income (Median)");

  // Similarly add more labels for each of the axis you want to see
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left / 4}, ${height / 2})`);

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 20)
    .attr("value", "healthcare") // value to grab for event listener
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .classed("active", true)
    .classed("aText", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("value", "smokes") // value to grab for event listener
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .classed("inactive", true)
    .classed("aText", true)
    .text("Smoker (%)");

  var obesityLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("value", "obesity") // value to grab for event listener
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .classed("inactive", true)
    .classed("aText", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  xlabelsGroup.selectAll("text")
    .on("click", function () {
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
        circles = renderXCircles(circles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        //updating text within circles
        circlesText = renderXText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === 'age') {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // With all your xLabels -- try someting similar for Y label groups as well axis
  ylabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;
        // functions here found above csv import and updates x scale for new data
        yLinearScale = yScale(data, chosenYAxis)
        // updates x axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis)
        // updates circles with new x values
        circles = renderXCircles(circles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        //updating text within circles
        circlesText = renderXText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === 'smokes') {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
})
