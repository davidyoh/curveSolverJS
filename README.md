# curveSolverJS
Experimental algorithms to automatically solve non-linear curves given X and Y using Map-Reduce patterns. Multiparametric nonlinear regression in javascript. Heavily influenced by [fminsearch](https://github.com/jonasalmeida/fminsearch) developed by jonsalmeida. 

> The core algorithm is a variation on the golden rule of speeding
> changes in the values of the parameters that decrease the objective
> function (cost function), while reversing and slowing it down
> otherwiese. Accordingly, the core algorithm only really has two lines

This means it uses random starting values and tries it out, and if it hits upon something that looks right, then it uses gradient descent to quickly hone in on the correct values for a particular equation.

Currently has Pareto and S-Curve
####  Pareto
(inverted version of regular pareto)
y = 1 / (Math.pow((b / x), a));
####  S-Curve
y = a1 + a2 * Math.pow(x, b1);
## How to Use
Download the repo and you can run as-is on your local browser on your computer without a server.
## Interesting functions to look at:
### js/curvesolve.js
function getScurve(x, a1, a2, b1) 
function getPareto(x, a, b)
solveEquation(params, x, y)
## Main Credit
https://github.com/jonasalmeida/fminsearch
> The purpose is to develope a simple heuristic for non-linear
> regression that makes the most of javascript's functional style, and
> specifically of Map-Reduce patterns, while demanding the least from
> the browser. The algorithm development has a core regression thread
> that is elaborated through the use of Options (Opt). These options
> range from the basic of setting the display and controlling the number
> of iterations, all the way to configuring the output variable, setting
> th cost function and executing paralelized Genetic Algorithm style.

### Other Credits
https://github.com/mholt/PapaParse - CSV parsing
Bootstrap