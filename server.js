var fs = require('fs');
var http = require('http');
const { Server: socketio } = require('socket.io');
var url = require("url");
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
var querystring = require("querystring");
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');

const db = require('./database');

var socketServer;
var portName = 'COM10'; // change this to your Arduino port
var serialPort = new SerialPort({
  path: portName,
  baudRate: 9600,
  // defaults for Arduino serial communication
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});
var sendData = "";
const port = 1337;

// handle contains locations to browse to (vote and poll); pathnames.
function startServer(route, handle, debug) {
  // on request event
  function onRequest(request, response) {
    var postData = "";
    var pathname = url.parse(request.url).pathname;
    request.setEncoding("utf8");

    request.addListener("data", function (postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '" +
        postDataChunk + "'.");
    });

    request.addListener("end", function () {
      var postDataObject = querystring.parse(postData);
      route(handle, pathname, response, postDataObject);
    });
  }

  var httpServer = http.createServer(onRequest).listen(port, function () {
    console.log(`Server running at http://localhost:${port}`);
  });

  // serialListener(debug);
  serialListener(debug);
  initSocketIO(httpServer, debug);
}

function initSocketIO(httpServer, debug) {
  socketServer = new socketio(httpServer);
  socketServer.on('connection', function (socket) {
    console.log("user connected");
    socket.emit('onconnection', { pollOneValue: sendData });
    socketServer.on('update', function (data) {
      socket.emit('updateData', { pollOneValue: data });
    });
    socket.on('buttonval', function (data) {
      serialPort.write(data + 'E');
    });
    socket.on('sliderval', function (data) {
      serialPort.write(data + 'P');
    });
  });
}

function onSerialOpen() {
  serialPort.on('data', onData);
}

function onData(data) {
  process.stdout.write(data);
}

function onError(err) {
  err && console.error(err);
}

function writeData(data) {
  serialPort.write(data, onError);
}

// Listen to serial port
function serialListener(debug) {
  var receivedData = "";

  serialPort.on("open", function () {
    // Listens to incoming data

    var readData = "";  // this stores the buffer
    var cleanTemp = ""; // this stores the clean data
    var cleanHum = ""; // this stores the clean data
    var cleanLigh = ""; // this stores the clean data

    serialPort.on('data', function (data) {
      readData += data.toString(); // append data to buffer
      
      if (readData.indexOf("B") >= 0 && readData.indexOf("A") >= 0) {
        cleanLigh = readData.substring(readData.indexOf("A") + 1, readData.indexOf("B"));
        light = parseFloat(cleanLigh);
        SocketIO_serialemit(light, "ligth");
      }

      if (readData.indexOf("D") >= 0 && readData.indexOf("C") >= 0) {
        cleanTemp = readData.substring(readData.indexOf("C") + 1, readData.indexOf("D"));
        temperature = parseFloat(cleanTemp);
        SocketIO_serialemit(temperature, "temperature");
        alarmSender('temperature', temperature);
      }

      if (readData.indexOf("F") >= 0 && readData.indexOf("E") >= 0) {
        cleanHum = readData.substring(readData.indexOf("E") + 1, readData.indexOf("F"));
        humidity = parseFloat(cleanHum);
        SocketIO_serialemit(humidity, "humidity");
        alarmSender('humidity', humidity);
      }
      readData = "";
    });
  });
}

function SocketIO_serialemit(sendData, type) {
  var x = (new Date()).getTime(), // current time
    y = sendData;
  socketServer.emit('updateData', {
    x: x,
    y: y,
    type: type
  });
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'federica.commisso.2000@gmail.com',
    pass: 'psiozodsadmztkkk'
  }
});

function checkRangeExists(measure, val, callback) {
  const query = 'SELECT * FROM range WHERE measure = ? and (maximum <= ? or minimum >= ?)';
  db.get(query, [measure, val, val], (err, row) => {
    if (err) {
      return callback(err);
    }
    // if row = null the value is within range
    callback(row ? row : null);
  });
}

function alarmSender(measure, value) {
  checkRangeExists(measure, value, (err, row) => {
    if (err) {
      console.error('Error checking temperature range:', err);

      // send emails
      var emailtext = measure + " is out of range: " + value;
      var emailDataset = [];
      var currentdate = new Date();
      var datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();

      
      db.each('SELECT email FROM contacts', (err, row) => {
        if (err) {
          throw err;
        }
        emailDataset.push(row.email); // Add each email to the array
      }, () => {
        if (emailDataset.length > 0) {
          // Set up the email options
          const mailOptions = {
            from: 'federica.commisso.2000@gmail.com',
            to: emailDataset,
            subject: 'Sensor Alarm',
            text: 'Hello, check the sensors and greenhouse. Problem detected: ' + datetime + ", " + emailtext,
          };
        
          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
          });
        }
      });
    }
  });
}

exports.start = startServer;