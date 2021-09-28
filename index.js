
'use strict';

const dali = require('./lib/dali');
const lib = require('./lib/devicelist');
const mqtt = require('mqtt');
const tools = require('./lib/tools.js');
const logger = require('./lib/logger.js');

const mqtt_base_topic = "homeassistant";
const dali_base_topic = "dali.0";

class Controller {
    constructor(options) {
	this.config = {
	    host: "192.168.100.194",
	    port: 502,
	    bus0: false,
	    bus1: true,
	    bus2: true,
	    bus3: false
	};
	
	this.log = new logger(1,2,3);
	this.namespace = dali_base_topic; //"dali.0";
	
	// mqtt
	this.mqtt_client  = mqtt.connect("mqtt://192.168.101.23",{clientId:"mqttjs01", username: "mqtt", password: "lPcpdFej0P2V"});
	this.mqtt_client.on('message', this.onMqttMessage.bind(this));
	this.mqtt_client.on('connect', this.onMqttConnect.bind(this));
        this.mqtt_client.on('error', this.onMqttError.bind(this));

	var topic_list=[dali_base_topic+"/#"];
	this.mqtt_client.subscribe(topic_list,{qos:1});
	
	this.HA_DISCOVERY_PREFIX = mqtt_base_topic+"/light/{}/config";

	
/*        super( {
            ...options, 
            name: 'dali', 
            //systemConfig:  true
            
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));*/
    }

    async onMqttMessage(topic, message, packet) {
	this.log.info("onMqttMessage: "+topic+" = "+message);
	// dali.0/bus1_lamps_a02/light/brightness/set
	// dali.0/bus1_lamps_a02/light/switch
	    
        
        var command = false;
        if (topic.indexOf("/light/brightness/set") != -1 || topic.indexOf("/light/switch") != -1) command = true;
        
	if (command) {
		var path = topic;
		path = path.substr(7); // delete "dali.0/"
		path = path.substr(0, path.indexOf('/'));

		var path_arr = path.split("_");
		
		if (path_arr.length == 3 && (path_arr[1] == "lamps" || path_arr[1] == "groups") ) {
			let brightness = message;
			await this.onHaLevelChanged(path, brightness);
		}
	}
    }

    async onMqttConnect() {
        this.log.info("Mqtt connected "+ this.mqtt_client.connected);
    }
    
    async onMqttError(error) {
        this.log.info("Mqtt Can't connect" + error);
    }
    
    genHaConfig(name, path) {
        // Generate a automatic configuration for Home Assistant.
        var json_config = {
            "name": path,
            "unique_id": "DALI2MQTT_LIGHT_"+path,
            "state_topic": dali_base_topic+"/"+path+"/light/brightness/status",//+"_"+name,
            "state_value_template": "{% if value|int > 0 %}1{% else %}0{% endif %}",
            "command_topic": dali_base_topic+"/"+path+"/light/switch",
            "payload_on": "1",
            "payload_off": "0",
            "brightness_state_topic": dali_base_topic+"/"+path+"/light/brightness/status",//+"_"+name,
            "brightness_command_topic": dali_base_topic+"/"+path+"/light/brightness/set",
            "brightness_scale": 100,
            "on_command_type": "brightness",
            "availability_topic": "dali2mqtt/status",
            "payload_available": "online",
            "payload_not_available": "offline",
            "device": {
                "identifiers": "dali2mqtt",
                "name": "DALI Lights",
//                "sw_version": f"dali2mqtt {__version__}",
                "model": "dali2mqtt",
//                "manufacturer": f"{__author__} <{__email__}>",
            }
        };
        
        return JSON.stringify(json_config);
    }
    
    sendHaConfig(device) {
	let name = device.getName();
	let path = device.getPath();
	this.log.info("sendHaConfig. name="+name+", path="+path);
	var conf = this.genHaConfig(name, path);
	var options = {};
	
	if (this.mqtt_client.connected == true){
	    this.log.debug("mqtt.publish: "+mqtt_base_topic+"/light/"+path+"/config");
	    this.mqtt_client.publish(mqtt_base_topic+"/light/"+path+"/config", conf, options);
	}
    }        
        
    sendHaAvailable() {
	if (this.mqtt_client.connected == true){
	    this.mqtt_client.publish("dali2mqtt/status", "online", { retain: true} );
	}
    }
    
    async onReady() {
	this.lamps = [];
	
        this.device = new dali(this, this.config.host, this.config.port, 
            this.config.bus0, this.config.bus1, this.config.bus2, this.config.bus3);
        this.device.connect();

        if(this.config.bus0) {
            let dl0 = await this.device.startSearch(0);
            for (let d in dl1) this.lamps[d] = dl0[d];
        };
        if(this.config.bus1) {
    	    let dl1 = await this.device.startSearch(1);
    	    for (let d in dl1) this.lamps[d] = dl1[d];
        };
        if(this.config.bus2) {
            let dl2 = await this.device.startSearch(2);
            for (let d in dl2) this.lamps[d] = dl2[d];
        };
        if(this.config.bus3) {
            let dl3 = await this.device.startSearch(3);
            for (let d in dl3) this.lamps[d] = dl3[d];
        };

	this.announceLamps();
	this.sendHaAvailable();
	
        if (this.config.bus0 || this.config.bus1 || this.config.bus2 || this.config.bus3) {
            this.device.startCounter();
        }
    }

/*    onUnload(callback) {

        if(this.device) {
            this.device.destroy();
            this.log.debug('Device destroyed');
        }

        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }*/

    // state has changed on MQTT side
    async onHaLevelChanged(path, level) {
        this.log.info(`state ${path} changed: ${level}`);
        let path_arr = path.split('_');   

	if (path_arr[1] == "lamps" && tools.isObject(this.lamps[path])) {
	    await this.lamps[path].setLevelHa(level);
	}
    }
    
    
//        if(state /*&& state.ack !== true*/ && this.device) {
        
/*            const busno = this.getbusnumber(id);
            const name = id.substring(id.lastIndexOf('.') + 1);
	    this.log.info("onStteChange: id="+id+", name="+name);
      
            if(id.startsWith(this.namespace + '.bus' + busno +'.lamps.')) {
             
                this.device.sendLampState(busno, state.val, name);

            } else if(id.startsWith(this.namespace + '.bus' + busno + '.groups.')) {

                this.device.sendGroupState(busno, state.val, name); 

            } else if(id.startsWith(this.namespace + '.bus' + busno + '.scenes.')) {

                if(state.val) {
                    this.device.sendScene(busno, name);
                    this.setState(this.namespace + '.bus' + busno + '.scenes.' + name, false);
                }

            } else if(id == this.namespace + '.bus' + busno + '.broadcast0') {
                this.device.sendBroadcast(busno, state.val);  
            }
                    
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            //this.log.info(`state ${id} deleted`);
        }
    }*/

    async announceLamps() {
        try{
            for(const i in this.lamps) {
                const device = this.lamps[i];
                this.sendHaConfig(device);
            }
        }
        catch(error) {
            this.log.error(error);
        }
    };

    getbusnumber(id) {
    
        if (id.indexOf('bus0')===7) { return 0}
        else if (id.indexOf('bus1')===7) { return 1}
        else if (id.indexOf('bus2')===7) { return 2}
        else if (id.indexOf('bus3')===7) { return 3};

    }

/*    async createDatapoints(bus) {

        this.createStateData('bus' + bus, lib.state.bus)
        this.createStateData('bus' + bus + '.lamps' , lib.state.lamps);
        this.createStateData('bus' + bus + '.groups', lib.state.groups);
        this.createStateData('bus' + bus + '.scenes', lib.state.scenes);
    
        for (let s = 0; s < 16; s++) {

            const sn = (s < 10) ? '0' + s : s;

            this.createStateData('bus' + bus + '.scenes.s' + sn, lib.state.scene);
        }

        this.createStateData('bus' + bus + '.broadcast' + bus, lib.state.level, 0);
    }*/

/*    createStateData(id, state, value) {
	this.log.info("create state data. ID:"+id+", state:"+state+", value:"+value);
        this.setObjectNotExistsAsync(id, state,{
            native: {}
        });
        this.setState(this.namespace+"."+id, value, true);
    }*/

    // Calls if dali device level changed
    async onDaliLevelChanged(device) {
	let levelHa = await device.getLevelHa();
	let path = device.getPath();
	
	this.log.info("onDaliLevelChanged. path:"+path+", level:"+levelHa);

	if (!this.mqtt_client.connected == true) {
	    this.log.debug("setState: mqtt not connected!");
	    return;
	}

	let p = this.namespace+"/"+path+"/light/brightness/status";
	this.log.debug("onDaliLevelChanged: publish "+p+" = " + levelHa);
	this.mqtt_client.publish(p, levelHa.toString(), {});
    }
}



var c = new Controller();
c.onReady().then();
