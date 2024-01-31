const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = require('./database');

function start(response) {
  console.log("Request handler 'start' was called.");

  // Read the HTML content from the file
  const filePath = path.join(__dirname, 'public', 'homepage.html');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.write('Internal Server Error');
      response.end();
    } else {
      // Send the HTML content as the response
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.write(data);
      response.end();
    }
  });
}

function brightness(response){
  console.log("Request handler 'brightness' was called.");
  
  // Read the HTML content from the file
  const filePath = path.join(__dirname, 'public', 'buttonled.html');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.write('Internal Server Error');
      response.end();
    } else {
      // Send the HTML content as the response
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.write(data);
      response.end();
    }
  });
}

function thresholds(response){
  console.log("Request handler 'thresholds' was called.");
  
  // Read the HTML content from the file
  const filePath = path.join(__dirname, 'public', 'rangesettings.html');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.write('Internal Server Error');
      response.end();
    } else {
      // Send the HTML content as the response
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.write(data);
      response.end();
    }
  });
}

function contacts(response){
  console.log("Request handler 'contacts' was called.");
  
  // Read the HTML content from the file
  const filePath = path.join(__dirname, 'public', 'contacts.html');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.write('Internal Server Error');
      response.end();
    } else {
      // Send the HTML content as the response
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.write(data);
      response.end();
    }
  });
}

function monitoring(response){
  console.log("Request handler 'monitoring' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync(__dirname + "/public/monitoring.html")
  response.end(html);
}

function checkContactExists(db, name, surname, callback) {
  const query = 'SELECT contact_id FROM contacts WHERE name = ? AND surname = ?';
  db.get(query, [name, surname], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row ? row.contact_id : null);
  });
}

function updateForm(response, postData) {
  console.log("Request handler 'form contacts;' was called.");

  // Perform different actions based on the selected action
  switch (postData.action) {
    case 'add':
      console.log('Adding contact...');
      checkContactExists(db, postData.name, postData.surname, (err, id) => {
        if (err) {
          console.error('An error occurred:', err);
          return;
        }
        if (id === null) {
          const insertQuery = 'INSERT INTO contacts (name, surname, email) VALUES (?, ?, ?)';
          db.run(insertQuery, [postData.name, postData.surname, postData.email], function(err) {
            if (err) {
              console.error(err.message);
            } else {
              console.log(`A row has been inserted with id ${this.lastID}`);
            }
          });
        } else {
          console.log('Contact already exists.');
        }
      });
      break;
    case 'modify':
      console.log('Modifying contact...');
      checkContactExists(db, postData.name, postData.surname, (err, id) => {
        if (err) {
          console.error('An error occurred:', err);
          return;
        }
        if (id !== null) {
          const modifyQuery = "UPDATE contacts SET email = ? WHERE contact_id = ?";
          db.run(modifyQuery, [postData.email, id], (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log('Row updated successfully.');
            }
          });
        } else {
          console.log('Contact does not exist.');
        }
      });
      break;
    case 'remove':
      console.log('Removing contact...');
      checkContactExists(db, postData.name, postData.surname, (err, id) => {
        if (err) {
          console.error('An error occurred:', err);
          return;
        }
        if (id !== null) {
          const deleteQuery = 'DELETE FROM contacts WHERE contact_id = ?';
          db.run(deleteQuery, [id], (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log('Row deleted successfully.');
            }
          });
        } else {
          console.log('Contact does not exist.');
        }
      });
      break;
    default:
      console.log('Invalid action selected.');
      break;
  }

  // Close the connection to the database
    contacts(response);
}

function updateRange(response, postData) {
  console.log("Request handler 'upload' was called.");

  const updateValues = (measure, max, min) => {
    const checkQuery = "SELECT maximum, minimum FROM range WHERE measure = ?";
    db.get(checkQuery, [measure], (err, row) => {
      if (err) {
        throw err;
      }

      // Row exists, update the values
      if (row) {
        const updateQuery = "UPDATE range SET maximum = ?, minimum = ? WHERE measure = ?";
        db.run(updateQuery, [max, min, measure], (err) => {
          if (err) {
            throw err;
          }
          console.log('Row updated successfully.');
        });
      } else {
        // Row doesn't exist, insert a new row
        const insertQuery = "INSERT INTO range (measure, maximum, minimum) VALUES (?, ?, ?)";
        db.run(insertQuery, [measure, max, min], (err) => {
          if (err) {
            throw err;
          }
          console.log('New row inserted successfully.');
        });
      }
    });
  };
	
	if(postData.sliderTempMax>postData.sliderTempMin && postData.sliderHumMax > postData.sliderHumMin){
	  // Update values for temperature
	  updateValues('temperature', postData.sliderTempMax, postData.sliderTempMin);

	  // Update values for humidity
	  updateValues('humidity', postData.sliderHumMax, postData.sliderHumMin);
	  
	} else {
		return;
	}

  // Close the connection to the database

    thresholds(response);

}

exports.start = start;
exports.brightness = brightness;
exports.monitoring = monitoring;
exports.contacts = contacts;
exports.thresholds = thresholds;
exports.updateForm = updateForm;
exports.updateRange = updateRange;
