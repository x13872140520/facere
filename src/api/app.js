const express = require('express')
const app = express()
const bodyParser = require("body-parser")

var facepool=[]
app.use(bodyParser.json())
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	next();
});
app.post('/face-recognition', (req, res) => {
	console.log(req.body)
	facepool.push({
		stu_id:req.body.stu_id,
		descriptor:req.body.descriptor
	})
	res.jsonp(req.body)

})
app.get('/face-lib', (req, res) => {
	res.jsonp(facepool)
	
})
app.get('/get_token', (req, res) => res.send('b70623930550593ed4e7ac230e1e2adc'))
app.post('/face-sign', (req, res) => {
  
    
    res.jsonp(req.body)
})
app.listen(3001, () => console.log('Example app listening on port 3001!'))