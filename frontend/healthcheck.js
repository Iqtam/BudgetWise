const http = require('http');

const options = {
	hostname: '127.0.0.1',
	port: 3000,
	path: '/',
	method: 'GET',
	timeout: 5000
};

const req = http.request(options, (res) => {
	if (res.statusCode >= 200 && res.statusCode < 500) {
		process.exit(0); // Success
	} else {
		process.exit(1); // Failure
	}
});

req.on('error', (err) => {
	console.error('Health check failed:', err.message);
	process.exit(1);
});

req.on('timeout', () => {
	console.error('Health check timeout');
	req.destroy();
	process.exit(1);
});

req.end();
