
'use strict';

const SockJS = require('sockjs-client'); // WebSocket
require('stompjs'); // STOMP protocol

function register(registrations) {
	const socket = SockJS('/payroll');
	const stompClient = Stomp.over(socket);
	stompClient.connect({}, function(frame) {
		registrations.forEach(function (registration) { // subscribe for callback as messages arrive.
			stompClient.subscribe(registration.route, registration.callback);
		});
	});
}

module.exports.register = register;