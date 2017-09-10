const Plotly = require('plotly')
const fs = require('fs')


var d3 = Plotly.d3;

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

let regionQuery = (set, point_index, eps) => set
    .filter((element) => (element.lat !== set[point_index].lat) && (element.lng !== set[point_index].lng))
    .reduce((acc, current) => {
        if (geographicalDistance(set[point_index], current) <= eps) {
            return acc.concat(current)
        } else {
            return acc || []
        }
    }, [])

function dbscan(set, minPts, eps) {
    let clusters = [] // set containing all the clusters
    let visited = [] // set of visited points
    let noise = [] // points not belonging to any clusters

    for (let i = 0; i < set.length; i = i + 1) {
        if (visited.find((element) => element.lat === set[i].lat && element.lng === set[i].lng)) {
            continue
        } else {
            let neighbourPoints = regionQuery(set, i, eps) || [] // get all points neighbouring given point
            neighbourPoints.push(set[i])
            visited.push(set[i]) // mark as visited

            if (neighbourPoints.length < minPts) {
                noise.push(set[i]) // if not complying with clustering requirements mark as noise
            } else {
                let clusterId = clusters.length // define id of the current cluster
                clusters.push([]) // create new empty cluster for the currently expanding one
                clusters[clusterId].push(set[i]) // add current point to the current cluster
                let neighbourPointsPrime = []
                for (let j = 0; j < neighbourPoints.length; j = j + 1) {
                    if (visited.find((element) => element.lat !== neighbourPoints[j].lat && element.lng !== neighbourPoints[j].lng)) {
                        visited.push(neighbourPoints[j])
                        let currentIdxInSet = set.findIndex((element) => element.lat === neighbourPoints[j].lat && element.lng === neighbourPoints[j].lng)
                        neighbourPointsPrime = regionQuery(set, currentIdxInSet, eps)
                        if (neighbourPointsPrime.length >= minPts) {
                            neighbourPoints = neighbourPointsPrime
                                .filter((el1) => {
                                    let neighbourSet = neighbourPoints.find(el2 => el1.lat == el2.lat) || { lng: null }
                                    return el1.lng !== neighbourSet.lng
                                })
                                .concat(neighbourPoints)
                        }
                    }
                }
                // if (clusters[clusterId].find((element) => element.lat !== neighbourPoints[j].lat && element.lng !== neighbourPoints[j].lng)) {
                //     clusters[clusterId] = clusters[clusterId].concat(neighbourPoints[j])
                // }
                clusters[clusterId] = neighbourPoints
            }
        }
    }
    // console.log('noise:', noise)
    // clusters.forEach((element, i) => console.log('Cluster', i, ': \n', element))
    return {
        clusters: clusters,
        noise: noise
    }
}



// const d3 = require('d3');

// function normal_array(mean, stddev, size) {
//     var arr = new Array(size),
//         i;
//     // from http://bl.ocks.org/nrabinowitz/2034281
//     var generator = (function() {
//         return d3.random.normal(mean, stddev);
//     }());

//     for (i = 0; i < arr.length; i++) {
//         arr[i] = generator();
//     }
//     return arr;
// }

// var x0 = normal_array(2, 0.45, 300);
// var y0 = normal_array(2, 0.45, 300);

// var x1 = normal_array(6, 0.4, 200);
// var y1 = normal_array(6, 0.4, 200)

// var x2 = normal_array(4, 0.3, 200);
// var y2 = normal_array(4, 0.3, 200);

// var data = [{
//     x: x0,
//     y: y0,
//     name: 'cluster1',
//     mode: 'markers',
//     marker: {
//         color: 'rgb(100,100,100)'
//     }
// }, {
//     x: x1,
//     y: y1,
//     name: 'cluster2',
//     mode: 'markers',
//     marker: {
//         color: 'rgb(20,20,50)'
//     }
// }, {
//     x: x2,
//     y: y2,
//     name: 'cluster3',
//     mode: 'markers',
//     marker: {
//         color: 'rgb(100, 10, 5)'
//     }
// }, {
//     x: x1,
//     y: y0,
//     name: 'cluster4',
//     mode: 'markers',
//     marker: {
//         color: 'rgb(95,35,65)'
//     }
// }];

let layout = {
    height: 600,
    width: 680,
    showlegend: true
}

let data = fs.readFileSync('./data/testing_data_sets/data_set_1000.json', 'utf-8')


Plotly.newPlot('myDiv', JSON.parse(data), layout);

// var all_x = x0.concat(x1);
// all_x.concat(x2);
// var all_y = y0.concat(y1);
// all_y.concat(y2);
// console.log(all_x);