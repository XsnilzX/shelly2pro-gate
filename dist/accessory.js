"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateAccessory = void 0;
const axios_1 = __importDefault(require("axios"));
class GateAccessory {
    constructor(platform, accessory, config) {
        this.platform = platform;
        this.accessory = accessory;
        this.config = config;
        this.currentState = 1; // 1 = CLOSED, 0 = OPEN
        this.service =
            accessory.getService(this.platform.Service.GarageDoorOpener) ||
                accessory.addService(this.platform.Service.GarageDoorOpener);
        this.service.setCharacteristic(this.platform.Characteristic.Name, config.name);
        this.service
            .getCharacteristic(this.platform.Characteristic.TargetDoorState)
            .onSet((value) => this.setTargetState(value));
        this.service
            .getCharacteristic(this.platform.Characteristic.CurrentDoorState)
            .onGet(() => this.currentState);
    }
    async setTargetState(value) {
        const targetState = typeof value === "number" ? value : Number(value);
        const relay = this.config.relay ?? 0;
        const url = `http://${this.config.ip}/relay/${relay}?turn=on`;
        try {
            await axios_1.default.get(url, {
                auth: this.config.username
                    ? {
                        username: this.config.username,
                        password: this.config.password ?? "",
                    }
                    : undefined,
            });
            this.platform.log.info(`Trigger signal sent to ${this.config.name}`);
            this.simulateStateChange();
        }
        catch (err) {
            this.platform.log.error(`Failed to trigger gate at ${this.config.ip}:`, err);
        }
    }
    simulateStateChange() {
        this.currentState = this.platform.Characteristic.CurrentDoorState.OPENING;
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.currentState);
        setTimeout(() => {
            this.currentState = this.platform.Characteristic.CurrentDoorState.OPEN;
            this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.currentState);
        }, (this.config.pulseDuration ?? 1) * 1000);
    }
}
exports.GateAccessory = GateAccessory;
