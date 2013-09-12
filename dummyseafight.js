var querystring = require('querystring');
var conf = require('./conf');
var http = require("http");
var url = require('url');

var sendResponseToReferee = function(referee,game,moveId,value) {

    var urlReferee = url.parse(referee, true);

    var query = querystring.stringify({
        Game: game,
        MoveId: moveId,
        Value: value
    });

    var options = {
        protocol: urlReferee.protocol,
        host: urlReferee.host,
        path: urlReferee.path + "?" + query
    };

    http.get(options,function(res) {

        res.on('end',function() {

        });

    }).on('error', function(error) {

    });
};

var play = function(game,referee,moveId,tray,turn) {

	var nameColumns = ["A","B","C","D","E","F","G","H","I","J"];
	var value = "H5C11H4D71V3H21V3B71V2I61";

	if (turn != "1") {
		do {

			var col = Math.floor((Math.random()*10));
			var row = Math.floor((Math.random()*10));

			value = nameColumns[col] + row.toString();

		} while(tray != '' && tray[(row * 10)+ col] != "0");
	}

	sendResponseToReferee(referee,game,moveId,value);
};

var server = http.createServer(function(request, response) {

	if (request.method == "GET") {
		
		var params = url.parse(request.url, true).query;

        if (params.Game && params.Referee && params.MoveId && params.Turn && params.Set == 'SeaFight') {

			play(params.Game,params.Referee,params.MoveId,params.Tray,params.Turn);
		}
	}

	response.writeHead(200, {"Content-Type": "text/html"});
    response.end('');
});

server.listen(conf.port);


