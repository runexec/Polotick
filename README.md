# Polotick

Poloniex Infographic Generator

[preview.png]('preview.png')

# Install and Run

`cd Polotick; npm install; node ticker.js`

# Configure


Configuration is at the header of `ticker.js`

```javascript
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
```

(runexec) Ryan Kelker 2016