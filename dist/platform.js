"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shelly2ProGatePlatform = void 0;
const settings_1 = require("./settings");
const accessory_1 = require("./accessory");
class Shelly2ProGatePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.accessories = [];
        if (!config || !config.devices)
            return;
        this.api.on("didFinishLaunching", () => {
            for (const device of config.devices) {
                const uuid = this.api.hap.uuid.generate(device.ip);
                const accessory = new this.api.platformAccessory(device.name, uuid);
                new accessory_1.GateAccessory(this, accessory, device);
                this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [
                    accessory,
                ]);
            }
        });
    }
    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }
}
exports.Shelly2ProGatePlatform = Shelly2ProGatePlatform;
