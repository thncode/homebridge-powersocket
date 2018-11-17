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

	// Setup services
    this.setUpServices();
};

PowerSocketPlugin.prototype.getStatusLowBattery = function (callback) {
    callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
};

PowerSocketPlugin.prototype.getFirmwareRevision = function (callback) {
    callback(null, this.storedData.firmware ? this.storedData.firmware.firmwareVersion : '1.0.0');
};

PowerSocketPlugin.prototype.setUpServices = function () {
    // info service
    this.informationService = new Service.AccessoryInformation();

    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, this.config.manufacturer || "THN")
        .setCharacteristic(Characteristic.Model, this.config.model || "PowerSocket")
        .setCharacteristic(Characteristic.SerialNumber, this.config.serial || hostname + "-" + this.name);
    this.informationService.getCharacteristic(Characteristic.FirmwareRevision)
        .on('get', this.getFirmwareRevision.bind(this));

    this.batteryService = new Service.BatteryService(this.name);
    this.batteryService.getCharacteristic(Characteristic.BatteryLevel)
        .on('get', this.getBatteryLevel.bind(this));
    this.batteryService.setCharacteristic(Characteristic.ChargingState, Characteristic.ChargingState.NOT_CHARGEABLE);
    this.batteryService.getCharacteristic(Characteristic.StatusLowBattery)
        .on('get', this.getStatusLowBattery.bind(this));
};

PowerSocketPlugin.prototype.getServices = function () {
	
    var services = [this.informationService, this.batteryService];

    return services;
};
