'use strict'
var logger = require('../../utils/composrLogger')
var _ = require('lodash')

// Implement and include your new hook here to make it available
var mandatoryHooks = [{
  description: 'httpStartEvent hook',
  hookFunction: require('./httpStart')
}]

var hooks = {
  'validate': {
    description: 'Validation hook',
    hookFunction: require('./validateHook')
  },
  'mock': {
    description: 'Mock hook',
    hookFunction: require('./mockHook')
  },
  'corbel-auth-user': {
    description: 'Corbel Auth user hook',
    hookFunction: require('./corbelAuthHook').authUser
  },
  'corbel-auth-client': {
    description: 'Corbel Auth Client hook',
    hookFunction: require('./corbelAuthHook').authClient
  },
  'corbel-driver-setup': {
    description: 'Corbel Driver Setup hook',
    hookFunction: require('./corbelAuthHook').corbelDriverSetup
  },
  'metrics': {
    description: 'Metrics hook',
    hookFunction: require('./metricsHook')
  },
  'cache': {
    description: 'A Redis cache hook',
    hookFunction: require('./cacheHook')
  }
}

module.exports.getHooks = function (phraseModel, verb) {
  var mandatoryAppliedHooks = mandatoryHooks.map(function (item) {
    logger.info('[Hooks]', 'Setting ' + item.description + ' for phrase:', phraseModel.getId(), 'method', verb)
    return item.hookFunction(phraseModel, verb)
  })

  if (phraseModel.getMiddlewares(verb).length > 0) {
    var functions = _.map(phraseModel.getMiddlewares(verb), function (hookId) {
      if (hooks[hookId]) {
        logger.info('[Hooks]', 'Setting ' + hooks[hookId].description + ' for phrase:', phraseModel.getId(), 'method', verb)
        return hooks[hookId].hookFunction(phraseModel, verb)
      } else {
        logger.warn('[Hooks]', 'Hook ' + hookId + ' not found for phrase:', phraseModel.getId())
        return null
      }
    })

    return _.concat(mandatoryAppliedHooks, _.without(functions, null))
  }

  return mandatoryAppliedHooks
}

module.exports.get = function (hookId) {
  if (hooks[hookId]) {
    return hooks[hookId].hookFunction()
  } else {
    logger.warn('[Hooks]', 'Hook ' + hookId + ' not found')
    return function (req, res, next) {
      next()
    }
  }
}
