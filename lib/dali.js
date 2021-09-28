//import { Mutex } from 'async-mutex';
//import { withTimeout, E_TIMEOUT } from 'async-mutex';
const mutex = require('async-mutex');
const net = require('net');
const lib = require('./devicelist');

const queryDali = {
    queryDeviceType: '0x99',
    level: '0xa0',
    min: '0x9a',
    group07: '0xc0',
    group815: '0xc1'
}

/*const queryEDali = {
    switchState: '0xc0',
    eventSource: '0xbe'
}*/

//const daliSize [DALI 16bit, DALI 25bit (eDali), DALI 24bit]
const daliSize = {
    dali16Bit: '0x03',
    eDali25Bit: '0x04',
    dali24Bit: '0x06'
}

//const daliClass [Class 0, Class 1, Class 2, Class 3, Class 4, Class 5, Class 6, Class 7]
const daliClass = ['0x00', '0x01', '0x02', '0x03', '0x04', '0x05', '0x06', '0x07'];
//const queryType = {dali: '0x99', edali: '0x31' }
//const query [device type, groups 0,7 , groups 8,15, physical min level, actual level]
//const queryDali = ['0x99', '0xc0', '0xc1', '0x9a', '0xa0'];
//const queryEDali [Switch Status 0-4, Event Source ]
//const queryEDali = ['0xc0', '0xbe'];


const accessMode = {0: 'Master Mode', 1: 'Event Message Mode', 2: 'Slave Mode'};

const typeDali = ['Fluoresecent Lamps', 'Emergency lighting', 'Discharge Lamps', 'Low Voltage Halogen Lamps', 'Supply Voltage Regulator', 
                'DALI to 1-10V', 'LED Modules', 'Relays', 'Color Controls', 'Sequencers','unknown' ,'unknown','unknown','unknown','unknown', 
                'Load referencing', 'Thermal Gear Protection', 'Dimming Curve Selection', 'unknown', 'unknown', 'Demand Response',
                 'Thermal Lamp Protection'
];
const typeEDali = ['Dali CS Temp', 'Dali CS Irda', 'Dali CS LS', 'Dali Touch', 'Dali MC', 'Dali Switch', 'Dali MC+', 'wDali Receiver', 
                    'Dali 100k', 'Dali Bluetooth 4.0', 'Dali Corridor Module', 'Dali Daylight BE', 'Dali Sequencer'
];
/*const searchDevice = ['a00', 'a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 
'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25', 'a26', 'a27', 'a28', 'a29', 
'a30', 'a31', 'a32', 'a33', 'a34', 'a35', 'a36', 'a37', 'a38', 'a39', 'a40', 'a41', 'a42', 'a43', 'a44', 'a45', 
'a46', 'a47', 'a48', 'a49', 'a50', 'a51', 'a52', 'a53', 'a54', 'a55', 'a56', 'a57', 'a58', 'a59', 'a60', 'a61', 
'a62', 'a63', 'g00', 'g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10', 'g11', 'g12', 'g13', 
'g14', 'g15', 'ea00', 'ea01', 'ea02', 'ea03', 'ea04', 'ea05', 'ea06', 'ea07', 'ea08', 'ea09', 'ea10', 'ea11', 'ea12', 'ea13', 
'ea14', 'ea15', 'ea16', 'ea17', 'ea18', 'ea19', 'ea20', 'ea21', 'ea22', 'ea23', 'ea24', 'ea25', 'ea26', 'ea27', 'ea28', 'ea29', 
'ea30', 'ea31', 'ea32', 'ea33', 'ea34', 'ea35', 'ea36', 'ea37', 'ea38', 'ea39', 'ea40', 'ea41', 'ea42', 'ea43', 'ea44', 'ea45', 
'ea46', 'ea47', 'ea48', 'ea49', 'ea50', 'ea51', 'ea52', 'ea53', 'ea54', 'ea55', 'ea56', 'ea57', 'ea58', 'ea59', 'ea60', 'ea61', 
'ea62', 'ea63'
]*/
//const searchDevice = ['a00', 'a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08'
//const searchDevice = ['a00', 'a01', 'a02', 'a03', 'a10', 'a11', 'a12', 'a13', 'a14', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25', 'a51', 'a58'
//]
const searchDevice = ['a00', 'a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 
'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25', 'a26', 'a27', 'a28', 'a29', 
'a30', 'a31', 'a32', 'a33', 'a34', 'a35', 'a36', 'a37', 'a38', 'a39', 'a40', 'a41', 'a42', 'a43', 'a44', 'a45', 
'a46', 'a47', 'a48', 'a49', 'a50', 'a51', 'a52', 'a53', 'a54', 'a55', 'a56', 'a57', 'a58', 'a59', 'a60', 'a61', 
'a62', 'a63'
]
const daliName = ['a00', 'a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 
    'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25', 'a26', 'a27', 'a28', 'a29', 
    'a30', 'a31', 'a32', 'a33', 'a34', 'a35', 'a36', 'a37', 'a38', 'a39', 'a40', 'a41', 'a42', 'a43', 'a44', 'a45', 
    'a46', 'a47', 'a48', 'a49', 'a50', 'a51', 'a52', 'a53', 'a54', 'a55', 'a56', 'a57', 'a58', 'a59', 'a60', 'a61', 
    'a62', 'a63', 'g00', 'g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10', 'g11', 'g12', 'g13', 
    'g14', 'g15', 'ea00', 'ea01', 'ea02', 'ea03', 'ea04', 'ea05', 'ea06', 'ea07', 'ea08', 'ea09', 'ea10', 'ea11', 'ea12', 'ea13', 
    'ea14', 'ea15', 'ea16', 'ea17', 'ea18', 'ea19', 'ea20', 'ea21', 'ea22', 'ea23', 'ea24', 'ea25', 'ea26', 'ea27', 'ea28', 'ea29', 
    'ea30', 'ea31', 'ea32', 'ea33', 'ea34', 'ea35', 'ea36', 'ea37', 'ea38', 'ea39', 'ea40', 'ea41', 'ea42', 'ea43', 'ea44', 'ea45', 
    'ea46', 'ea47', 'ea48', 'ea49', 'ea50', 'ea51', 'ea52', 'ea53', 'ea54', 'ea55', 'ea56', 'ea57', 'ea58', 'ea59', 'ea60', 'ea61', 
    'ea62', 'ea63','s00', 's01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12', 's13', 's14', 's15'
];
const daliGetHex = ['01', '03', '05', '07', '09', '0B', '0D', '0F', '11', '13', '15', '17', '19', '1B', '1D', '1F', '21', 
    '23', '25', '27', '29', '2B', '2D', '2F', '31', '33', '35', '37', '39', '3B', '3D', '3F', '41', '43', '45', '47', '49', 
    '4B', '4D', '4F', '51', '53', '55', '57', '59', '5B', '5D', '5F', '61', '63', '65', '67', '69', '6B', '6D', '6F', '71', 
    '73', '75', '77', '79', '7B', '7D', '7F', '81', '83', '85', '87', '89', '8B', '8D', '8F', '91', '93', '95', '97', '99', 
    '9B', '9D', '9F', '01', '03', '05', '07', '09', '0B', '0D', '0F', '11', '13', '15', '17', '19', '1B', '1D', '1F', '21', 
    '23', '25', '27', '29', '2B', '2D', '2F', '31', '33', '35', '37', '39', '3B', '3D', '3F', '41', '43', '45', '47', '49', 
    '4B', '4D', '4F', '51', '53', '55', '57', '59', '5B', '5D', '5F', '61', '63', '65', '67', '69', '6B', '6D', '6F', '71', 
    '73', '75', '77', '79', '7B', '7D', '7F'
];
const daliSetHex = ['00', '02', '04', '06', '08', '0A', '0C', '0E', '10', '12', '14', '16', '18', '1A', '1C', '1E', 
    '20', '22', '24', '26', '28', '2A', '2C', '2E', '30', '32', '34', '36', '38', '3A', '3C', '3E', '40', '42', '44', '46', 
    '48', '4A', '4C', '4E', '50', '52', '54', '56', '58', '5A', '5C', '5E', '60', '62', '64', '66', '68', '6A', '6C', '6E', 
    '70', '72', '74', '76', '78', '7A', '7C', '7E', '80', '82', '84', '86', '88', '8A', '8C', '8E', '90', '92', '94', '96', 
    '98', '9A', '9C', '9E', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1A', '1B', '1C', '1D', '1E', '1F', 
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1A', '1B', '1C', '1D', '1E', '1F'
];
const daliLevel = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 
    44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 
    84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 
    122, 124, 126, 128, 130, 132, 134, 136
];


class Dali4Net {
    constructor(adapter, host, port, bus0, bus1, bus2, bus3) {
       
        console.debug = (message) => {
            this.adapter.log.debug(message);
        }

        this.adapter = adapter;
        this.devices = [];
        this.host = host;
        this.port = port;
        this.bus = {
            0: {
                name: 'bus0', 
                status: bus0, 
                address: '0x01'
            }, 
            1: {
                name: 'bus1', 
                status: bus1, 
                address: '0x02'
                }, 
            2: {
                name: 'bus2', 
                status: bus2, 
                address: '0x04'
            }, 
            3: {
                name: 'bus3', 
                status: bus3, 
                address: '0x08'
            }
        };
        this.schedule = null;
        this.ModbusTcpMutex = null;
        this.client = null;
	this.client_connected = false;
    }
    
    async connect() {
        this.client = net.connect( { host: this.host, port: this.port }, () => {
    	    this.client_connected = true;
    	    this.ModbusTcpMutex = mutex.withTimeout(new mutex.Mutex(), 1000);
            this.adapter.log.info('Dali4Net Connected to server!');
        });

        this.client.on('end', () => {
    	    this.client_connected = false;
            this.adapter.log.info('Dali4Net Disconnected from server');
        });
        
        this.client.on('error', (error) => {
            this.adapter.log.error('Dali4Net Error: ' + error);
            this.client.end();
        });
        
        this.client.on('close', (hadError) => {
    	    this.adapter.log.error('Dali4Net closed: '+ hadError);
    	    this.connect();
        });
    }

    
    async startSearch(bus) {
	while (!this.client_connected) {
		await new Promise(resolve => setTimeout(resolve, 1000));
	}

        let typeName;
        this.adapter.log.debug('startSearch BUS ' + bus);

        if(this.bus[bus] && this.bus[bus].status) {

            for(const i in searchDevice) {
                this.adapter.log.debug('Start request for device ' + searchDevice[i]);
                const transactionId = this.transactionIdentifier();
                let data;

/*                if (searchDevice[i].indexOf('e') === 0) {

                    for(const id in daliClass) {
                        
                        data = await this.sendMessage(this.bus[bus].address, transactionId, '0x' + daliGetHex[i], queryType.edali, daliSize.eDali25Bit, id);
                        this.adapter.log.debug('Data ' + JSON.stringify(data));
                        this.adapter.log.debug('Message received ' + daliGetHex[i]);

                        typeName = typeEDali[data[14]];

                        const exists = this.deviceExists(data, searchDevice[i], typeName);

                        if(exists) {
 
                            await this.createClass (typeName, searchDevice[i], daliGetHex[i], this.bus[bus].address, this.bus[bus].name, daliSize.eDali25Bit, id);
                
                        }
                                
                    }
                
                } else*/ if (searchDevice[i].indexOf('a') === 0)  {

                    data = await this.sendMessage(this.bus[bus].address, transactionId, '0x' + daliGetHex[ daliName.indexOf(searchDevice[i]) ], queryDali.queryDeviceType, daliSize.dali16Bit, daliClass[0]);
		    if (data == null) continue;
		    
		    // hack for 4ch modules
		    if (data[14] == 255) data[14] = 6;
		    
                    typeName = typeDali[data[14]];

                    const exists = this.deviceExists(data, searchDevice[i], typeName);

                        if(exists) {

                            await this.createClass (typeName, searchDevice[i], daliGetHex[ daliName.indexOf(searchDevice[i]) ], this.bus[bus].address, this.bus[bus].name, daliSize.dali16Bit, daliClass[0]);
                  
                        }

                } /*else if (searchDevice[i].indexOf('g') === 0){

                    data = await this.sendMessage(this.bus[bus].address, transactionId, '0x' + daliGetHex[i], queryDali.queryDeviceType, daliSize.dali16Bit, daliClass[0]);
                    this.adapter.log.debug('Data ' + JSON.stringify(data));
                    this.adapter.log.debug('Message received ' + daliGetHex[i]);

                    typeName = 'Group';

                    const exists = this.deviceExists(data, searchDevice[i], typeName);

                        if(exists) {
       
                            await this.createClass (typeName, searchDevice[i], daliGetHex[i], this.bus[bus].address, this.bus[bus].name, daliSize.dali16Bit, daliClass[0]);
            
                        }
                }  */
            }
	    
	    return this.devices;
        }
    }

    async createClass (typeName, searchDevice, daliGetHex, busAdd, busName, size, daliClass){

        try {
             
            this.adapter.log.debug('createClass for '+ searchDevice+' (hex '+daliGetHex+') as ' + typeName);
            this.adapter.log.debug(typeName+":"+searchDevice+":"+daliGetHex+":"+busAdd+":"+busName+":"+size+":"+daliClass);
            
            let d = await lib.daliDevice.fromType(this, typeName, searchDevice, daliGetHex, busAdd, busName, size, daliClass);
            let p = d.getPath();
            this.devices[p] = d;
        } catch(error) {
            this.adapter.log.error(error);
        }
    }
    
    async getInfo(bus, address, query, size, deviceClass){
  
            const transactionId = this.transactionIdentifier();
            const data = await this.sendMessage(bus, transactionId, '0x' + address, query, size, deviceClass);

            return data
    }

    async sendMessage(busAddress, transactionId, daliAddress, query, size, daliClass) {
	const hexData = [
	    busAddress, transactionId, '0x00', '0x00', '0x00', '0x17', busAddress, '0x17', '0x00', '0x65', 
	    '0x00', '0x05', '0x00', '0x64', '0x00', '0x06', '0x0c', '0x12', busAddress, '0x00', 
	    size, '0x00', daliClass , daliAddress, query, '0x00', '0x00', '0x00', '0x00'
	];
	const send_data = Buffer.from(hexData);
	
	return await this.sendModbusTcpMessage(send_data);
    }
    
    async sendModbusTcpMessage(send_data) {
	try {
	    // Set mutex here: https://brunoscheufler.com/blog/2021-05-31-locking-and-synchronization-for-nodejs
	    return await this.ModbusTcpMutex.runExclusive(async() => {
    		this.adapter.log.debug('send Message to Dali4Net:      ' + JSON.stringify(send_data));
    		this.client.write(send_data);

    		const read_data = await new Promise((resolve)=> {
        	    this.client.once('data', (data) => {
            		this.adapter.log.debug('Received answer from Dali4Net: ' + JSON.stringify(data));
            		resolve(data);
        	    });
    		});

    		return read_data;
	    });
	} catch (error) {
	    this.adapter.log.debug('Received answer from Dali4Net: null');
	    return null;
	}
    
    }
    
    transactionIdentifier() {
        const min = 0;
        const max = 253;
        const x = Math.floor(Math.random() * (max - min)) + min;
        return '0x' + x.toString(16);
    }

    deviceExists(data, name, typeName) {
	if (data == null) return false;
	
        if(data && (data[10] == 130 || data[10] == '0x82')) {
            if (name.indexOf('g') === 0){
                this.adapter.log.info('Group ' + name + ' found');
            }else{
                this.adapter.log.info('Device '+ name +' of type '+ typeName+' found');
            }
            return true;
        }
        
        this.adapter.log.debug('Device ' + name + ' not found');
        return false;
    }

    
////////////////////////////////get State Dali Bus/////////////////////////////////////////////////


    startCounter() {
        this.schedule = setInterval(() => this.startCounterAsync(), 1000);
    }
    
    async startCounterAsync() {
	if (this.bus[0].status) await this.counterObjects(0);
	if (this.bus[1].status) await this.counterObjects(1);
	if (this.bus[2].status) await this.counterObjects(2);
	if (this.bus[3].status) await this.counterObjects(3);
    }

    destroy() {
        if(this.schedule) {
            clearInterval(this.schedule);
        }

        this.client.destroy();
    }

    async counterObjects(b) {
        const lampStates = await this.messageLampStates(this.bus[b].address);
	if (lampStates == null) return;
	
        try {
            for(const i in this.devices) {

                const device = this.devices[i];
		if (device.getbusName() != "bus"+b) continue;
		
                const name = device.getName();
                //this.adapter.log.info('name ' + name);

                const levelOld = await device.getLevelDali();
                //this.adapter.log.debug('levelodl ' + levelOld);
        
                if (levelOld != null) {
                        
                        let levelNew = 0
                        const pos = daliLevel[ daliName.indexOf(name) ];
                        //this.adapter.log.debug('pos ' + pos);
                        
                        if(pos != null){
                            levelNew = lampStates[pos] ? lampStates[pos]:0;
                            //this.adapter.log.debug('newlevel ' + levelNew);
                        }/*else{
                            levelNew = await device.getNewLevel();
                            this.adapter.log.debug('newLevel ' + levelNew);
                        }*/

                        if (levelNew != levelOld){
                            await device.setLevelDali(levelNew);
                            this.adapter.log.debug('Level changed to ' + levelNew + ' for ' + device.getPath());
                            await this.adapter.onDaliLevelChanged(device);
                        }
                }
                
/*
                const stateOld = await device.getState();
                //this.adapter.log.debug('stateOld ' + stateOld);
            
                if (stateOld != null){
                        
                        const stateNew = await device.getNewState();
                        this.adapter.log.debug('newstate ' + stateNew);

                        if (stateNew != stateOld){

                            device.setNewState(stateNew);
                            const path = device.getPath();

                            this.adapter.log.debug('path ' + path + name);
                            this.responseState(stateNew, name, path + name);
                        }
                }
                
                const relayOld = await device.getRelayState();
                //this.adapter.log.debug('relayOld ' + relayOld);

                if(relayOld != null){

                        const pos = device.getLevelpos();
                        this.adapter.log.debug('pos ' + pos);

                        const r = this.getLevel(lampStates, device.getLevelpos());
                        let relayNew;
                        if(r>0){relayNew = true}
                        else{relayNew = false};
                        this.adapter.log.debug('relayNew ' + relayNew);

                        if (relayNew != relayOld){

                            device.setNewRelayState(relayNew);
                            const path = device.getPath();

                            this.adapter.log.debug('path ' + path + name);
                            this.responseState(relayNew, name, path + name);
                        }
                        
                }*/
            }
        } catch(error) {
            this.adapter.log.error(error);
        }
    }

    async messageLampStates(busAddress) {
            
        const hexData = [
/*            busAddress, '0x13', '0x00', '0x00', '0x00', '0x17', busAddress, '0x17', '0x23', '0x28', 
            '0x00', '0x40', '0x00', '0x64', '0x00', '0x06', '0x0c', '0x12', busAddress, '0x00', 
            '0x03', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'*/
            // Modbus/TCP
            busAddress, '0x13', // Modbus TCP Transaction Identifier
            '0x00', '0x00', // Protocol Identifier
            '0x00', '0x17', // Length = 23
            busAddress, // Unit identifier
            
            // Modbus
            '0x17', // Function code 23 (Read Write Register)
            '0x23', '0x28', // Read reference number 9000 (35*256+40=9000)
            '0x00', '0x40', // Read words count 64
            '0x00', '0x64', // Write reference number 100
            '0x00', '0x06', // Write word count 6
            '0x0c', // Bytes count 12
            
            // Dali4Net message
            '0x12', // Command byte = 0x12 always
            busAddress, // Command Sequence number (will be sent back)
            '0x00', // Control 
            '0x03', // Mode 3: send DALI (16 Bit, DATA_MID, DATA_LO)
            '0x00', // Reserved
            '0x00', // Highest Dali Byte (DATA_HI)
            '0xFD', '0xA0', // Command (Dali Mid & Low) = Quary actual level, address not assigned
            '0x00', // Value to be set to DTR
            '0x00', // Priority for dali command
            '0x00', //Device type to be sent
            '0x00'
        ];

        const data = Buffer.from(hexData);
        return this.sendModbusTcpMessage(data);
/*//        this.adapter.log.debug('Query Dali4Net lamps:  ' + JSON.stringify(data));
        this.client.write(data);

        return new Promise((resolve)=> {
            this.client.once('data', (data) => {
//        	this.adapter.log.debug('Answer Dali4Net lamps: ' + JSON.stringify(data));
                resolve(data);
            });
        });*/
    }

    responseState (value, name, path) {
        
        this.adapter.setState(this.adapter.namespace + '.' + path, value, true)
            this.adapter.log.info('neu ' + name + ' ' + value)
    }

    ////////////////////////////////set State Dali Bus/////////////////////////////////////////////////


    async sendLampState(bus, value, name) {
       
        const lampLevel = value;//this.getLevelHex(value);
        const lampId = '0x' + daliSetHex[daliName.indexOf(name)];

        const transactionId = this.transactionIdentifier();

        
//        this.adapter.log.info('lampId ' + lampId);
//        this.adapter.log.info('lampLevelhex ' + lampLevel);

        await this.sendMessage(this.bus[bus].address, transactionId, lampId, lampLevel, daliSize.dali16Bit, daliClass[0]);
        
    }

/*
    sendGroupState(bus, value, name) {
        
        const transactionId = this.transactionIdentifier();
       
        const groupId = '0x' + daliSetHex[daliName.indexOf(name)];
        this.adapter.log.debug('groupId ' + groupId);
        
        const groupLevel = this.getLevelHex(value);
     
        this.adapter.log.debug('groupLevel ' + groupLevel);

        this.sendMessage(this.bus[bus].address, transactionId, groupId, groupLevel, daliSize.dali16Bit, daliClass[0]); 

    }

    sendScene(bus, name) {
     
        const transactionId = this.transactionIdentifier();

        const broadcastScene = '0xfe';
    
        const sceneId = '0x' + daliSetHex[daliName.indexOf(name)];
        this.adapter.log.debug('sceneId ' + sceneId);

        this.sendMessage(this.bus[bus].address, transactionId, broadcastScene, sceneId, daliSize.dali16Bit, daliClass[0]); 

    }

    sendBroadcast(bus, value) {
        
        const transactionId = this.transactionIdentifier();
    
        const broadcast = '0xfe';

        const broadcastLevel = this.getLevelHex(value);

        this.sendMessage(this.bus[bus].address, transactionId, broadcast, broadcastLevel, daliSize.dali16Bit, daliClass[0]); 
    }*/

/*    getLevelHex (value) {
        return '0x' + (Math.round((value*254)/100)).toString(16);
    }*/



    
}

module.exports = Dali4Net;