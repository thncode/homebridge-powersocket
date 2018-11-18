var Service, Characteristic, HomebridgeAPI, FakeGatoHistoryService;
var inherits = require('util').inherits;
var os = require("os");
var hostname = os.hostname();

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    HomebridgeAPI = homebridge;
    FakeGatoHistoryService = require("fakegato-history")(homebridge);
    	
    homebridge.registerAccessory("homebridge-powersocket", "PowerSocket", PowerSocketPlugin);
};

function PowerSocketPlugin(log, config) {
	
	var that = this;
	this.log = log;

	// Setup services
    this.setUpServices();
    
    setInterval(function() {
		// that.log("!");
	}, 60000); 
};

PowerSocketPlugin.prototype.getFirmwareRevision = function (callback) {
    callback(null, '1.0.0');
};

PowerSocketPlugin.prototype.getBatteryLevel = function (callback) {
    callback(null, 100);
};

PowerSocketPlugin.prototype.getCurrentPowerConsumption = function (callback) {
	callback(null, 2.3);
};

PowerSocketPlugin.prototype.getTotalConsumption = function (callback) {
	callback(null, 20);
};

PowerSocketPlugin.prototype.setResetTotal = function (callback) {
	callback(null, 0);
};

PowerSocketPlugin.prototype.getStatusActive = function (callback) {
	callback(null, true);
};

PowerSocketPlugin.prototype.setUpServices = function () {

    this.informationService = new Service.AccessoryInformation();

    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Thomas Nemec")
        .setCharacteristic(Characteristic.Model, "PowerSocket")
        .setCharacteristic(Characteristic.SerialNumber, "0815");
    this.informationService.getCharacteristic(Characteristic.FirmwareRevision)
        .on('get', this.getFirmwareRevision.bind(this));

    this.fakeGatoHistoryService = new FakeGatoHistoryService("energy", this, { storage: 'fs' });
    
	CurrentPowerConsumption = function () {
		Characteristic.call(this, 'Verbrauch', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.UINT16,
			unit: "Watt",
			maxValue: 100000,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};

	CurrentPowerConsumption.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';
	inherits(CurrentPowerConsumption, Characteristic);

	TotalConsumption = function () {
		Characteristic.call(this, 'Leistung', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.FLOAT,
			unit: "kWh",
			maxValue: 100000000000,
			minValue: 0,
			minStep: 0.001,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	TotalConsumption.UUID = 'E863F10C-079E-48FF-8F27-9C2605A29F52';
	inherits(TotalConsumption, Characteristic);

	ResetTotal = function () {
		Characteristic.call(this, 'Verbrauch zurücksetzen', 'E863F112-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.UINT32,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	};
	ResetTotal.UUID = 'E863F112-079E-48FF-8F27-9C2605A29F52';
	inherits(ResetTotal, Characteristic);
/*
    PowerSocket = function (displayName, subtype) {
		Service.call(this, displayName, '0000003E-0000-1000-8000-0026BB765291', subtype);
		
		this.addCharacteristic(CurrentPowerConsumption);
		this.addCharacteristic(TotalConsumption);
		this.addCharacteristic(ResetTotal);
	};
	
	inherits(PowerSocket, Service);
	
	PowerSocket.UUID = 'd2af0189-4086-4788-9030-edca267ed4ed';
        
    this.powerSocketService = new PowerSocket(this.name);
    
	this.powerSocketService.getCharacteristic(Characteristic.StatusActive)
		.on('get', this.getStatusActive.bind(this));
*/
    this.service = new Service.Switch(this.name);
    
    this.service
		.getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
		.on('set', this.setOn.bind(this));
		
	this.service.getCharacteristic(CurrentPowerConsumption)
		.on('get', this.getCurrentPowerConsumption.bind(this));
		
	this.service.getCharacteristic(TotalConsumption)
		.on('get', this.getTotalConsumption.bind(this));

	this.service.getCharacteristic(ResetTotal)
		.on('get', this.setResetTotal.bind(this));
};

PowerSocketPlugin.prototype.getOn = function(callback) {
	callback(null, true);
}

PowerSocketPlugin.prototype.setOn = function(on, callback) {
	callback(null);
}

PowerSocketPlugin.prototype.getServices = function () {
	
    var services = [this.informationService, this.service, this.fakeGatoHistoryService];

    return services;
};
