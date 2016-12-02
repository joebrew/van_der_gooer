var d3 = Plotly.d3

function normal_array( mean, stddev, size ){
    var arr = new Array(size), i;
    // from http://bl.ocks.org/nrabinowitz/2034281
    var generator = (function() {
        return d3.random.normal(mean, stddev);
    }());

    for( i=0; i< arr.length; i++ ){
        arr[i] = generator();
    }
    return arr;
}

var x0 = normal_array(2, 0.45, 300);
var y0 = normal_array(2, 0.45, 300);

var x1 = normal_array(6, 0.4, 200);
var y1 = normal_array(6, 0.4, 200)

var x2 = normal_array(4, 0.3, 200);
var y2 = normal_array(4, 0.3, 200);

var data = [
    {
        x: x0,
        y: y0,
        name: 'cluster1',
        mode: 'markers',
        marker: {
          color: 'rgb(100,100,100)'
        }
    }, {
        x: x1,
        y: y1,
        name: 'cluster2',
        mode: 'markers'   ,
        marker: {
          color: 'rgb(20,20,50)'
        }
    }, {
        x: x2,
        y: y2,
        name: 'cluster3',
        mode: 'markers',
        marker: {
          color: 'rgb(100, 10, 5)'
        }
    }, {
        x: x1,
        y: y0,
        name: 'cluster4',
        mode: 'markers',
        marker: {
          color: 'rgb(95,35,65)'
        }
    }
];

var layout = {
    height: 600,
    width: 680,
    showlegend: true
}

Plotly.newPlot('myDiv', data, layout);

var all_x = x0.concat(x1);
all_x.concat(x2);
var all_y = y0.concat(y1);
all_y.concat(y2);
console.log(all_x);

// DBSCAN implementation
function dbscan(set, eps, minPts) {
  var c=[];
  var visited = [];
  var noise = [];
  //var dPrime = d;
  for(var i=0;i<set.length;d++) {   
    var neighbourPoints;
    visited.push(set[i]); 
    neighbourPoints.push(regionQuery(set, set[i], eps)); // review this code
    if(neighbourPoints.length<minPts) {
      noise.push(set[i]);
    } else {
      
    }
  }
}

function regionQuery(set, point, eps) {
  var neighbourPoints = [];
  for(var i=0;i<set.length;i++) {
    if (pointDistance(point, set[i]) <= eps ) {
      neighbourPoints.push(set[i]);
    }
  }
  return neighbourPoints;
}

function expandCluster(point, neighbourPoints, cluster, eps, minPts, visited) {
  // var visited = [];
  cluster.push(point);
  var neighbourPointsPrime = [];
  for(var i=0;i<neighbourPoints.length;i++) {
    if(!visited.find(neighbourPoints[i])) { //if find does not work like this, try with a callback function
      visited.push(neighbourPoints[i]);
      neighbourPointsPrime = regionQuery(neighbourPoints, neighbourPoints[i], eps);
      if(neighbourPointsPrime.length>=minPts) {
        neighbourPoints.concat(neighbourPointsPrime);
      }
      if(!cluster.find(neighbourPoints[i])) {
        cluster.push(neighbourPoints[i]);
      }
    }
  }
}

function pointDistance(point1, point2) {
  var x1 = point1[0];
  var y1 = point1[1];
  var x2 = point2[0];
  var y2 = point2[1];

  var a = Math.abs(x1-x2);
  var b = Math.abs(y1-y2);
  return Math.sqrt(a*a + b*b);
}
