/*

  Planetary Gears - Planetary Gear Model Library

  Source repository (at time of writing):
  https://github.com/tommccracken/PlanetaryGears


  Copyright 2017 Thomas O. McCracken

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

*/


const PI = Math.PI;

function isNumInteger(num){
  if (num === parseInt(num, 10)){
    return true;
  }
  else {
    return false;
  }
}


class AbstractGear {

  constructor(tooth_pitch, gear_size, gear_speed) {
    // Gear tooth pitch (m)
    this.tooth_pitch = tooth_pitch;
    // Number of gear teeth (must be an integer)
    this.gear_size = gear_size;
    // Gear angular velocity (rad/s)
    this.gear_speed = gear_speed;
    // The Pitch Circle Diameter for the gear (m)
    this.PCD = gear_size * tooth_pitch / PI;
    // Angular position of the gear (rad)
    this.position = 0;
    // Position correction so planets mesh with sun and ring meshes with planets
    this.mesh_correcction = 0;
  }

}


class InnerGear extends AbstractGear {

  constructor(tooth_pitch, gear_size, gear_speed) {
    super(tooth_pitch, gear_size, gear_speed);
    // The hub diameter of the gear (m). Nominal value that looks nice.
    this.hub_diameter = this.PCD / 2 * 0.3;
  }

}


class OuterGear extends AbstractGear {

  constructor(tooth_pitch, gear_size, gear_speed) {
    super(tooth_pitch, gear_size, gear_speed);
    // The outer diameter of the ring gear (m). Nominal value that looks nice.
    this.outer_diameter = this.PCD + 3 * tooth_pitch;
  }

}


class PlanetaryGear {

  constructor(size_input_mode, size_A, size_B, speed_input_mode, speed_A, speed_B, tooth_pitch, number_of_planets) {
    let sun_size, planet_size, ring_size, sun_speed, carrier_speed, ring_speed, planet_speed = 0;
    if (size_input_mode == 1) {
      // Input sun and planet sizes, calculate ring size
      sun_size = size_A;
      planet_size = size_B;
      ring_size = sun_size + 2 * planet_size;
    } else if (size_input_mode == 2) {
      // Input sun and ring sizes, calculate planet size
      sun_size = size_A;
      ring_size = size_B;
      planet_size = (ring_size - sun_size) / 2;
    } else if (size_input_mode == 3) {
      // Input planet and ring sizes, calculate sun size
      planet_size = size_A;
      ring_size = size_B;
      sun_size = ring_size - 2 * planet_size;
    } else {
      Console.log("Error: The size_input_mode parameter is ivalid, only the integer values 1, 2, or 3 are valid.");
    }
    if (speed_input_mode == 1) {
      // Input sun and carrier speeds, calculate ring and planet speeds
      sun_speed = speed_A;
      carrier_speed = speed_B;
      // NsWs + NpWp - (Ns+Np)Wc = 0
      // => Wp = ((Ns+Np)Wc-NsWs)/Np
      planet_speed = ((sun_size + planet_size) * carrier_speed - sun_size * sun_speed) / planet_size;
      // NrWr - NpWp-(Nr-Np)Wc = 0
      // => Wr = ((Nr-Np)Wc+NpWp)/Nr
      ring_speed = ((ring_size - planet_size) * carrier_speed + planet_size * planet_speed) / ring_size;
    } else if (speed_input_mode == 2) {
      // Input sun and ring speeds, calculate carrier and planet speeds
      sun_speed = speed_A;
      ring_speed = speed_B;
      // NsWs + NpWp - (Ns+Np)Wc = 0
      // NrWr - NpWp-(Nr-Np)Wc = 0
      // => NsWs + NrWr = (Ns+Nr)Wc
      // => Wc = (NsWs + NrWr) / (Ns+Nr)
      carrier_speed = (sun_size * sun_speed + ring_size * ring_speed) / (sun_size + ring_size);
      // NsWs + NpWp - (Ns+Np)Wc = 0
      // => Wp = ((Ns+Np)Wc-NsWs)/Np
      planet_speed = ((sun_size + planet_size) * carrier_speed - sun_size * sun_speed) / planet_size;
    } else if (speed_input_mode == 3) {
      // Input carrier and ring speeds, calculate sun and planet speeds
      carrier_speed = speed_A;
      ring_speed = speed_B;
      // NsWs + NpWp - (Ns+Np)Wc = 0
      // NrWr - NpWp-(Nr-Np)Wc = 0
      // => NsWs + NrWr = (Ns+Nr)Wc
      // => Ws = ((Ns+Nr)Wc-NrWr)/Ns
      sun_speed = ((sun_size + ring_size) * carrier_speed - ring_size * ring_speed) / sun_size;
      // NsWs + NpWp - (Ns+Np)Wc = 0
      // => Wp = ((Ns+Np)Wc-NsWs)/Np
      planet_speed = ((sun_size + planet_size) * carrier_speed - sun_size * sun_speed) / planet_size;
    } else {
      Console.log("Error: The speed_input_mode parameter is ivalid, only the integer values 1, 2, or 3 are valid.");
    }
    //if (!Number.isInteger((sun_size + ring_size) / number_of_planets)) {
    if (!isNumInteger((sun_size + ring_size) / number_of_planets)) {
      console.log("Warning: The expression [(sun size + ring size) / number of planets] must evaluate to an integer in order for the ring gear to be able to mesh with the planet gears");
    }
    // Create the sun gear
    this.sun = new InnerGear(tooth_pitch, sun_size, sun_speed);
    // Create the ring gear
    this.ring = new OuterGear(tooth_pitch, ring_size, ring_speed);
    // Define the carrier properties
    this.carrier_speed = carrier_speed;
    this.carrier_position = 0;
    // Create the planets
    this.planets = [];
    for (let n = 0; n < number_of_planets; n++) {
      // Create a new planet
      this.planets[n] = new InnerGear(tooth_pitch, planet_size, planet_speed);
      // Set the mesh_correction value for the planet gear in order to enable meshing with the sun gear
      let planet_carrier_angle = this.carrier_position + n * 2 * PI / number_of_planets;
      let sun_tooth_count = this.sun.gear_size / (2 * PI) * planet_carrier_angle;
      let sun_tooth_count_part = sun_tooth_count - Math.floor(sun_tooth_count);
      this.planets[n].mesh_correcction = PI + planet_carrier_angle + (0.5 + sun_tooth_count_part) * (2 * PI / this.planets[n].gear_size);
      this.planets[n].position = this.planets[n].mesh_correcction;
    }
    this.carrier_pitch = this.sun.PCD + this.planets[0].PCD;
    // Set the mesh_correction value for the ring gear in order enable meshing with the planet gears
    if (!(this.ring.gear_size % 2)) {
      this.ring.mesh_correcction = 0.5 * (2 * PI / this.ring.gear_size);
      this.ring.position = this.ring.mesh_correcction;
    }
    console.log("New planetary gear created. Size input mode: " + size_input_mode + ", Sun size: " + sun_size + ", Planet size: " + planet_size + ", Ring size: " + ring_size + " , Speed input mode: " + speed_input_mode + ", Sun speed: " + sun_speed + " , Carrier speed: " + carrier_speed + ", Planet sspeed: " + planet_speed + ", Ring speed: " + ring_speed);
  }

  fixed_speed_update(elapsed_time) {
    // Update ring
    if (!this.ring.gear_speed == 0) {
      let factor = ((elapsed_time / 1000) / ((1 / this.ring.gear_speed) * 2 * PI)) % 1;
      this.ring.position = 2 * PI * factor + this.ring.mesh_correcction;
    }
    // Update sun
    if (!this.sun.gear_speed == 0) {
      let factor = ((elapsed_time / 1000) / ((1 / this.sun.gear_speed) * 2 * PI)) % 1
      this.sun.position = 2 * PI * factor;
    }
    // Update planets
    for (let k = 0; k < this.planets.length; k++) {
      let planet = this.planets[k];
      if (!planet.gear_speed == 0) {
        let factor = ((elapsed_time / 1000) / ((1 / planet.gear_speed) * 2 * PI)) % 1
        planet.position = 2 * PI * factor + planet.mesh_correcction;
      }
    }
    // Update carrier
    if (!this.carrier_speed == 0) {
      let factor = ((elapsed_time / 1000) / ((1 / this.carrier_speed) * 2 * PI)) % 1;
      this.carrier_position = 2 * PI * factor;
    }
  }

}
