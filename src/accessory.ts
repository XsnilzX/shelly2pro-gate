import {
  PlatformAccessory,
  Service,
  Characteristic,
  CharacteristicValue,
} from "homebridge";
import axios from "axios";
import { GateDeviceConfig } from "./settings";
import { Shelly2ProGatePlatform } from "./platform";

export class GateAccessory {
  private service: Service;
  private currentState = 1; // 1 = CLOSED, 0 = OPEN

  constructor(
    private readonly platform: Shelly2ProGatePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly config: GateDeviceConfig,
  ) {
    this.service =
      accessory.getService(this.platform.Service.GarageDoorOpener) ||
      accessory.addService(this.platform.Service.GarageDoorOpener);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      config.name,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetDoorState)
      .onSet((value: CharacteristicValue) => this.setTargetState(value));

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentDoorState)
      .onGet(() => this.currentState);
  }

  async setTargetState(value: CharacteristicValue) {
    const targetState = typeof value === "number" ? value : Number(value);
    const relay = this.config.relay ?? 0;
    const url = `http://${this.config.ip}/relay/${relay}?turn=on`;

    try {
      await axios.get(url, {
        auth: this.config.username
          ? {
              username: this.config.username,
              password: this.config.password ?? "",
            }
          : undefined,
      });

      this.platform.log.info(`Trigger signal sent to ${this.config.name}`);
      this.simulateStateChange();
    } catch (err) {
      this.platform.log.error(
        `Failed to trigger gate at ${this.config.ip}:`,
        err,
      );
    }
  }

  simulateStateChange() {
    this.currentState = this.platform.Characteristic.CurrentDoorState.OPENING;
    this.service.updateCharacteristic(
      this.platform.Characteristic.CurrentDoorState,
      this.currentState,
    );

    setTimeout(
      () => {
        this.currentState = this.platform.Characteristic.CurrentDoorState.OPEN;
        this.service.updateCharacteristic(
          this.platform.Characteristic.CurrentDoorState,
          this.currentState,
        );
      },
      (this.config.pulseDuration ?? 1) * 1000,
    );
  }
}
