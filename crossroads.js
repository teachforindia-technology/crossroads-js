const EventEmitter = require('events').EventEmitter

const http = require('http')
	, https = require('https')
	, util = require('util')
	, _ = require('lodash')

const defaults = require('./defaults')
	, defaultHost = defaults.host
	, defaultPort = defaults.port

const callCrossroads = function (options, body, callback) {

	if(!callback && typeof body === 'function') {
		callback = body
		body = ''
	}
	if(!body) {
		body = ''
	}

	return new Promise(function (resolve, reject) {

		let protocolModule = http

		if(options.port === 443)
			protocolModule = https

		var request = protocolModule.request(options, function (response) {

			response.setEncoding('utf-8')

			if(response.statusCode === 200) {

				var responseObject = ''

				response.on('data', function (chunk) {
					responseObject += chunk
				})

				response.on('end', function () {

					responseObject = JSON.parse(responseObject)

					if(responseObject.errors === 'yes') {

						if(responseObject.errorCode === 3010)
							return options.tokenExpiryHandler({
								options, body, callback
							})
							.then(resolve)
							.catch(reject)

						if(callback && typeof callback === 'function')
							return callback(responseObject)

						return reject(responseObject)

					}

					else if(responseObject.errors === 'no') {
						delete responseObject.errors
						if(callback && typeof callback === 'function')
							return callback(null, responseObject)
						return resolve(responseObject)
					}

				})
			}

			else {
				if(callback && typeof callback === 'function')
					return callback(response.statusCode)
				return reject(response.statusCode)
			}
		})

		request.on('error', function (err) {
			if(callback && typeof callback === 'function')
				return callback(err)
			reject(err)
		})

		request.write(body)
		request.end()

	})

}

function Crossroads (config) {

	var majorVersion = this.majorVersion = config.majorVersion? config.majorVersion: 0

	this.accessToken = config.accessToken
	this.refreshToken = config.refreshToken

	this.tokenExpiryHandler = originalParams => {

		return this.user.tokens()
		.then(responseObject => {

			this.accessToken = responseObject.teachPIAccessToken
			this.emit('accessTokenUpdated', this.accessToken)
			let options = originalParams.options
			options.headers.Authorization = `Basic ${new Buffer(config.apiKey+':'+this.accessToken).toString('base64')}`
			return callCrossroads(options, originalParams.body, originalParams.callback)

		})

	}

	this.defaultOptions = {
		host: config.host || defaultHost,
		port: config.port || defaultPort,
		basePath: '/api/v' + majorVersion,
		method: 'GET',
		tokenExpiryHandler: config.tokenExpiryHandler? config.tokenExpiryHandler: this.tokenExpiryHandler,
		headers: {
			Authorization: 'Basic ' + new Buffer(config.apiKey).toString('base64'),
			version: config.version? config.version: '0.2.0'
		}
	}

	this.updateAccessToken = function(accessToken) {
		this.accessToken = accessToken
	}

	this.call = function (options, body, callback) {
		return callCrossroads(options, body, callback)
	}

	this.get = function (path, params, callback) {

		if(!callback && typeof params === 'function')
			callback = params

		let options = {},
			queryParams = ''

		params = params || {}

		if(params.params) {
			path += '?'
			_.forEach(params.params, (value, key) => {
				queryParams += `&${key}=${value}`
			})
			path += queryParams
		}
		let localOptions = {
			path: this.defaultOptions.basePath + path
		}
		_.merge(options, this.defaultOptions, localOptions)

		let token = params.refreshToken || params.accessToken || this.accessToken,
			authHeader = `Basic ${new Buffer(config.apiKey+':'+token).toString('base64')}`

		options.headers.Authorization = authHeader

		return callCrossroads(options, callback)

	}.bind(this)

	this.post = function (path, params, callback) {

		if(!callback)
			callback = params

		let body

		params = params || {}

		if(params.body)
			body = JSON.stringify(params.body)

		let options = {}

		let localOptions = {
			method: 'POST',
			path: this.defaultOptions.basePath + path,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(body)
			}
		}
		_.merge(options, this.defaultOptions, localOptions)

		let token = params.accessToken || this.accessToken,
			authHeader = `Basic ${new Buffer(config.apiKey+':'+token).toString('base64')}`

		options.headers.Authorization = authHeader

		return callCrossroads(options, body, callback)

	}.bind(this)

	this.put = function (path, params, callback) {

		if(!params)
			callback = params

		let body

		if(params.body)
			body = JSON.stringify(params.body)

		let options = {}

		let localOptions = {
			method: 'PUT',
			path: this.defaultOptions.basePath + path,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(body)
			}
		}
		_.merge(options, this.defaultOptions, localOptions)

		if(params.accessToken)
			options.headers.Authorization = 'Basic ' + new Buffer(`${config.apiKey}:${params.accessToken}`).toString('base64')

		return callCrossroads(options, body, callback)

	}.bind(this)

	this.delete = function (path, params, callback) {

		if(!callback)
			callback = params

		let options = {},
			queryParams = ''

		if(params.params) {
			path += '?'
			_.forEach(params.params, (value, key) => {
				queryParams += `&${key}=${value}`
			})
			path += queryParams
		}

		let localOptions = {
			method: 'DELETE',
			path: this.defaultOptions.basePath + path,
			headers: {
				'Content-Type': 'application/json'
			}
		}
		_.merge(options, this.defaultOptions, localOptions)

		if(params.accessToken)
			options.headers.Authorization = 'Basic ' + new Buffer(`${config.apiKey}:${params.accessToken}`).toString('base64')

		return callCrossroads(options, callback)

	}.bind(this)

	this.user = (function (self) {

		var user = {

			sessions: function (params, callback) {

				let body = JSON.stringify(params),
					options = {}

				let localOptions = {
					method: 'POST',
					path: self.defaultOptions.basePath + '/user/sessions',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(body)
					}
				}
				_.merge(options, self.defaultOptions, localOptions)

				return new Promise(function(resolve, reject) {

					callCrossroads(options, body)
						.then(responseObject => {

							let tokens = responseObject.tokens
							self.accessToken = tokens.teachPIAccessToken
							self.refreshToken = tokens.teachPIRefreshToken
							if(callback && typeof callback === 'function')
								return callback(null, responseObject)
							return resolve(responseObject)

						})
						.catch(err => {
							if(callback && typeof callback === 'function')
								return callback(err)
							return reject(err)
						})

				})

			},

			tokens: (params, callback) => {

				if(!callback && typeof params === 'function')
					callback = params

				let options = {}

				let token = (params && params.refreshToken) || self.refreshToken,
					authHeader = `Basic ${new Buffer(config.apiKey+':'+token).toString('base64')}`

				let localOptions = {
					path: self.defaultOptions.basePath + '/user/tokens',
					headers: {
						Authorization: authHeader
					}
				}

				_.merge(options, self.defaultOptions, localOptions)

				return callCrossroads(options, callback)

			}
		}

		return user

	})(this)

	this.search = function (params, callback) {

		let query = JSON.stringify(params.q),
			context = params.context

		let options = {
			headers: {}
		}

		let localOptions = {
			path: `${this.defaultOptions.basePath}/search?q=${query}&context=${context}`
		}

		_.merge(options, this.defaultOptions, localOptions)

		let token = params.accessToken || this.accessToken,
			authHeader = `Basic ${new Buffer(config.apiKey+':'+token).toString('base64')}`

		options.headers.Authorization = authHeader

		return callCrossroads(options, callback)

	}.bind(this)

	this.status = function (params, callback) {

		if(!callback)
			callback = params

		let options = {}

		let localOptions = {
			path: `${this.defaultOptions.basePath}/status`,
			headers: {
				Authorization: 'Basic ' + new Buffer(config.apiKey).toString('base64')
			}
		}
		_.merge(options, this.defaultOptions, localOptions)

		return callCrossroads(options, callback)

	}.bind(this)

}

util.inherits(Crossroads, EventEmitter)

module.exports = Crossroads
