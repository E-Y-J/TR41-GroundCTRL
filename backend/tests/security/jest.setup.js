const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load test env (contains RL_*, HTTP_CLIENT_TIMEOUT_MS, etc.)
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

let server;
let emulatorProcess;

// Helper to kill a process group (cross-platform)
function killProcessGroup(pid) {
	if (process.platform === 'win32') {
		// Windows: use taskkill
		spawn('taskkill', ['/PID', pid, '/T', '/F'], { stdio: 'ignore' });
	} else {
		// Unix: kill process group
		process.kill(-pid, 'SIGKILL');
	}
}

function waitForEmulatorsReady(ports, timeout = 15000) {
	const net = require('net');
	return Promise.all(ports.map(port => {
		return new Promise((resolve, reject) => {
			const start = Date.now();
			(function check() {
				const socket = net.createConnection(port, '127.0.0.1');
				socket.on('connect', () => {
					socket.end();
					resolve();
				});
				socket.on('error', () => {
					if (Date.now() - start > timeout) {
						reject(new Error(`Emulator on port ${port} did not start in time`));
					} else {
						setTimeout(check, 250);
					}
				});
			})();
		});
	}));
}

beforeAll(async () => {
	// 1️⃣ Start Firestore and Auth emulators (only once per suite)
	console.log('🔧 Starting Firestore and Auth emulators...');
	emulatorProcess = spawn('npx', [
		'firebase', 'emulators:start', '--only', 'firestore,auth', '--project=test-project', '--quiet'
	], {
		stdio: 'ignore', // Don't block on emulator output
		shell: true,
		env: { ...process.env, FIREBASE_EMULATOR_HOST: 'localhost:8080', FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099' },
		detached: true // Start in new process group
	});

	// Wait for both emulators to be ready
	await waitForEmulatorsReady([8080, 9099]);

	// 2️⃣ Import the app (this will configure firebase-admin to use the emulator)
	const createApp = require('../../src/app'); // adjust if app entry is elsewhere
	server = await createApp.listen(process.env.PORT || 0); // random free port
	global.__APP__ = server; // expose to tests
});

afterAll(async () => {
	if (server && server.close) await server.close();
	if (emulatorProcess && emulatorProcess.pid) {
		killProcessGroup(emulatorProcess.pid);
	}
});
