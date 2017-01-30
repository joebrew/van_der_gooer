exports dbscan = function(set, eps, minPts) {
    var c = [];
    var visited = [];
    var noise = [];
    // var dPrime = d;
    for (var i = 0; i < set.length; i++) {
        var neighbourPoints = [];
        visited.push(set[i]);
        neighbourPoints.concat(regionQuery(set, i, eps)); // review this code
        if (neighbourPoints.length < minPts) {
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
    console.log(c);
}

function regionQuery(set, point_index, eps) {
    var neighbourPoints = [];
    for (var i = 0; i < set.length; i++) {
        if (i === point_index) {
            continue;
        }
        if (geographicalDistance(set[point_index], set[i]) <= eps) {
            neighbourPoints.push(set[i]);
        }
    }
    return neighbourPoints;
}

function expandCluster(point, neighbourPoints, cluster, eps, minPts, visited) {
    // var visited = [];
    cluster.push(point);
    var neighbourPointsPrime = [];
    for (var i = 0; i < neighbourPoints.length; i++) {
        if (!visited.find(neighbourPoints[i])) { //if find does not work like this, try with a callback function
            visited.push(neighbourPoints[i]);
            neighbourPointsPrime = regionQuery(neighbourPoints, neighbourPoints[i], eps);
            if (neighbourPointsPrime.length >= minPts) {
                neighbourPoints.concat(neighbourPointsPrime);
            }
            if (!cluster.find(neighbourPoints[i])) {
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
    var a = Math.abs(point1.x - point2.x);
    var b = Math.abs(point1.y - point2.y);
    return Math.sqrt(a * a + b * b);
}

function geographicalDistance(point1, point2) {
    var Rk = 6373;
    var lat1 = deg2rad(point1.lat);
    var lon1 = deg2rad(point1.lng);
    var lat2 = deg2rad(point2.lat);
    var lon2 = deg2rad(point2.lng);

    var dlat = lat2 - lat1;
    var dlon = lon2 - lon1;

    var a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
    return c * Rk; // great circle distance in km
}

function deg2rad(deg) {
    rad = deg * Math.PI / 180; // radians = degrees * pi/180
    return rad;
}