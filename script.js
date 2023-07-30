async function init() {
    const data = await d3.csv("us_share-of-adults-who-are-overweight.csv");
    const margin = {top: 70, right: 30, bottom: 40, left: 80};
    const width = 1200 - margin.left - margin.right;
    const height = 500 -margin.top - margin.bottom;

    // Adding scales for the axis

    const xScale = d3.scaleTime().range([0,width]);
    const yScale = d3.scaleLinear().range([height,0]);

    // creating svg container and domains for the axis

    const svg = d3.select("#chart").append("svg").attr("width", width + margin.left+margin.right)
    .attr("height", height + margin.top + margin.bottom).append("g").attr("transform",`translate(${margin.left},${margin.top})`);
    xScale.domain(d3.extent(data, d => d.Year));
    yScale.domain([35, d3.max(data, d => d.Indicator)]);
    
    // Adding the axis to the svg container
    svg.append("g").attr("transform","translate(0,"+height+")").style("font-size","14px").call(d3.axisBottom(xScale).tickFormat(d3.format(".0f")))
    .call(g => g.select(".domain").remove()).selectAll(".tick line").style("stroke-opacity",0);

    svg.append("g").attr("transform","translate(0,0)").style("font-size", "14px").call(d3.axisLeft(yScale).tickFormat(d3.format(".0f")))
    .call(g => g.select(".domain").remove()).selectAll(".tick line").style("stroke-opacity",0).style("visibility","hidden");

    svg.selectAll(".tick text").attr("fill","#777").style("visibility",(d,i)=> {
        if (i === 9 || i === 0)  {
            return "hidden";  
        }
        else{
            return "visible"
        }
        }
    );


    

    // add title
    svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left - 115)
    .attr("y", margin.top - 120)
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Obesity and Eating Habits in America");

    svg.append("text")
    .attr("class", "chart-description")
    .attr("x", 0)
    .attr("y", -23)
    .style("font-size", "12px")
    .style("font-weight", "none")
    .style("font-family", "sans-serif")
    .text("The obesity rate in America has been on the rise since 1975 and with it the rate of its associated health risks. During this time, particularly the last 10 years, Americans' eating habits changed.")


    svg.append("text")
    .attr("class", "chart-description")
    .attr("x", 0)
    .attr("y", -9)
    .style("font-size", "12px")
    .style("font-weight", "none")
    .style("font-family", "sans-serif")
    .text("By 2005, Americans started to spend more money on eating out, than eating at home. Click highlighted time span to explroe this trend.");





    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("Percentage of Total Population Obese or Overweight");

    // Creating the gridlines
    svg.selectAll("xGrid").data(xScale.ticks().slice(1)).join("line").attr("x1", d => xScale(d)).attr("x2", d => xScale(d)).attr("y1",0).attr("y2", height)
    .attr("stroke", "#e0e0e0").attr("stroke-width", .5);
    svg.selectAll("yGrid").data(yScale.ticks()).join("line").attr("x1", 0).attr("x2", width).attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
    .attr("stroke", "#e0e0e0").attr("stroke-width", .5);

    var circleTooltip = d3.select("#circleTooltip");


 
    // Creating the line and formating the ticks

    const line = d3.line().x(d => xScale(Number(d.Year))).y(d => yScale(Number(d.Indicator)));
    const path = svg.append("path").attr("fill","none").attr("stroke","darkorange").
    attr("stroke-width",2);
    function updatePath(data, line) {
        const updatePath = d3
          .select("path")
          .interrupt()
          .datum(data)
          .attr("d", line);

    const pathLength = updatePath.node().getTotalLength();

    const transitionPath = d3
        .transition()
        .ease(d3.easeSin)
        .duration(2500);
    updatePath
        .attr("stroke-dashoffset", pathLength)
        .attr("stroke-dasharray", pathLength)
        .transition(transitionPath)
        .attr("stroke-dashoffset", 0);

    svg.selectAll("circle").data(data).enter().append("circle").attr("class","line-circles")
    .attr("fill","darkorange").attr("stroke","darkorange")
    .attr("r",5).attr("cy", function (d) { return yScale(d.Indicator); } )
    .on("mouseover", function(d,i){
        circleTooltip.style("opacity", 1)
        .style("left",(d3.event.pageX)+"px")
        .style("top",(d3.event.pageY)+"px")
        .style("font-size","14px")
        .style("height","35px")
        .html("Year: " + d.Year + "<br>" +  "Obesity Rate: " + d.Indicator+"%")
    }).on("mouseout", function(){circleTooltip.style("opacity",0)});
    
    }
    updatePath(data,line);

    svg.selectAll(".line-circles")
    .transition()
    .ease(d3.easeSin)
    .delay(100)
    .duration(2500)
    .attr("cx", function (d) { return xScale(Number(d.Year)); } )
    .attr("cy", function (d) { return yScale(Number(d.Indicator)); } )





//Annotation for Spending
var annotationTooltip = d3.select("#annotationTooltip");

const annotationSpendingSvg = svg.append("g").attr("width", 50).attr("height",50);
annotationSpendingSvg.append("rect")
.attr("x", 664)
.attr("y", 2)
.attr("width", 400)
.attr("height", height-2)
.style("fill", "rgba(162, 155, 159, 0.15)")
.style("stroke", "none")
.style("stroke-width", 0)
.on("mouseover",function(){
    annotationSpendingSvg.select("rect")
    .style("fill","rgba(162, 155, 159, 0.50)");
    annotationTooltip.style("opacity", 1)
    .style("left",(d3.event.pageX) - 50 +"px")
    .style("top",(d3.event.pageY)+"px")
    .style("font-family", 'Helvetica')
    .style("font-size","medium")
    .style("box-shadow",'5px 5px 10px rgba(0, 0, 0, 0.14)')
    .style("border-radius", "5px")
    .html("Click to explore American Spending Habits");
})
.on("mouseout", function(){
    annotationSpendingSvg.select("rect")
    .style("fill","rgba(162, 155, 159, 0.15)");
    annotationTooltip.style("opacity",0)
});

const annotationSpendingText = "Spending Habits";
annotationSpendingSvg.append("text")
.style("font-size","20px")
.style("font-family", "Helvetica Neue")
.attr("x", 664 + 400 / 2)
.attr("y", height / 2)
.attr("font-weight",700)
.attr("text-anchor", "middle") // Center the text horizontally within the rectangle
.attr("dominant-baseline", "middle") // Center the text vertically within the rectangle
.text(annotationSpendingText);
svg.selectAll("circle").raise();
svg.selectAll("path").raise();


annotationSpendingSvg.select("rect").on("click",function(){
    d3.selectAll("body").html("");
    d3.select("body").html("<div id='chart'></div>" +"<div id='circleTooltip'></div>" 
    + "<div id='annotationTooltip'></div>");
    spendingHabitsSlide();
});



// Spending Habits slide
async function spendingHabitsSlide() {
    const data = await d3.csv("food-expenditure-per-person.csv",function(d){
        d.AwayIndicator = parseFloat(d.AwayIndicator);
        d.HomeIndicator = parseFloat(d.HomeIndicator);
        return d;
    });
    const margin = {top: 70, right: 30, bottom: 40, left: 80};
    const width = 1200 - margin.left - margin.right;
    const height = 500 -margin.top - margin.bottom;

    // Adding scales for the axis

    const xScale = d3.scaleTime().range([0,width]);
    const yScale = d3.scaleLinear().range([height,0]);

    // creating svg container and domains for the axis

    const svg = d3.select("#chart").append("svg").attr("width", width + margin.left+margin.right)
    .attr("height", height + margin.top + margin.bottom).append("g").attr("transform",`translate(${margin.left},${margin.top})`);
    xScale.domain([1975, 2022]);
    yScale.domain([550, d3.max(data, d => d.AwayIndicator)]);
    
    // Adding the axis to the svg container2
    svg.append("g").attr("transform","translate(0,"+height+")").style("font-size","14px").call(d3.axisBottom(xScale).tickFormat(d3.format(".0f")))
    .call(g => g.select(".domain").remove()).selectAll(".tick line").style("stroke-opacity",0);

    svg.append("g").attr("transform","translate(0,0)").style("font-size", "14px").call(d3.axisLeft(yScale).tickFormat(d3.format(".0f")))
    .call(g => g.select(".domain").remove()).selectAll(".tick line").style("stroke-opacity",0).style("visibility","hidden");
    svg.selectAll(".tick text").attr("fill","#777").style("visibility",(d,i)=> {
        if (i === 10 || i === 0)  {
            return "hidden";  
        }
        else{
            return "visible"
        }
        }
    );

    

    // add title
    svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left - 115)
    .attr("y", margin.top - 120)
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Obesity and Eating Habits in America");

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("Total Spending (Constant US Dollar)");

    // Creating the gridlines
    svg.selectAll("xGrid").data(xScale.ticks().slice(1)).join("line").attr("x1", d => xScale(d)).attr("x2", d => xScale(d)).attr("y1",0).attr("y2", height)
    .attr("stroke", "#e0e0e0").attr("stroke-width", .5);
    svg.selectAll("yGrid").data(yScale.ticks()).join("line").attr("x1", 0).attr("x2", width).attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
    .attr("stroke", "#e0e0e0").attr("stroke-width", .5);


    //Adding Away Line 

    const awayLine = d3.line().x(d => xScale(Number(d.Year))).y(d => yScale(Number(d.AwayIndicator)));
    const awayPath = svg.append("path").attr("class","awayPath").attr("fill","none").attr("stroke","red").
    attr("stroke-width",2);
    function updateAwayPath(data, awayLine) {
        const updateAwayPath = d3
          .select(".awayPath")
          .interrupt()
          .datum(data)
          .attr("d", awayLine);

    const awayPathLength = updateAwayPath.node().getTotalLength();

    const transitionAwayPath = d3
        .transition()
        .ease(d3.easeSin)
        .duration(2500);
    updateAwayPath
        .attr("stroke-dashoffset", awayPathLength)
        .attr("stroke-dasharray", awayPathLength)
        .transition(transitionAwayPath)
        .attr("stroke-dashoffset", 0);

    
    }
    updateAwayPath(data,awayLine);

    svg.selectAll(".away-circles")
    .transition()
    .ease(d3.easeSin)
    .delay(100)
    .duration(2500)
    .attr("cx", function (d) { return xScale(Number(d.Year)); } )
    .attr("cy", function (d) { return yScale(Number(d.AwayIndicator)); } )



    //Adding Home Line 

    const homeLine = d3.line().x(d => xScale(Number(d.Year))).y(d => yScale(Number(d.HomeIndicator)));
    const homePath = svg.append("path").attr("class","homePath").attr("fill","none").attr("stroke","blue").
    attr("stroke-width",2);
    function updateHomePath(data, homeLine) {
        const updateHomePath = d3
          .select(".homePath")
          .interrupt()
          .datum(data)
          .attr("d", homeLine);

    const homePathLength = updateHomePath.node().getTotalLength();

    const transitionHomePath = d3
        .transition()
        .ease(d3.easeSin)
        .duration(2500);
    updateHomePath
        .attr("stroke-dashoffset", homePathLength)
        .attr("stroke-dasharray", homePathLength)
        .transition(transitionHomePath)
        .attr("stroke-dashoffset", 0);
    }
    updateHomePath(data,homeLine);

    var annotationTooltip = d3.select("#annotationTooltip");

    const annotationMarketSvg = svg.append("g").attr("width", 50).attr("height",50);
    
    annotationMarketSvg.append("rect")
    .attr("x", 810)
    .attr("y", 2)
    .attr("width", 280)
    .attr("height", height-2)
    .style("fill", "rgba(162, 155, 159, 0.15)")
    .style("stroke", "none")
    .style("stroke-width", 0)
    .on("mouseover",function(){
        annotationMarketSvg.select("rect")
        .style("fill","rgba(162, 155, 159, 0.50)");
        annotationTooltip.style("opacity", 1)
        .style("left",(d3.event.pageX) - 50 +"px")
        .style("top",(d3.event.pageY)+"px")
        .style("font-family", 'Helvetica')
        .style("font-size","medium")
        .style("box-shadow",'5px 5px 10px rgba(0, 0, 0, 0.14)')
        .style("border-radius", "5px")
        .html("Click to Explore Fast Food Industry's Fast Growth");
    })
    .on("mouseout", function(){
        annotationMarketSvg.select("rect")
        .style("fill","rgba(162, 155, 159, 0.15)");
        annotationTooltip.style("opacity",0)
    });
    
    const annotationMarketText = "The Rise of Fast Food";
    annotationMarketSvg.append("text")
    .style("font-size","20px")
    .style("font-family", "Helvetica Neue")
    .attr("x", 810 + 280 / 2)
    .attr("y", height / 2)
    .attr("font-weight",700)
    .attr("text-anchor", "middle") // Center the text horizontally within the rectangle
    .attr("dominant-baseline", "middle") // Center the text vertically within the rectangle
    .text(annotationMarketText);
    
    svg.selectAll("circle").data(data).enter().append("circle").attr("class","line-circles")
    .attr("fill","none").attr("stroke","grey").transition().duration(3000)
    .attr("r",20).attr("cy", 180).attr("cx",652);

    svg.append("text").attr("x",600)
    .attr("y",150).transition().delay(2500)
    .style("font-famiy", 'Helvetica Neue')
    .style("font-size","Medium")
    .text("FAH > At Home");

    svg.append("text").attr("x",995)
    .attr("y",-35)
    .style("font-famiy", 'Helvetica Neue')
    .style("font-size","small")
    .text("Food Away From Home")
    .style("fill","red");

    svg.append("text").attr("x",995)
    .attr("y",-20)
    .style("font-famiy", 'Helvetica Neue')
    .style("font-size","small")
    .text("Food At Home")
    .style("fill","blue");

    svg.append("text")
    .attr("class", "chart-description")
    .attr("x", 0)
    .attr("y", -23)
    .style("font-size", "12px")
    .style("font-weight", "none")
    .style("font-family", "sans-serif")
    .text("Fast Food consumption is associated with increased risk of obesity. Since 2005, Americans continue to spend more on eating out than eating at home.")


    svg.append("text")
    .attr("class", "chart-description")
    .attr("x", 0)
    .attr("y", -9)
    .style("font-size", "12px")
    .style("font-weight", "none")
    .style("font-family", "sans-serif")
    .text("As a result, the fast food industry market size increased by over 40% in the last 10 years and is projected for more. Click the highlighted time period to explore the trend");




    
    
    annotationMarketSvg.select("rect").on("click",function(){
        d3.selectAll("body").html("");
        d3.select("body").html("<div id='chart'></div>" +"<div id='circleTooltip'></div>" 
        + "<div id='annotationTooltip'></div>");
        marketSizeSlide();
    });

    }

async function marketSizeSlide(){
    const data = await d3.csv("market-size.csv",function(d){
        d.size = parseFloat(d.MarketSize);
        return d;
    });
    const margin = {top: 70, right: 30, bottom: 40, left: 80};
    const width = 1200 - margin.left - margin.right;
    const height = 500 -margin.top - margin.bottom;
    const xScale = d3.scaleTime().range([0,width]);
    const yScale = d3.scaleLinear().range([height,0]);


    const svg = d3.select("#chart").append("svg").attr("width", width + margin.left+margin.right)
    .attr("height", height + margin.top + margin.bottom).append("g").attr("transform",`translate(${margin.left},${margin.top})`);
    xScale.domain(d3.extent(data, d => d.Year));
    yScale.domain([200, d3.max(data, d => d.size)]);
    
    // Adding the axis to the svg container
    svg.append("g").attr("transform","translate(0,"+height+")").style("font-size","14px").call(d3.axisBottom(xScale).tickFormat(d3.format(".0f")))
    .call(g => g.select(".domain").remove()).selectAll(".tick line").style("stroke-opacity",0);

    svg.append("g").attr("transform","translate(0,0)").style("font-size", "14px").call(d3.axisLeft(yScale).tickFormat(d3.format(".0f")))
    .call(g => g.select(".domain").remove()).selectAll(".tick line").style("stroke-opacity",0).style("visibility","hidden");

    svg.selectAll(".tick text").attr("fill","#777").style("visibility",(d,i)=> {
        if (i === 11 || i === 0)  {
            return "hidden";  
        }
        else{
            return "visible"
        }
        }
    );
     // add title
     svg.append("text")
     .attr("class", "chart-title")
     .attr("x", margin.left - 115)
     .attr("y", margin.top - 120)
     .style("font-size", "24px")
     .style("font-weight", "bold")
     .style("font-family", "sans-serif")
     .text("Obesity and Eating Habits in America");


     svg.append("text")
     .attr("class", "chart-description")
     .attr("x", 0)
     .attr("y", -23)
     .style("font-size", "12px")
     .style("font-weight", "none")
     .style("font-family", "sans-serif")
     .text("With more and more Americans eating out, the fast food industry continues to grow. However, according to the 2022 American Customer Satisfaction survey, Americans' satisfication with fast food ")
 
 
     svg.append("text")
     .attr("class", "chart-description")
     .attr("x", 0)
     .attr("y", -9)
     .style("font-size", "12px")
     .style("font-weight", "none")
     .style("font-family", "sans-serif")
     .text("is dropping for all restaurants. Nevertheless, Americans continue to consume fast food on a regular bases. The expected CAGR for the industry is 5.1% from 2022 to 2027 ");
 


 
     svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0 - margin.left)
     .attr("x", 0 - (height / 2))
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .style("font-size", "14px")
     .style("fill", "#777")
     .style("font-family", "sans-serif")
     .text("Market Size (In Billions of US Dollar)");
 
     // Creating the gridlines
     svg.selectAll("xGrid").data(xScale.ticks().slice(1)).join("line").attr("x1", d => xScale(d)).attr("x2", d => xScale(d)).attr("y1",0).attr("y2", height)
     .attr("stroke", "#e0e0e0").attr("stroke-width", .5);
     svg.selectAll("yGrid").data(yScale.ticks()).join("line").attr("x1", 0).attr("x2", width).attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
     .attr("stroke", "#e0e0e0").attr("stroke-width", .5);
 
     var circleTooltip = d3.select("#circleTooltip");


     // Creating the line and formating the ticks

    const line = d3.line().x(d => xScale(Number(d.Year))).y(d => yScale(Number(d.size)));
    const path = svg.append("path").attr("fill","none").attr("stroke","darkorange").
    attr("stroke-width",2);
    function updatePath(data, line) {
        const updatePath = d3
          .select("path")
          .interrupt()
          .datum(data)
          .attr("d", line);

    const pathLength = updatePath.node().getTotalLength();

    const transitionPath = d3
        .transition()
        .ease(d3.easeSin)
        .duration(2500);
    updatePath
        .attr("stroke-dashoffset", pathLength)
        .attr("stroke-dasharray", pathLength)
        .transition(transitionPath)
        .attr("stroke-dashoffset", 0);

    svg.selectAll("circle").data(data).enter().append("circle").attr("class","line-circles")
    .attr("fill","darkorange").attr("stroke","darkorange")
    .attr("r",5).attr("cy", function (d) { return yScale(d.size); } )
    .on("mouseover", function(d,i){
        circleTooltip.style("opacity", 1)
        .style("left",(d3.event.pageX)+"px")
        .style("top",(d3.event.pageY)+"px")
        .style("font-size","14px")
        .style("height","35px")
        .html("Year: " + d.Year + "<br>" +  "Market Size: " + d.size+"B")
    }).on("mouseout", function(){circleTooltip.style("opacity",0)});
    
    }
    updatePath(data,line);

    svg.selectAll(".line-circles")
    .transition()
    .ease(d3.easeSin)
    .delay(100)
    .duration(2500)
    .attr("cx", function (d) { return xScale(Number(d.Year)); } )
    .attr("cy", function (d) { return yScale(Number(d.size)); } )


}
}


