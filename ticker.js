// Start Configuration

var config = [];

// Poloniex Config
config['PAIR_KEY'] = 'BTC_NAV'

// Browser Config
config['USER_AGENT'] = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0'

// Image Config

// Temporary Chart Image
config['TMP_POLO_IMG'] = '/tmp/polo.png'
// Image Writing Font
config['IMG_FONT'] = './asssets/Anonymous Pro B.ttf'
// Final Image Output
config['IMG_FP'] = '/tmp/out.png'

// End Configuration

/*

Users probably shouldn't touch anything below this comment.

You've been warned.

*/

// Requirements 
var gm = require('gm')
var https = require('https')
var Horseman = require('node-horseman')

// URLs
const URL_ID = config['PAIR_KEY'].toLowerCase()

const CHART_URL = 'https://poloniex.com/exchange#' + URL_ID
const TICKER_URL = 'https://poloniex.com/public?command=returnTicker'

// Browser
const UA = config['USER_AGENT'] 

// Poloniex API
const PAIR_KEY = config.PAIR_KEY.toUpperCase()

// Images
const IMG_FONT = config['IMG_FONT']
const IMG_TMP = config['TMP_POLO_IMG']
const IMG_FP = config['IMG_FP']

// Formatters

/**
* Makes the image font more readable by forcing extra char space.
* Will enforce string conversion.
* @param {Object} o
*/
function moreReadable (o) {
    o = o + ''
    
    return o.split('').reduce((x, y) => {
	return x + ' ' + y
    })
}

/**
* Accepts data & pair-key attribute. Returns float
* {string} k
* {array} d
*/
function dataFloat (d, k) {
    return parseFloat(d[k])
}

function getHandler (res) {

    var json = ''
    var encoding = 'utf8'

    // Encoding
    res.setEncoding(encoding)

    // Receive Data
    res.on('data', (d) => {
	json += d
    })

    res.on('end', () => {

	const WAIT = 3000

	const CANVAS_SELECTOR = 'canvas#chart30Canvas'

	const BUTTON = {'hr24' : 'button#zoom24',
			'candle30' : 'button#chartButton1800'}

	const REMOVE = ['div#currentChartRange',
			'div.sprocket']

	var horseman = new Horseman()
	    .userAgent(UA)
	    .open(CHART_URL)
	    .viewport(800,600)
	    .click(BUTTON.hr24)
	    .then(() => {
		console.log('Waiting for 24hr chart.')
	    })
	    .wait(WAIT)
	    .click(BUTTON.candle30)
	    .then (() => {
		console.log('Waiting for 30-minute candles.')
	    })
	    .wait(WAIT)
	    .evaluate(function (a) {
		for (x in a) {
		    document.querySelector(a[x]).innerHTML = ''
		}
	    }, REMOVE)
	    .crop(CANVAS_SELECTOR, IMG_TMP)
	    .then(() => {
		
		var data = JSON.parse(json)[PAIR_KEY]

		console.log(data)

		function dataN (k) {
		    return dataFloat(data, k)
		}

		var change = dataN('percentChange') * 100
		
		const ATTR = {'btc' : dataN('baseVolume'),
			      'high' : dataN('high24hr'),
			      'low' : dataN('low24hr'),
			      'change' : change,
			      'ask' : dataN('lowestAsk'),
			      'bid' : dataN('highestBid'),
			      'toggle' : change >= 0}

		
		const GEN_PAIR = [['NAV', '#EBF5FB', 34, 18, 1],
				  [new Date().toUTCString(), '#FFF', 20, 45, 0.1],
				  ['Change % ', '#EBF5FB', 20, 22, 0.1],
				  ['' + ATTR['change'], '#FFF', 24, 40, 2],
				  ['BTC ', '#EBF5FB', 20, 22, 0.1],
				  ['' + ATTR['btc'], '#FFF', 24, 40, 2],
				  ['HIGH ', '#EBF5FB', 20, 22, 0.1],
				  ['' + ATTR['high'], '#FFF', 24, 40, 2],
				  ['LOW ', '#EBF5FB', 20, 22, 0.1],
				  ['' + ATTR['low'], '#FFF', 24, 40, 2],
				  ['ASK ', '#EBF5FB', 20, 22, 0.1],
				  ['' + ATTR['ask'], '#FFF', 24, 40, 2],
				  ['BID ', '#EBF5FB', 20, 22, 0.1],
				  ['' + ATTR['bid'], '#FFF', 24, 20, 2]];

		var xy = []
		
		for (var n = 0, y = 30; n < GEN_PAIR.length; n++) {
		    xy.push([30, y])
		    y += GEN_PAIR[n][3] || 28
		}

		var img = gm(IMG_TMP)
		
		img.size((e,v) => {

		    img.fill('rgba(23, 32, 42, 40%)')
			.font(IMG_FONT)
			.stroke('#000000', 0.5)
			.pointSize(16)
			.drawRectangle(0,
				       0,
				       v.width,
				       v.height)
			.fill('rgba(0, 0, 0, 0%)')
		    
		    for (n in xy) {

			var _xy = xy[n]	    
			var x = _xy[0] * 0.25
			var y = _xy[1]

			var pair = GEN_PAIR[n]
			var text = moreReadable(pair[0])
			var color = pair[1]
			var size = pair[2]
			var stroke = pair[4]
			
			img = img
			    .pointSize(size)
			    .stroke(color, 2)
			    .fill(color)
			    .drawText(x, y, text, 'North')
		    }
		    

		    img.write(IMG_FP, function (e) {
			if (e) console.log(e)
		    })
		    
		})
	    })
	    .close()	
    })
    
}

https.get(TICKER_URL, getHandler)
