Forsta Live Chat Bot
========

Install Requirements
--------
 * Bash
 * Docker
 * Node 8
   

1. Install
` ` `
git clone https://github.com/ForstaLabs/live-chat-bot.git
npm install
#Semantic will now prompt you now with some configuration options.
#Respond with the default for each option (just keep hitting enter).
` ` `

2. Run
` ` `
#It's reccomended that you set these in your .profile or .bashrc config
export RELAY_STORAGE_BACKING=postgres
export USER=postgres
export NODE_ENV=[development|production]
./run.sh run
` ` `

Usage
--------

./run.sh commands:

* run - runs the project in development of production mode based on NODE_ENV.
    * If NODE_ENV = 'development' run the project using Vue-CLI's development configuration which uses 
    webpack-dev-server's Hot Module Reloading (HMR) functionality. 
    * If NODE_ENV = 'production' compile the project using Vue-CLI's production configuration which
    also uses webpack

* run ui - runs the project using Vue-CLI's browser-based GUI. If building for production, make sure
    to set your NODE_ENV to 'production' prior to running this command.

* server - start the node server which handles all bot-related communications and data.

* clean - uninstalls the project completely. Removes all node modules, semantic, and the compiled site.

* docker-db-run - runs the docker container which contains our postgres server.

* docker-db-clean - purges the docker container and data in postgres database.


The Why &mdash; Decentralized Data Security
--------

What is important to Forsta is that **your messaging data** is only accessible to messaging 
clients that **you are in control** of, whether the client is an app running on 
the phone in your pocket, or a bot that is running on a server in your
datacenter or the compute cloud of your choice. 

Some organizations need to be able perform forensic e-discovery on past 
messages. Others may need to be able to automatically monitor for 
transmission of sensitive information. Or maybe they want something to 
automatically deliver sensitive information, or answer 
help-desk questions and handle after-hours inquires. Or individual users 
might want to be able to securely access their own message histories after 
buying a new phone and reinstalling their messaging client.

There are countless needs like these, and typically they are satisfied using 
**centrally-managed** infrastructure that can receive, store, process, and respond 
to messages as needed. Even systems that have pluggable architectures 
to facilitate outside development of these sorts of capabilities usually rely on a 
centralized approach. Unfortunately, the centralized approach provides a 
tempting, centralized target for outside 
attackers -- and it also requires users to trust that *insiders* won't abuse 
their access to all messages. Forsta is different.

Forsta does not offer anything that depends on centralized receipt, storage, or 
processing of users’ messaging data.  Instead, Forsta makes it trivial for 
*others* to run messaging “bots” to perform these functions. These bots are just 
another kind of messaging client, like the messaging clients running in users’ 
browsers and on their phones. And just like the other messaging clients, Forsta 
bots send and receive end-to-end encrypted messages to do their work **while 
running in a context controlled by the user**.

License
--------
Licensed under the GPLv3: http://www.gnu.org/licenses/gpl-3.0.html

* Copyright 2015-2016 Open Whisper Systems
* Copyright 2017-2018 Forsta Inc.
