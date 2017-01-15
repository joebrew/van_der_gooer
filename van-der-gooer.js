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

// ----------------------------------------------------------------------------------------------------

d3.csv("./data/testing_data_sets/data_set_1.csv", function(data) {
  console.log(data);
});

// ----------------------------------------------------------------------------------------------------

// DBSCAN implementation

// DBSCAN requires two parameters: eps and the minimum number of points required to form a dense region[a] (minPts). 
// It starts with an arbitrary starting point that has not been visited. 
// This point's eps-neighborhood is retrieved, and if it contains sufficiently many points, a cluster is started. 
// Otherwise, the point is labeled as noise. Note that this point might later be found in a sufficiently sized eps-environment of a different point and hence be made part of a cluster.
// If a point is found to be a dense part of a cluster, its eps-neighborhood is also part of that cluster. 
// Hence, all points that are found within the eps-neighborhood are added, as is their own eps-neighborhood when they are also dense. 
// This process continues until the density-connected cluster is completely found. Then, a new unvisited point is retrieved and processed, leading to the discovery of a further cluster or noise.

// We assume that the structure of the set is as follows:
// var set = [
//   {
//     x: value,
//     y: value,
//     label: value,
//     true_label: value
//   }
// ]
function dbscan(set, eps, minPts) {
  var c=[];
  var visited = [];
  var noise = [];
  //var dPrime = d;
  for(var i=0;i<set.length;d++) {   
    var neighbourPoints = [];
    visited.push(set[i]); 
    neighbourPoints.concat(regionQuery(set, i, eps)); // review this code
    if(neighbourPoints.length<minPts) {
      noise.push(set[i]);
    } else {
      var clusterId = c.length;
      c.push([]);
      c[clusterId].push(set[i]);
      var expansion = expandCluster(set[i], neighbourPoints, c[clusterId], eps, minPts, visited);
      visited = expansion.visited_points;
      neighbourPoints = expansion.neighbour_points;
      c = expansion.cluster;
    }
  }
}

function regionQuery(set, point_index, eps) {
  var neighbourPoints = [];
  for(var i=0;i<set.length;i++) {
    if(i===point_index) {
      continue;
    }
    if (pointDistance(set[point_index], set[i]) <= eps ) {
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
  return {
    visited_points: visited,
    neighbour_points: neighbourPoints,
    cluster: cluster
  }
}

function pointDistance(point1, point2) {
  var a = Math.abs(point1.x-point2.x);
  var b = Math.abs(point1.y-point2.y);
  return Math.sqrt(a*a + b*b);
}
