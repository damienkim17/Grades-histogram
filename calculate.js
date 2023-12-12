var dataArray = [];
var grades = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F'];

// start parsing input file
function init(){
    document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
}

// bounds input change
function handleChange() {
    draw(dataArray);
}

function fileValidation() {
    let fileInput = document.getElementById("fileInput");
    let fileName = fileInput.value.toLowerCase();

    // get array of <p> elements
    const message = document.getElementsByClassName("error");
    // reset display if error message was showing previously
    message[0].style.display = "none";

    // check if file type is .csv
    if (!fileName.endsWith('.csv')) {
        message[0].style.display = "block";
        message[0].innerText = "Only .csv files are accepted";
        return false;
    }
    return true;
}

function handleFileSelect(event){
    // return if invalid file input
    if (!fileValidation()) {
        return;
    }
    const reader = new FileReader();
    // store data into a 2d array
    reader.onload = processData;
    // read data from csv as a string
    reader.readAsText(event.target.files[0]);
}

function processData(event) {
    let csv = event.target.result;
    // split into subarrays after each character return and newline
    let allTextLines = csv.split(/\r?\n/);
    // fill array by name, score
    for (let i = 0; i < allTextLines.length; i++) {
        // csv separate columns by semicolon
        let row = allTextLines[i].split(';');
        let col = [];
        for (let j = 0; j < row.length; j++) {
            col.push(row[j]);
        }
        dataArray.push(col);
    }
    for (let i = 0; i < dataArray.length; i++) {
        // split subarrays by name and score
        dataArray[i] = dataArray[i][0].split(',');
        
        // check if value in second column is a number
        if (isNaN(parseInt(dataArray[i][1]))) {
            dataArray.shift();
            dataArray[i] = dataArray[i][0].split(',');
        }
    }

    draw(dataArray);
}

function reset() {
    getDefault();
    draw(dataArray);
}

function getDefault() {
    // set current bounds values to their defaults
    var reset = document.querySelectorAll(".score");
    for (i = 0; i < reset.length; i++) {
        reset[i].value = reset[i].defaultValue;
    }
}

function updateBounds() {
    // store inputs into array
    let inputs = document.querySelectorAll('.score');
    // get array of <p> elements
    const message = document.getElementsByClassName("error");
    // reset display if error message was showing previously
    message[1].style.display = "none";

    var max = inputs[0].value;
    let min = inputs[inputs.length-1].value;
 
    // array for storing valid bounds ranges
    var boundsArray = [];
    // sorts valid bounds in reverse order, start checking bounds from end of inputs array
    // compare current input value with the previous and next
    console.log('max', max);
    for (let i = 0; i < inputs.length; i++) {
        let minVal;
        let maxVal;
        let curVal = parseFloat(inputs[inputs.length-1-i].value);
        
        // minVal = curVal if checking end of array
        if (i > 0) {
            minVal = parseFloat(inputs[inputs.length-i].value);
        } else {
            minVal = curVal;
        }
        // maxVa; = curVal if checking start of array
        if (i < inputs.length-1) {
            maxVal = parseFloat(inputs[inputs.length-2-i].value);
        } else {
            maxVal = curVal;
        }
        console.log(curVal);
        // error handling
        try {
            if ((i == 0)) {
                if (parseFloat(max) < 0 || parseFloat(min) < 0) throw "Cannot enter negative numbers";
                if (isNaN(max) || isNaN(min)) throw "Enter a number";
                if (curVal >= max) throw "Input is greater than max bound";
            } else {
                if (isNaN(curVal)) throw "Enter a number";
                if (curVal < 0 || max < 0 || min < 0) throw "Enter a positive number";
                if (max > 100.00) throw "Max bound cannot\nexceed 100.00";
                if (curVal <= minVal) throw "Invalid bound";
                //if (curVal >= max) throw "Input is greater than max bound";
            }
        }
        catch(err) {
            // reset values
            
            getDefault();
            //inputs[i-1].style.border = "thick solid red";
            // display error message
            message[1].style.display = "block";
            message[1].innerText = "Error: " + err;
            // return an empty array
            boundsArray = [];
            return boundsArray;
        }

        max = parseFloat(max);
        // Max bound = boundsArray[0], compare with current maxVal
        if (max <= maxVal) {
            // new max is last value to be pushed
            maxVal = max;
            boundsArray.push({
                cur: curVal,
                max: maxVal,
                count: 0,
            });  
            break;
        }

        // case i != start or end of array
        if (curVal != minVal && curVal > minVal && curVal < maxVal) {
            boundsArray.push({
                cur: curVal,
                max: maxVal,
                count: 0,
            }); 
        } 

        // case for checking at start of array
        else if (curVal == minVal && curVal < maxVal) {
            //console.log('cum2');
            boundsArray.push({
                cur: curVal,
                //prev: minVal,
                max: maxVal,
                count: 0,
            });
        }
        
        // case for checking at end of array
        else if (curVal > minVal && 100.00 >= maxVal) {
            boundsArray.push({
                cur: curVal,
                max: maxVal,
                count: 0,
            });
        }
    }
    //console.log('boundsArray: ', boundsArray);
    return boundsArray;
}

function draw(dataArray) {
    var binArray = updateBounds();

    for (let i = 0; i < dataArray.length; i++) {
        dataArray[i][1] = parseFloat(dataArray[i][1]);
    }

    var statsArray = [];
    // loop through array containing parsed .csv data and compare student scores with bounds ranges
    // store number of buckets for graphing and student data within valid bounds
    for (let i = 0; i < dataArray.length; i++) {
        for (let j = 0; j < binArray.length; j++) {
            if (dataArray[i][1] >= binArray[j].cur && dataArray[i][1] < binArray[j].max) {
                binArray[j].count++;
                statsArray.push(dataArray[i]);
            }
        }
        
    }
    /* console.log('bins: ', binArray);
    console.log('stats: ', statsArray); */

    let canvas = document.getElementById('graph');
    let ctx = canvas.getContext('2d');

    ctx.lineWidth = 3;
    ctx.font = "18pt monospace, Arial, sans-serif";
    ctx.fillStyle = "#192231";
    ctx.textAlign = 'center';
    
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let width = 80;
    let X = 60;
    
    binArray.reverse();
  
    var scale = 100;
    // store scores into new array
    if (binArray.length != 0) {
        let maxBin = binArray.reduce((a,b)=>a.count > b.count ? a : b).count;
        scale = (450/maxBin);
    }
    

    console.log(binArray);
    // plot bins on bar graph
    let offset = 0; // for cases where grade ranges are excluded
    for (let i = 0; i < grades.length; i++) {
        let h;
        ctx.fillStyle = "#192231";
        // grades labels on x-axis
        ctx.fillText(grades[i],X+(width/2),580);
        ctx.fillStyle = "#52658f";
        // offset = number of bins - number of grades
        if (binArray[grades.length-1-i] === undefined) {
            // no bar to be printed
            h = 0;
            offset++;
        } else {
            // value for y-coordinate and height of bar
            h = binArray[i-offset].count * scale;
        }

        // print bar representing number of scores in bounds range
        ctx.fillRect(X,canvas.height-h-50,width,h);
        X += width + 60;
    }

    ctx.strokeStyle = "#192231";
    ctx.fillStyle = "#192231";
    ctx.beginPath();

    // draw x-axis
    ctx.moveTo(30,canvas.height-50);
    ctx.lineTo(canvas.width-30,canvas.height-50);

    // draw y-axis
    ctx.moveTo(30, 0);
    ctx.lineTo(30,canvas.height-50);

    
    let lineY = canvas.height-scale-50;

    ctx.moveTo(25,lineY);
    ctx.lineTo(35,lineY);

    let labelY = 1;
    // draw y-axis labels & ticks
    for (let i = lineY; i >= 50; i-=scale) {
        ctx.moveTo(25, i);
        ctx.lineTo(35, i);
        
        ctx.fillText(labelY, 10, i+7);
        labelY++;
    }
    ctx.stroke();

    return getStats(statsArray);
}

function getStats(statsArray) {
    if (statsArray.length === 0) {
        return;
    }
    // store scores into new array
    let scores = statsArray.map(function(value) {
        return value[1];
    });
    // store names into new array
    let names = statsArray.map(function(name) {
        return name[0];
    })

    // remove spaces
    names = names.map(name => {
        return name.trim();
    })

    var max = Math.max.apply(null, scores);
    let indexMax = scores.indexOf(max);
    var min = Math.min.apply(null, scores);
    let indexMin = scores.indexOf(min);

    var median = getMedian();
    // Cond: array is sorted
    // median(array) = X[(n+1)/2] if odd, (2 middle vals in X)/2 if even
    function getMedian() {
        const sorted = scores.sort((a,b) => a-b);
        const mid = Math.floor(sorted.length/2);
        // array length is odd
        if (sorted.length % 2 === 0) {
            return (sorted[mid-1] + sorted[mid]) / 2;
        }
        // array length is even
        return sorted[mid];
    }

    // sum = prev+cur from i = 0 to len-1
    const sum = scores.reduce((a,b) => a + b, 0);
    const avg = (sum/scores.length) || 0;
    
    document.getElementById("high").innerText = names[indexMax] + " (" + max + "%)";
    document.getElementById("low").innerText = names[indexMin] + " (" + min + "%)";
    document.getElementById("mean").innerText = avg.toFixed(2) + "%";
    document.getElementById("median").innerText = median.toFixed(2) + "%";
}