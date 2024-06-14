const express = require('express');
const path = require('path');
const ejs = require('ejs');
const cors = require('cors');
const {PORT,connect} = require('./config/server-config');
const appgetRoutes = require('./routes/app-get-routes');
const appRoutes = require('./routes');
const bodyParser = require('body-parser');
const { isIpbanned } = require('./middleware/auth-middleware');

const app = express();

app.use(cors());
// ejs config
app.set('views', __dirname + './../views');
app.set('view engine', 'ejs');

// App config
app.use('/', express.static(__dirname + './../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/',isIpbanned,appgetRoutes);
app.use('/api',appRoutes);

app.listen(PORT,async()=>{
    console.log("Server running on PORT:",PORT);
    await connect();
    console.log('mongoDB connected');
});
