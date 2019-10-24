module.exports = {
    apps : [{
      name      : 'myapp',
      script    : 'app.js',
      env_production : {
        name : 'can432-cloud',
        NODE_ENV: 'production'
      }
    }]
  }
  
  
  