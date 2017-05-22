Crossroads - js
===============

A javascript wrapper to call the Crossroads endpoints effortlessly.

Installation
------------

    npm install crossroads-js

Usage
-----

    import Crossroads from 'crossroads-js'
    const crossroads = new Crossroads({
    	apiKey: crossroadsConfig.apiKey,
    	host: crossroadsConfig.host,
    	port: crossroadsConfig.port
    })

or

    const Crossroads = require('crossroads-js')
    	, crossroads = new Crossroads({
    		apiKey: crossroadsConfig.apiKey,
    		host: crossroadsConfig.host,
    		port: crossroadsConfig.port
    	})

Calling Endpoints
-----------------

Creating a Session

    crossroads.user.sessions({
    	authCode: request.query.code,
    	redirectURI: crossroadsConfig.redirectUri
    })
    .then(response => console.log(response))

Fetch Public Details

    crossroads.get('/me?publicDetails', {accessToken})
    .then(json => console.log(json))
    .catch(err => console.log(err))

API
---

Crossroads()

.get()

.post()

.put()

.delete()

.search()

.user()

.status()

.updateAccessToken()

.call()
