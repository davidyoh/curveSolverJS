//user data from csv
var curve = {
    xy: [],
    x: [3, 4, 5, 6], // this is always in days
    y: [1, 2, 3, 4],
    checklength: function() {
        console.log("x.length:" + this.x.length + " y.length:" + this.y.length)
        return this.x.length - this.y.length;
    },

    cleardata: function() {
        console.log("Clearing curve...")
        x = [];
        y = [];
        console.log("X:" + x + " Y:" + y);

    }
}


// 

$("#getcsvbtn").on("click", function(event) {
    console.log("Event: get CSV");
    // updatePanel();
    csv = $("#csvtext").val();
    console.log("CSv Text:" + csv);
    var results = Papa.parse(csv);
    console.log("Results: " + results);

    console.log("Number of lines parsed: " + results.meta.lines);
    console.log("Delimiter used: " + results.meta.delimiter);
    console.log("Whether process was aborted: " + results.meta.aborted);
    console.log("Array of field names: " + results.meta.fields);

    printcsv(results);
    updatecsv(results);
});

$("input:radio[name=curvetype]").on("click", function(event) {
    console.log("Radio Button changed");
    var option = $(this).val();
    console.log("Radio Option:" + option);

    prediction = solveEquation(option, curve.x, curve.y);
    console.log("Pred:" + prediction.type);

    console.log("Pred Parameters:" + prediction.p);
    drawPrediction(prediction, 10, 30)
    drawOverlay(prediction, curve.x, curve.y)

});



function drawOverlay(prediction, x, y) {

    var xp = [];
    var yp = [];
    var py = [];

    for (i = 0; i < x.length; i++) {
        xp.push(curve.x[i]);
        yp.push(curve.y[i]);
        py.push(prediction.curve(curve.x[i]));
    }

    var html = "";
    html += prediction.type + "</br>";

    for (i = 0; i < prediction.p.length; i++) {
        html += "<em>X</em>" + i + " = " + prediction.p[i] + "</br>";
    }

    $("#predvariables").html(html);

    var data = {
        labels: xp,
        datasets: [{
                label: "My First dataset",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: yp
            }, {
                label: "My First dataset",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(255,0,0,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: py
            }

        ]
    };
    var ctx = $("#predictionoverlay").get(0).getContext("2d");

    var myBarChart = new Chart(ctx).Line(data, {
        responsive: false
    });


}




// p = predictive object
// x = number of periods
// period 
function drawPrediction(p, x, period) {

    var xp = [];
    var yp = [];

    for (i = 0; i < x; i++) {
        xp.push(i * period);
        yp.push(p.curve(i * period))
    }

    var data = {
        labels: xp,
        datasets: [{
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: yp
        }]
    };
    var ctx = $("#predictionchart").get(0).getContext("2d");

    var myBarChart = new Chart(ctx).Line(data, {
        responsive: false
    });


}


function printcsv(results) {

    for (i = 0; i < results.data.length; i++) {
        console.log(results.data[i])
    }
}

function updatecsv(results) {
    console.log(curve.xy);
    console.log("Clearing XY in curve:");
    curve.xy = [];
    curve.x = [];
    curve.y = [];

    for (i = 0; i < results.data.length; i++) {
        console.log("Pushing... " + results.data[i]);
        curve.xy.push(results.data[i]);
    }


    for (i = 0; i < curve.xy.length; i++) {
        //   console.log(curve.xy[i][1]);
        curve.x.push(curve.xy[i][0]);
        curve.y.push(curve.xy[i][1]);
    }


    curve.checklength();
    // console.log("Doublechecking x: " + curve.x);
    $("#userdata").html(updatecurvetable(curve.x, curve.y));


}




function updatecurvetable(x, y) { // x and y are arrays. returns a block of html with TDs
    var html = "";

    html += '<tr class = "success">';

    for (i = 0; i < x.length; i++) {
        html += "<tr>";
        html += "<td>" + x[i] + "</td>";
        html += "<td>" + y[i] + "</td>";
        html += "</tr>";
    }

    html += '</tr>';

    var data = {
        labels: x,
        datasets: [{
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: y
        }]
    };
    var ctx = $("#userchart").get(0).getContext("2d");

    var myBarChart = new Chart(ctx).Line(data, {
        responsive: false
    });




    return html;

}



//convert curve into objects with period length, total length, etc





function getScurve(x, a1, a2, b1) {
    // y
    var y = a1 + a2 * Math.pow(x, b1);
    return y;

}

function getPareto(x, a, b) {
    // var y = Math.pow((b / x), a);
    var y = 1 / (Math.pow((b / x), a));
    return y;

}

// params is which equation to use.
// x is an array of day values
// y is the array of LTS
// returns an array of coefficents
function solveEquation(params, x, y) {
    console.log("Solving equation");
    //gets x values from global


    //Parms=fminsearch(fun,[100,30,10,5000],x,y);
    // Returns an array of coeffcients

    if (params == 'pareto') {


        decaycurve = function(x, P) {
            return x.map(
                function(xi) {
                    return getPareto(xi, P[0], P[1])
                }

            )
        };



        Parms = fminsearch(decaycurve, [1, 1], curve.x, curve.y, {
            maxIter: 10000,
            display: true
        });

        console.log("Solving for Pareto")
    } else if (params == 'scurve') {

        decaycurve = function(x, P) {
            return x.map(
                function(xi) {
                    return getScurve(xi, P[0], P[1], P[2])
                }

            )
        };



        Parms = fminsearch(decaycurve, [.01, .01, .1], curve.x, curve.y, {
            maxIter: 10000,
            display: true
        });
        console.log("Solving for sCurve")
    }


    //Math.round(original*100)/100  
    /*
    ra1 = Parms[0];
    ra2 = Parms[1];
    //rb1 = Parms[2];
    a1 = Math.round(Parms[0] * 1000) / 1000;
    a2 = Math.round(Parms[1] * 1000) / 1000;
    //b1 = Math.round(Parms[2]*1000)/1000;
*/
    var predictioncurve = {
        type: params,
        p: Parms,
        curve: function(x) {
            if (this.type == "pareto") {
                return getPareto(x, this.p[0], this.p[1]);
            }
            if (this.type == "scurve") {
                //console.log("x: " + x);
                //console.log(this.p[0] + " " + this.p[1] + " " + this.p[2])
                return getScurve(x, this.p[0], this.p[1], this.p[2])
            }
        }
    }


    return predictioncurve; // Returns an object above


}








function updatelts() {
    console.log("Updating LTS curve");

    userModel.emailcapability = $("input:checkbox[name=emailcapability]:checked").val();
    console.log("Email Capability" + userModel.emailcapability);
    var xlts = [];
    var ylts = [];

    //2 years
    /* for (i = 1; i < 25; i++) {
        x.push(i * 30);
    }*/

    // solve for LTS values
    // LTS
    // We have LTS day 1
    // LTS day 30
    // LTS 360
    // LTS 720


    // end solve

    var lts1 = $("#lts1").val();

    var lts30 = 1.5 * $("#lts1").val();
    console.log("LTS30: " + lts30);

    var lts360 = 3 * $("#lts360").val();
    console.log("LTS360: " + lts360);

    var lts720 = 3.5 * $("#lts1").val();
    console.log("LTS720: " + lts720);

    xlts = [1, 30, 360, 720, 1080];
    ylts = [lts1, lts30, lts360, lts720, lts720];

    var x = [];
    var y = [];

    p = solveEquation('', xlts, ylts);

    console.log("P0:" + p[0]);
    console.log("P1:" + p[1]);

    for (i = 1; i < 30; i++) {
        x.push(i);
        y.push(getPareto(i, p[0], p[1]));
    }



    console.log("LTS CURVE X:" + x);
    console.log("LTS CURVE Y:" + y);




    if (userModel.emailcapability == 'emailcapability') {



        var data = {
            labels: x,
            datasets: [{
                label: "My First dataset",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: y
            }]
        };
        var ctx = $("#ltscurvechart").get(0).getContext("2d");

        var myBarChart = new Chart(ctx).Line(data, {
            responsive: true
        });

    } else {

    }
    // if (userModel)
}


function updatePanel(options) {
    userModel.model = $("input:radio[name=bizmodel]:checked").val();
    userModel.period = $("input:radio[name=subperiod]:checked").val();
    userModel.subamount = $('#subamount').val();
    userModel.churn = $('#churnrate').val();
    // userModel.dailyLTV = userModel.subamount / userModel.period;

    console.log("Daily LTV: " + userModel.dailyLTV);


    //Construct update 
    var html = '<h5>Model</h5>';


    html += 'Model: ' + userModel.model;
    html += '<br />';
    html += 'Period: ' + userModel.period;
    html += '<br />';
    html += 'Amount: ' + userModel.subamount;
    html += '<br />';
    html += 'Churn: ' + userModel.churn;
    html += '<br />';
    html += 'Length of Customer Lifetime: ' + userModel.panel.lifetimelength + ' years';

    //Push new HTML
    $('#userpanel').html(html);

    if (options == 'ltvpanel') {


    }

}



function churnRate() {

    console.log("Churn Rate per period:" + userModel.churn);
    console.log("Billing period (in days):" + userModel.period);

    console.log("Calculating how many billing periods until 0 customers");

    var xdays = [];
    var ycustomers = [];

    var customers = 1000;
    var customersinit = 1000;
    var days = 0;
    var customerpercent = customers / customersinit;
    for (i = 0; i < 1000 && customerpercent > .01; i++) {

        days = i * userModel.period;
        xdays.push(days);
        customers = customers - (customers * userModel.churn);
        console.log("Day:" + days + " Billing Period:" + i + " Customers Left:" + customers + " Customer %:" + customers / customersinit);
        customerpercent = Math.round((customers / customersinit) * 1000) / 1000;


        ycustomers.push(customerpercent);
    }

    console.log("Years until 0: " + days / 365);
    userModel.panel.lifetimelength = Math.round(days / 365) * 1000 / 1000;
    console.log("Months 30 day(s) until 0: " + days / 30);

    console.log(xdays);
    console.log(ycustomers);

    userModel.xdays = xdays;

    // userModel.lifetimedays.push(xdays);
    //userModel.lifetimepercent.push(ycustomers);

    drawChurn(xdays, ycustomers);

}

function drawChurn(x, y) {
    updateChurn(y);
    var data = {
        labels: x,
        datasets: [{
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: y
        }]
    };
    var ctx = $("#churn").get(0).getContext("2d");
    var myLineChart = new Chart(ctx).Line(data, {
        responsive: true
    });
}

function updateChurn(y) {
    console.log("Update Churn");
    userModel.dchurn = y;
    console.log(userModel.dchurn);
}


function updateltvpanel() {
    console.log("Update LTV Panel");

    // depends on churn

    userModel.ltvcurve[0] = userModel.subamount; // very first one, should do this for the others too 

    for (i = 1; i < userModel.dchurn.length; i++) {
        tempLTV = parseFloat(userModel.ltvcurve[i - 1]) + parseFloat(userModel.dchurn[i]) * userModel.subamount;
        // tempLTV = Math.round(tempLTV) * 1000 / 1000;
        console.log("tempLTV: " + tempLTV);
        userModel.ltvcurve.push(tempLTV);

    }
    console.log("LTV Curve" + userModel.ltvcurve);


    drawLTVPanel(userModel.xdays, userModel.ltvcurve);
}

function drawLTVPanel(x, y) {
    var data = {
        labels: x,
        datasets: [{
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: y
        }]
    };
    var ctx = $("#ltvcurve").get(0).getContext("2d");

    var myBarChart = new Chart(ctx).Bar(data, {
        responsive: true
    });

}

function updateconversion() {
    userModel.conversion.regrate = $('#registrationrate').val();
    userModel.conversion.ltsrate = $('#lts1').val();
    userModel.conversion.vtsrate = $('#registrationrate').val() * $('#lts1').val();

    console.log("Reg:" + userModel.conversion.regrate);
    console.log("LTS1:" + userModel.conversion.ltsrate);
    console.log("VTS1:" + userModel.conversion.vtsrate);

    var aCPL = userModel.subamount * userModel.conversion.regrate;
    var aCPC = aCPL * userModel.conversion.regrate;
    console.log("aCPL: " + aCPL);
    console.log("aCPC:" + aCPC);
}

// TODO
/*
Google Analytics
	Define Initial landing Page % Rate
	Define Registration Rate
	http://www.igniteui.com/funnel-chart/bezier-curve-and-tooltips
	http://www.igniteui.com/funnel-chart/server-binding
LTV Curve
VPL Curve
LTS curve: ltv 1 * 2.5 in 2 years  * 1.5 first month

*/

///////////////////////////////////////////////////

fminsearch = function(fun, Parm0, x, y, Opt) { // fun = function(x,Parm)
    // example
    //
    //https://github.com/jonasalmeida/fminsearch - I can't believe I found this algorithm
    // x = [32,37,42,47,52,57,62,67,72,77,82,87,92];y=[749,1525,1947,2201,2380,2537,2671,2758,2803,2943,3007,2979,2992]
    // fun = function(x,P){return x.map(function(xi){return (P[0]+1/(1/(P[1]*(xi-P[2]))+1/P[3]))})}
    // Parms=jmat.fminsearch(fun,[100,30,10,5000],x,y)
    //
    // Another test:
    // x=[32,37,42,47,52,57,62,67,72,77,82,87,92];y=[0,34,59,77,99,114,121,133,146,159,165,173,170];
    //
    // Opt is an object will all other parameters, from the objective function (cost function), to the 
    // number of iterations, initial step vector and the display switch, for example
    // Parms=fminsearch(fun,[100,30,10,5000],x,y,{maxIter:10000,display:false})

    if (!Opt) {
        Opt = {}
    };
    if (!Opt.maxIter) {
        Opt.maxIter = 1000
    };
    if (!Opt.step) { // initial step is 1/100 of initial value (remember not to use zero in Parm0)
        Opt.step = Parm0.map(function(p) {
            return p / 100
        });
        Opt.step = Opt.step.map(function(si) {
            if (si == 0) {
                return 1
            } else {
                return si
            }
        }); // convert null steps into 1's
    };
    if (typeof(Opt.display) == 'undefined') {
        Opt.display = true
    };
    if (!Opt.objFun) {
        Opt.objFun = function(y, yp) {
            return y.map(function(yi, i) {
                return Math.pow((yi - yp[i]), 2)
            }).reduce(function(a, b) {
                return a + b
            })
        }
    } //SSD

    var cloneVector = function(V) {
        return V.map(function(v) {
            return v
        })
    };
    var ya, y0, yb, fP0, fP1;
    var P0 = cloneVector(Parm0),
        P1 = cloneVector(Parm0);
    var n = P0.length;
    var step = Opt.step;
    var funParm = function(P) {
            return Opt.objFun(y, fun(x, P))
        } //function (of Parameters) to minimize
        // silly multi-univariate screening
    for (var i = 0; i < Opt.maxIter; i++) {
        for (var j = 0; j < n; j++) { // take a step for each parameter
            P1 = cloneVector(P0);
            P1[j] += step[j];
            if (funParm(P1) < funParm(P0)) { // if parm value going in the righ direction
                step[j] = 1.2 * step[j]; // then go a little faster
                P0 = cloneVector(P1);
            } else {
                step[j] = -(0.5 * step[j]); // otherwiese reverse and go slower
            }
        }
        if (Opt.display) {
            if (i > (Opt.maxIter - 10)) {
                console.log(i + 1, funParm(P0), P0)
            }
        }
    }
    if (!!document.getElementById('plot')) { // if there is then use it
        fminsearch.plot(x, y, fun(x, P0), P0);
    }
    return P0
};

/*
fminsearch.load=function(src){ // script loading
    // example: fminsearch.load('http://localhost:8888/jmat/jmat.js')
    var s = document.createElement('script');
    s.src = src;
    document.head.appendChild(s);
    s.parentElement.removeChild(s);
};

fminsearch.plot=function(x,y,yp,Parms){ // ploting results using <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    // create Array in Google's format
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Observed');
    data.addColumn('number', 'Model fit');
    var n = x.length;
    for (var i=0;i<n;i++){
        data.addRow([x[i],y[i],yp[i]]);
    };
    //var chart = new google.visualization.ScatterChart(
    var titulo='Model fitting';
    if(!!Parms){titulo='Model parameters: '+Parms};
    var chart = new google.visualization.ComboChart(
        document.getElementById('plot'));
        chart.draw(data, {title: titulo,
                          width: 600, height: 400,
                          vAxis: {title: "Y", titleTextStyle: {color: "green"}},
                          hAxis: {title: "X", titleTextStyle: {color: "green"}},
                          seriesType: "scatter",
                          series: {1: {type: "line"}}}
                  );
}
*/