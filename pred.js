var userModel = {
    model: '',
    period: 0, // in days
    subamount: 0,
    churn: 0.20, //% with decimals i.e. 0.30
    ltv30: 0,
    dchurn: [],
    ltvcurve: [],
    xdays: [],

    panel: {
        lifetimelength: 0
    },
    conversion: {
        regrate: 0,
        ltsrate: 0,
        vtsrate: 0

    },
    emailcapability: 0,
    ltscurve: []

};

//convert curve into objects with period length, total length, etc



// event listeners

$(".radio").on("change", function(event) {
    console.log("Event: Radio change");
    // updatePanel();
});

$("#subamount").on("change", function(event) {
    console.log("Event: Sub Amount");
    // updatePanel();
});

$("#updatenow").on("click", function(event) {
    console.log("Update Now");
    updatePanel();
    churnRate();
});

$("#updateltvbtn").on("click", function(event) {
    console.log("Update updateltvbtn");
    updateltvpanel();
    updatePanel();
});


$("#updateconversionbtn").on("click", function(event) {
    console.log("Update conversion");
    updateconversion();
    updatePanel();
});

$("#emailcapability").on("change", function(event) {
    console.log("Email Conversion Capability");
    updatelts();
    //updatePanel();
});



//$('.churnslider').slider();





function getROAS(x, a1, a2, b1) {
    // y

    var y = a1 + a2 * Math.pow(x, b1);
    //console.log ("getROAS: y = " + y);
    return y;

}

function getPareto(x, a, b) {
    var y = 1 / (Math.pow((b / x), a));
    return y;

}

// params is which equation to use.
// x is an array of day values
// y is the array of LTS
function solveEquation(params, x, y) {


    console.log("Solving equation");
    //gets x values from global

    decaycurve = function(x, P) {

        return x.map(
            function(xi) {
                return getPareto(xi, P[0], P[1])
            }

        )
    };


    //Parms=fminsearch(fun,[100,30,10,5000],x,y);
    // Returns an array of coeffcients
    Parms = fminsearch(decaycurve, [.1, .1], x, y, {
        maxIter: 10000,
        display: true
    });


    //Math.round(original*100)/100  

    ra1 = Parms[0];
    ra2 = Parms[1];
    //rb1 = Parms[2];
    a1 = Math.round(Parms[0] * 1000) / 1000;
    a2 = Math.round(Parms[1] * 1000) / 1000;
    //b1 = Math.round(Parms[2]*1000)/1000;

    /*
    for (i = 0; i < x.length; i++) {
        roascurve.push(getPareto(x[i], Parms[0], Parms[1]));

    }
*/
    return Parms; // Returns Array of Co-Efficients


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