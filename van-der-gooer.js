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
console.log(x0);
var y0 = normal_array(2, 0.45, 300);

var x1 = normal_array(6, 0.4, 200);
console.log(x1);
var y1 = normal_array(6, 0.4, 200)

var x2 = normal_array(4, 0.3, 200);
var y2 = normal_array(4, 0.3, 200);

var data = [
    {    
        x: x0,
        y: y0,
        mode: 'markers',
        marker: {
          color: 'rgb(0,0,0)'
        }
    }, {
        x: x1,
        y: y1,
        mode: 'markers'   ,
        marker: {
          color: 'rgb(0,0,0)'
        }             
    }, {
        x: x2,
        y: y2,
        mode: 'markers',
        marker: {
          color: 'rgb(0,0,0)'
        }     
    }, {
        x: x1,
        y: y0,
        mode: 'markers',
        marker: {
          color: 'rgb(0,0,0)'
        }      
    }             
];

var layout = {
    height: 600,
    width: 680,
    showlegend: true
}

Plotly.newPlot('myDiv', data, layout);