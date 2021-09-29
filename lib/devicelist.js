const dali = require('./dali4net.js');
const tools = require('./tools.js');


const queryDali = {
    level: '0xa0',
    min: '0x9a',
    group07: '0xc0',
    group815: '0xc1'
}
const queryEDali = {
    switchState: '0xc0',
    eventSource: '0xbe'
}
//const accessMode = {0: 'Master Mode', 1: 'Event Message Mode', 2: 'Slave Mode'};

const daliSize = ['0x03', '0x04', '0x06'];
const daliClass = ['0x00', '0x05'];

let cacheGroup = {0: 0, 1: 0};
const group07 = {0: 0, 1: 'g00', 2: 'g01', 4: 'g02', 8: 'g03', 16: 'g04', 32: 'g05', 64: 'g06', 128: 'g07',
                3: 'g00 + g01', 5: 'g00 + g02', 9: 'g00 + g03', 17: 'g00 + g04', 33: 'g00 + g05', 65: 'g00 + 06', 
                129: 'g00 + g07', 6: 'g01 + g02', 10: 'g01 + g03', 18: 'g01 + g04', 34: 'g01 + g05', 66: 'g01 + g06', 
                130: 'g01 + g07', 12: 'g02 + g03', 20: 'g02 + g04', 36: 'g02 + g05', 68: 'g02 + g06', 132: 'g02 + g07', 
                24: 'g03 + g04', 40: 'g03 + g05', 72: 'g03 + g06', 136: 'go3 + g07', 48: 'g04 + g05', 80: 'g04 + g06', 
                144: 'g04 + g07', 96: 'g05 + g06', 160: 'g05 + g07', 192: 'g06 + g07'
}
const group815 = {0: 0, 1: 'g08', 2: 'g09', 4: 'g10', 8: 'g11', 16: 'g12', 32: 'g13', 64: 'g14', 128: 'g15',
                3: 'g08 + g09', 5: 'g08 + g10', 9: 'g08 + g11', 17: 'g08 + g12', 33: 'g08 + g13', 65: 'g08 + 06', 
                129: 'g08 + g15', 6: 'g09 + g10', 10: 'g09 + g11', 18: 'g09 + g12', 34: 'g09 + g13', 66: 'g09 + g14', 
                130: 'g09 + g15', 12: 'g10 + g11', 20: 'g10 + g12', 36: 'g10 + g13', 68: 'g10 + g14', 132: 'g10 + g15', 
                24: 'g11 + g12', 40: 'g11 + g13', 72: 'g11 + g14', 136: 'go3 + g15', 48: 'g12 + g13', 80: 'g12 + g14', 
                144: 'g12 + g15', 96: 'g13 + g14', 160: 'g13 + g15', 192: 'g14 + g15'
}

class Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass, info, state, folder) {
    
        this.dali = dali;
        this.name = name;
        this.folder = folder;
        this.size = size;
        this.daliClass = daliClass;
        this.info = info;
        this.type = type;
        this.busAdd = busAdd;
        this.busName = busName;
        this.address = address;
        this.source = null;
        this.levelDali = null;
        this.levelHa = null;
        this.min = null;
        this.group = null;
        this.state = null;
        this.newState = null;
        this.newLevel = null;
        
    }

    getName() {
        return this.name;
    }
/*    getInfo() {
        return null; //throw new Error('No statedefinition duntion defined');
    }*/
    getLevelDali() {
        return null;
    }
    getLevelHa() {
	return null;
    }
    /*getState() {
        return null;
    }
    getStateDefinition() {
        return null;
    }*/
    /*getSource(){
        return null;
    }*/
    getSize(){
        return this.size;
    }
    getClass(){
        return this.daliClass;
    }
    getMinLevel (){
        return null;
    }
    getGroup07(){
        return null;
    }
    getGroup815(){
        return null;
    }
    getGroup(){
        return null;
    }
/*    getLevelpos (){
        return null;
    }*/
    getbusName(){
	return this.busName;
    }
    getbus(){
	if (this.busName.length == 4) return this.busName.substr(3);
	return null;
    }
    getPath(){
        return null;
    }
    getNewState(){
        return null;
    }
    getType() {
        return this.type;
    }
/*    getRelayState(){
        return null;
    }
    setNewRelayState(){
        return null;
    }*/

    static async fromType(dali, type, name, address, busAdd, busName, size, daliClass) {
	let d = null;
	
        if(type === 'LED Modules' || type === 'Low Voltage Halogen Lamps' || type === 'Supply Voltage Regulator' || type === 'Fluoresecent Lamps' || type === 'DALI to 1-10V') {
            d = new Lamp(dali, type, name, address, busAdd, busName, size, daliClass);
        }
/*        if(type === 'Dali Switch' || type === 'Dali MC+' || type === 'Dali MC' || type === 'Dali Touch') {
            d = new DaliSwitch(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Group') {
            d = new Group(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Relays') {
            d = new Relay(dali, type, name, address, busAdd, busName, size, daliClass);
        }*/

	if (tools.isObject(d)) {
	    await d.getMinLevel();
            await d.getLevelDali();
            await d.getGroup07();
            await d.getGroup815();
            await d.getGroup();
            //d.getState();
            //d.getSource();
            
	    return d;
	}
	
        throw type + ' is not a valid type.';
    }
}

/*class DaliSwitch extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.switchState;
        states.eventSource;
    }

    // @ts-ignore
    async getState() {

        if(this.state === null){

            const data = await this.dali.getInfo(this.busAdd, this.address, queryEDali.switchState, this.size, this.daliClass);
            this.state = data[14]
        }

        return this.state;
    }

    // @ts-ignore
    async getNewState() {

            const data = await this.dali.getInfo(this.busAdd, this.address, queryEDali.switchState, this.size, this.daliClass);
            this.newState = data[14]
        
        return this.newState;
    }

    setNewState(data){

        this.state = data;
    }

    // @ts-ignore
    async getSource() {

        if(this.source === null) {

            const data = await this.dali.getInfo(this.busAdd, this.address, queryEDali.eventSource, this.size, this.daliClass);
            this.source = data[14]
        }

        return accessMode[this.source];
    }

    // @ts-ignore
    getPath(){
        return this.busName + '_devices_' + this.name;
    }
}*/

class Lamp extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);
    }
    
    convertLevelDali2Ha(lvl) {
	let result = 0;
        if (lvl != 0) {
	    result = Math.round( (lvl - this.min) * 100 / (254 - this.min)  );
	    if (result < 1) { result = 1; } //console.log("FUCKK!!!!!!!!!!!!!!!!"); }
	}
	return result;
    }
    
    convertLevelHa2Dali(lvl) {
	let result = 0;
	if (lvl != 0) {
	    result = Math.round(this.min + (255-this.min)*lvl/100 - 1);
	    if (result < this.min) { result = this.min; } //console.log("FUCKK!!!!!!!!!!!!!!!!  lvl:"+lvl+", min:"+this.min); }
	    if (result > 254) result = 254;
	}
        return result;
    }
    
    // @ts-ignore
    async getLevelDali() {
//       console.debug('level device' + this.level)
        if(this.levelDali === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            if (data == null) return null;
            
    	    this.levelDali = data[14];
    	    this.levelHa = this.convertLevelDali2Ha( data[14] );
        }
        
        return this.levelDali
    }
    
    // @rs-ignore
    async getLevelHa() {
	if (this.levelHa == null) await this.getLevelDali();
	return this.levelHa
    }

    // @ts-ignore
    async setLevelDali(data){
	this.levelDali = data;
	this.levelHa = this.convertLevelDali2Ha(data);
    }
    
    // @ts-ignore
    async setLevelHa(data){
	await this.dali.sendLampState(this.getbusName().substr(3), /*this.levelDali*/this.convertLevelHa2Dali(data), this.getName());
    }

    // @ts-ignore
    async getMinLevel (){
        if(!this.min) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.min, daliSize[0], daliClass[0]);
            if (!data) return;
            
	    this.min = data[14];
        }

        this.dali.adapter.log.debug("Device min level: " + this.min);
        return this.min;
    }

    // @ts-ignore
    async getGroup07(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group07, daliSize[0], daliClass[0]);
        if (!data) return;
        
        cacheGroup[0] = data[14];
    }

    // @ts-ignore
    async getGroup815(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group815, daliSize[0], daliClass[0]);
        if (!data) return;
        
        cacheGroup[1] = data[14];
    }

    getGroup(){

        if(!this.group){
    	    let info1 = cacheGroup[0];
    	    let info2 = cacheGroup[1];

    	    if (info1 != 0 && info2 === 0){
        	this.group = (group07[info1]) ? group07[info1]: 0
    	    } else if (info1 === 0 && info2 != 0){
        	this.group = (group815[info2]) ? group815[info2]: 0
    	    } else if (info1 != 0 && info2 != 0){
        	this.group = (group07[info1] + ' ' + group815[info2]) ? (group07[info1] + ' ' + group815[info2]): 0
    	    }
        }
        
        return this.group;
    }

    // @ts-ignore
    getPath(){
        return this.busName + '_lamps_' + this.name;
    }
}

/*class Relay extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.level,
        states.min,
        states.group
        
    }
    
    // @ts-ignore
    async getRelayState() {

        if(this.relay === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            const r = Math.round((data[14] / 254) * 100);
            if(r>0){this.relay = true}
            else{this.relay = false}
        }
        
        return this.relay
    }

    // @ts-ignore
    setNewRelayState(data){
        console.debug('setnewlevel ' + data)
        this.relay = data;
    }

    // @ts-ignore
    async getGroup07(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group07, daliSize[0], daliClass[0]);
        cacheGroup[0] = data[14];
    }

    // @ts-ignore
    async getGroup815(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group815, daliSize[0], daliClass[0]);
        cacheGroup[1] = data[14];
    }

    getGroup(){

        if(!this.group){
            this.group = this.dali.getGroup(cacheGroup[0], cacheGroup[1]);
        }
        
        return this.group;
    }

    // @ts-ignore
    getPath(){
        return this.busName + '_lamps_' + this.name;
    }
}

class Group extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.level,
        states.min,
        states.group
        
    }

    // @ts-ignore
    async getLevel() {
        
        if(this.level === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            this.level = Math.round((data[14] / 254) * 100);
        }

        return this.level;
    }

    // @ts-ignore
    async getNewLevel() {
        
        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
        this.newLevel = Math.round((data[14] / 254) * 100);

        return this.newLevel;
    }

    async setNewLevel(data){
        console.debug('setnewlevel ' + data)
        this.level = data;
    }

    // @ts-ignore
    getPath(){
//        return this.busName + '.groups.';
        return this.busName + '_groups_' + this.name;

    }

} */  



module.exports = {daliDevice: Device
}

