module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: 'inhelium.com',
      username: 'dkz',
      pem: '~/.ssh/id_rsa'
    }
  },

  app: {
    // TODO: change app name and path
    name: 'museum18-search',
    path: '/home/dkz/dev-utpp/museum-18-search',

    volumes: {
       // passed as '-v /host/path:/container/path' to the docker run command
       //'/home/dkz/museum-pub': '/home/dkz/museum-pub',
       //'/home/dkz/ultimheat.com/museum':'/home/dkz/ultimheat.com/museum'
     },


    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
//      ROOT_URL: 'http://ultimheat.com/dkz-jou',
      ROOT_URL: 'http://inhelium.com/museum-search',
//      ROOT_URL: 'http://ultimheat.com/',
      PORT: 32101
//      MONGO_URL: 'mongodb://localhost/meteor',
    },

    // ssl: { // (optional)
    //   // Enables let's encrypt (optional)
    //   autogenerate: {
    //     email: 'email.address@domain.com',
    //     // comma separated list of domains
    //     domains: 'website.com,www.website.com'
    //   }
    // },

    docker: {
      // change to 'kadirahq/meteord' if your app is using Meteor 1.3 or older
      image: 'abernix/meteord:node-8.4.0-base'
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

/*
  mongo: {
    version: '3.4.1',
    servers: {
      one: {}
    }
  }
  */
};
