// ---------------------------------- LOADING DATA ------------------------------------------------------------------

//let json = require('./testing_data_sets/data_set_1.json');
//let dataset = JSON.parse(json);
// d3.csv("./data_set_1.csv", function(data) {
//   debugger;
//   console.log(data);
//   dataset.push(data); 
//   dbscan(data, 5, 10);
// });
// dbscan(dataset, 5, 10);
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
// let set = [
//   {
//     lat: value,
//     lng: value,
//     label: value,
//     true_label: value
//   }
// ]

module.exports = {
    dbscan: function(set, eps, minPts) {
        let clusters = [] // set containing all the clusters
        let visited = [] // set of visited points
        let noise = [] // points not belonging to any clusters

        for (let i = 0; i < set.length; i = i + 1) {
            let neighbourPoints = regionQuery(set, i, eps) || [] // get all points neighbouring given point

            visited.push(set[i]) // mark as visited

            if (neighbourPoints.length < minPts) {
                noise.push(set[i]) // if not complying with clustering requirements mark as noise
            } else {
                let clusterId = clusters.length // define id of the current cluster
                clusters.push([]) // create new empty cluster for the currently expanding one
                clusters[clusterId].push(set[i]) // add current point to the current cluster
                let expansion = expandCluster(set[i], neighbourPoints, clusters[clusterId], eps, minPts, visited) // expand current cluster
                visited = expansion.visited_points // mark expanded points as visited
                clusters[clusterId] = expansion.cluster
            }
        }
        console.log(c)
    },

    regionQuery: (set, point_index, eps) => set
        .reduce((acc, current) => {
            if (geographicalDistance(set[point_index], current) <= eps) {
                return acc.concat(current)
            } else {
                return acc || []
            }
        }, []),

    expandCluster: (point, neighbourPoints, eps, minPts, visited) => { // why is it working only on neighbouring points set and not on the whole dataset?
        let cluster = [point]
        let neighbourPointsPrime = []

        for (let i = 0; i < neighbourPoints.length; i++) {
            if (!visited.find(neighbourPoints[i])) {
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
    },

    geographicalDistance: function(point1, point2) {
        let Rk = 6373;
        let lat1 = deg2rad(point1.lat);
        let lon1 = deg2rad(point1.lng);
        let lat2 = deg2rad(point2.lat);
        let lon2 = deg2rad(point2.lng);

        let dlat = lat2 - lat1;
        let dlon = lon2 - lon1;

        let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
        return c * Rk * 1000; // great circle distance in km
    }
}

let regionQuery = (set, point_index, eps) => set
    .filter((element) => (element.lat !== set[point_index].lat) && (element.lng !== set[point_index].lng))
    .reduce((acc, current) => {
        if (geographicalDistance(set[point_index], current) <= eps) {
            return acc.concat(current)
        } else {
            return acc || []
        }
    }, [])

function expandCluster(point, neighbourPoints, cluster, eps, minPts, visited) {
    // let visited = [];
    cluster.push(point);
    let neighbourPointsPrime = [];
    for (let i = 0; i < neighbourPoints.length; i++) {
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

let pointDistance = (point1, point2) => {
    let a = Math.abs(point1.x - point2.x) || Math.abs(point1.lat - point2.lat);
    let b = Math.abs(point1.y - point2.y) || Math.abs(point1.lng - point2.lng);
    return Math.sqrt(a * a + b * b);
}

let geographicalDistance = (point1, point2) => {
    let Rk = 6373;
    let lat1 = deg2rad(point1.lat) || deg2rad(point1.x);
    let lon1 = deg2rad(point1.lng) || deg2rad(point1.y);
    let lat2 = deg2rad(point2.lat) || deg2rad(point2.x);
    let lon2 = deg2rad(point2.lng) || deg2rad(point2.y);

    let dlat = lat2 - lat1;
    let dlon = lon2 - lon1;

    let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
    return c * Rk * 1000; // great circle distance in m
}

let deg2rad = (deg) => deg * Math.PI / 180