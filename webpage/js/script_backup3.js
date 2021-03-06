// blue #689FE7
// red #9F0009

// var params = (function () {
//     var vars = {};
//     var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
//         function (m, key, value) {
//             vars[key] = value;
//         });
//     return vars;
// })();


d3.select("#buttonCheck").on("click", function () {

    var inputValue = d3.select("#twitterHandleInput").property("value");

    // console.log("button clicked")
    console.log(inputValue)


    if (inputValue) {

        var twitterName = '[{"name":"' + inputValue + '"}]';

        $.ajax({
            url: 'http://ec2-18-221-137-114.us-east-2.compute.amazonaws.com:80/result',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            method: 'POST',
            dataType: 'json',
            data: twitterName,
            contentType: "application/json",
            success: function (response) {
                console.log('success: ' + JSON.stringify(response));

                $('#myModal').modal('show');
                $('#myModal').on('shown.bs.modal', function (e) {
                    dataVizStuff(response);
                });
            }
        });
    } else {
        d3.select("#twitterHandleInput").property("placeholder", "Please enter a Twitter handle")
    }
});


function dataVizStuff(data) {

    //d3.json("data/mock_data_djt_v2.json", function (error, data) {
    //console.log(data.twitter_data.profile_banner_url)

    //(function() {    
    // .info
    d3.select(".banner").select("img").remove();

    d3.select(".banner")
        .append("img")
        .attr("src", data.twitter_data.profile_image_url)
        .attr("width", "100%");

    d3.select(".screen_name")
        .text(data.twitter_data.screen_name);

    d3.select(".name")
        .text(data.twitter_data.name);

    d3.select(".description")
        .text(data.twitter_data.description);

    d3.select(".location")
        .text(data.twitter_data.location);

    d3.select(".url")
        .html("<a href=" + data.twitter_data.url + " target=_blank>" + data.twitter_data.url + "</a>");

    d3.select(".created_at")
        .text(data.twitter_data.created_at);

    d3.select(".followers_count")
        .text(data.twitter_data.followers_count);

    d3.select(".friends_count")
        .text(data.twitter_data.friends_count);

    d3.select(".lang")
        .text(data.twitter_data.lang);

    d3.select(".time_zone")
        .text(data.twitter_data.time_zone);

    d3.select(".num_retweet")
        .text(data.twitter_data.num_retweet)

    d3.select(".avg_tweet_len")
        .text(data.twitter_data.avg_tweet_len)


    // .data-vis
    // var botValue = +data.bot_profile.score;
    // var politicalPropagandaValue = +data.political_profile.score;
    var botValue = +data.twitter_data.bot_prob;
    var politicalPropagandaValue = +data.twitter_data.political_score;
    var botWidth = parseInt(d3.select(".bot").style("width"));

    d3.select(window).on("resize", resize);

    function resize() {
        botWidth = parseInt(d3.select(".bot").style("width"));
        // var commonTopicsWidth = parseInt(d3.select(".common-topics-from-tweets").style("width"));
        circle(".bot", botWidth, botValue);
        circle(".political-propaganda", botWidth, politicalPropagandaValue);
        // barsFeatures(".profile-features", botWidth, data.twitter_data.bot_prob);
        // barsFeatures(".languge-features", botWidth, data.twitter_data.political_score);
        // commonTopics(".common-topics-from-tweets", commonTopicsWidth, data.common_topic)
    }

    resize();


    //}())

    function circle(element, width, data) {

        d3.select(element + " > svg").remove();

        var width = width,
            height = width * 2 / 3,
            radius = (height / 2) - (height / 15),
            arcWidth = radius / 4;

        var tau = 2 * Math.PI;

        var arc = d3.arc()
            .outerRadius(radius)
            .innerRadius(radius - arcWidth)
            .startAngle(0);

        var svg = d3.select(element).append("svg")
            .attr("width", width)
            .attr("height", height);

        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var background = g.append("path")
            .datum({ endAngle: tau })
            .style("fill", "steelblue")
            .attr("d", arc);

        var foreground = g.append("path")
            .datum({ endAngle: 0.01 * tau })
            .style("fill", "darkred")
            .attr("d", arc);

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "darkred")
            .attr("font-weight", "bold")
            .attr('font-size', height / 4)
            .text(data + " %");

        foreground.transition()
            .duration(750)
            .attrTween("d", arcTween((data / 100) * tau));

        function arcTween(newAngle) {
            return function (d) {
                var interpolate = d3.interpolate(d.endAngle, newAngle);
                return function (t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                };
            };
        }



    }

    function barsFeatures(element, width, data0) {

        d3.select(element + " > svg").remove();

        var widthSvg = width,
            heightSvg = width * 2 / 3
        margin = { top: 0, right: 20, bottom: 10, left: 0 },
            height = width * 2 / 3 - margin.top - margin.bottom,
            width = width - margin.left - margin.right;

        var svg = d3.select(element).append("svg")
            .attr("width", widthSvg)
            .attr("height", heightSvg);



        var dataArr = [];

        for (d in data0) {
            var tempArr = {};
            tempArr.name = (d[0].toUpperCase() + d.slice(1)).split("_").join(" ");
            tempArr.value = +data0[d];
            dataArr.push(tempArr)
        }

        var data = dataArr.slice(1);

        var yScale = d3.scaleBand().rangeRound([0, height]).padding(0.45)
            .domain(data.map(function (d) {
                return d.name;
            })),
            xScale = d3.scaleLinear().rangeRound([0, width])
                .domain([0, 1]);

        var group = svg.append("g")
            .attr("transform", "translate(" + [margin.left, margin.top] + ")");

        var bars = group
            .selectAll("rect")
            .data(data);

        var labels = group
            .selectAll("text")
            .data(data);

        bars
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", function (d, i) {
                return 0;
            })
            .attr("height", yScale.bandwidth())
            .attr("x", 0)
            .attr("y", function (d, i) {
                return yScale(d.name);
            })
            .style("fill", "steelblue")
            .transition()
            .duration(750)
            .attr("width", function (d, i) {
                return xScale(d.value);
            })


        labels
            .enter()
            .append("text")
            .attr("class", "label")

            .attr("x", 0)
            .attr("y", function (d, i) {
                return yScale(d.name) - 2;
            })
            .text(function (d, i) {
                return d.name; //  + " " + d.value * 100 + "%"
            })
            .style("font-size", 11)

        labels
            .enter()
            .append("text")
            .style("opacity", 0)
            .attr("class", "label")

            .attr("x", function (d, i) {
                return d.value < 0.15
                    ?
                    xScale(d.value) + 2
                    :
                    xScale(d.value) - 4;
            })
            .attr("y", function (d, i) {
                return yScale(d.name) + yScale.bandwidth() / 2;
            })
            .attr("text-anchor", function (d, i) {
                return d.value < 0.15
                    ?
                    "start"
                    :
                    "end";
            })
            .attr("dominant-baseline", "central")
            .text(function (d, i) {
                return d.value * 100 + "%";
            })
            .style("font-size", 13)
            .style("font-weight", "bold")
            .style("fill", function (d, i) {
                return d.value < 0.15
                    ?
                    "steelblue"
                    :
                    "white";
            })
            .transition()
            .duration(750)
            .style("opacity", 1);

    }

    function commonTopics(element, width, data0) {

        d3.select(element + " > svg").remove();

        var widthSvg = width,
            heightSvg = width / 3
        margin = { top: 0, right: 30, bottom: 0, left: width / 4 },
            height = (width / 3) - margin.top - margin.bottom,
            width = width - margin.left - margin.right;

        var svg = d3.select(element).append("svg")
            .attr("width", widthSvg)
            .attr("height", heightSvg);



        var data = [];

        data0.forEach(function (d) {
            data.push({ name: d[0], value: d[1] });
        })




        var yScale = d3.scaleBand().rangeRound([0, height]).padding(0.2)
            .domain(data.map(function (d) {
                return d.name;
            })),
            xScale = d3.scaleLinear().rangeRound([0, width])
                .domain([0, d3.max(data, function (d) {
                    return d.value;
                })]);


        var group = svg.append("g")
            .attr("transform", "translate(" + [margin.left, margin.top] + ")");

        var bars = group
            .selectAll("rect")
            .data(data);

        var labels = group
            .selectAll("text")
            .data(data);

        bars
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", function (d, i) {
                return 0;
            })
            .attr("height", yScale.bandwidth())
            .attr("x", 0)
            .attr("y", function (d, i) {
                return yScale(d.name);
            })
            .style("fill", "steelblue")
            .transition()
            .duration(750)
            .attr("width", function (d, i) {
                return xScale(d.value);
            })





        labels
            .enter()
            .append("text")
            .attr("class", "label")

            .attr("x", -5)
            .attr("y", function (d, i) {
                return yScale(d.name) + yScale.bandwidth() / 2;
            })
            .attr("text-anchor", function (d, i) {
                return "end";
            })
            .attr("dominant-baseline", "central")
            .text(function (d, i) {
                return d.name;
            })
            .style("font-size", 13)
            .style("font-weight", "bold")
            .style("fill", function (d, i) {
                return "steelblue";
            });

        labels
            .enter()
            .append("text")
            .attr("class", "label")

            .attr("x", function (d, i) {
                return xScale(d.value) - 5;
            })
            .attr("y", function (d, i) {
                return yScale(d.name) + yScale.bandwidth() / 2;
            })
            .attr("text-anchor", function (d, i) {
                return "end";
            })
            .attr("dominant-baseline", "central")
            .text(function (d, i) {
                return d.value;
            })
            .style("font-size", 13)
            .style("font-weight", "bold")
            .style("fill", function (d, i) {
                return "white";
            });
    }
}
