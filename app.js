// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Load third party dependencies
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// Load our custom classes
const CustomerStore = require('./customerStore.js');
const MessageRouter = require('./messageRouter.js');

// Load and instantiate the API.AI client library
const ApiAi = require('apiai');
const apiAiApp = ApiAi('d18f0ad67a9c4867919a38038db6717f');

// Instantiate our app
const customerStore = new CustomerStore();
const messageRouter = new MessageRouter(customerStore, apiAiApp, io.of('/customer'), io.of('/operator'));

// Serve static html files for the customer and operator clients
app.use('/css', express.static(__dirname + '/static/css'));
app.use('/fonts', express.static(__dirname + '/static/fonts'));

app.get('/customer', (req, res) => {
  res.sendFile(`${__dirname}/static/customer.html`);
});

app.get('/operator', (req, res) => {
  res.sendFile(`${__dirname}/static/operator.html`);
});

// Begin responding to websocket and http requests
messageRouter.handleConnections();
http.listen(port, () => {
  console.log('Our app is running on http://localhost:' + port);
});
