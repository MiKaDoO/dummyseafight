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
	
		if (tray != '' && tray.indexOf("2") != -1) {
			var indexNextShoot = tryToDestroyBoat(tray.indexOf("2"), tray);
				
			var col = indexNextShoot%10;
			var row = (indexNextShoot - col)/10;

			value = nameColumns[col] + row.toString();
		}
		else {
		
			do {
			
				var row = Math.floor((Math.random()*10));
				var col = Math.floor((Math.random()*10));
				
				value = nameColumns[col] + row.toString();

			} while(tray != '' && tray[(row * 10)+ col] != "0");
		}
	}

	sendResponseToReferee(referee,game,moveId,value);
};

var tryToDestroyBoat = function(indexShoot,tray) {
	var indexNextShoot = '';
	
	var indexIsValid = function(index) {
		return index >= 0 && index < 100;
	};
	
	var top = indexShoot - 10, left = indexShoot - 1, bottom = indexShoot + 10, right = indexShoot + 1;
	
	var delta = (((tray[left] == "1" || !indexIsValid(left))  && (tray[right] == "1" || !indexIsValid(right))) || (indexIsValid(bottom) && tray[bottom] == "2") || (indexIsValid(top) && tray[top] == "2")) ? 10 : 1;

	var tmp = indexShoot;
	
	do {
		tmp += delta;

		if (indexIsValid(tmp)) {
			if (tray[tmp] == "0") 
				indexNextShoot = tmp;
			else if (tray[tmp] != "2")
				delta = -delta;
		}
		else {
			delta = -delta;
		}
			
	} while (indexNextShoot == '');
	
	return indexNextShoot;
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