import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from "homebridge";
import axios from "axios";
import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { GateAccessory } from "./accessory";

export class Shelly2ProGatePlatform implements DynamicPlatformPlugin {
  public readonly Service = this.api.hap.Service;
  public readonly Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    if (!config || !config.devices) return;
    this.api.on("didFinishLaunching", () => {
      for (const device of config.devices) {
        const uuid = this.api.hap.uuid.generate(device.ip);
        const accessory = new this.api.platformAccessory(device.name, uuid);
        new GateAccessory(this, accessory, device);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }
    });
  }
}
