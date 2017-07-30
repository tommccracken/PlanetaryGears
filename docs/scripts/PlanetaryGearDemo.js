/*

  Planetary Gears - Demonstration Sketch Script

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


var canvas = document.getElementById("SketchCanvas");
var ctx = canvas.getContext("2d");
var planetary_gear = new PlanetaryGear(1, 28, 17, 1, -0.4, 0.4, 0.032, 5);
var draw_size = Math.min(canvas.width, canvas.height);
var world_size = planetary_gear.ring.outer_diameter * 1.05;
var draw_scaling_factor = draw_size / world_size;
var debounce;
var start_time = 0;
var time_stamp;

function get_time() {
  //return performance.now();
  return Date.now();
}

function draw_basic_gear(cx, cy, gear) {
  var n = gear.gear_size;
  var theta = 2 * PI / n;
  var theta_step = theta / 6;
  var position = gear.position;
  var rad_n = gear.PCD / 2;
  var rad_i = rad_n - gear.tooth_pitch / 3;
  var rad_o = rad_n + gear.tooth_pitch / 3;
  var p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, p5x, p5y, p6x, p6y = 0;
  ctx.beginPath();
  for (var n_step = 0; n_step < n; n_step++) {
    p1x = cx + rad_o * Math.cos(position + n_step * theta);
    p1y = cy + rad_o * Math.sin(position + n_step * theta);
    ctx.lineTo(p1x * draw_scaling_factor, world_size * draw_scaling_factor - p1y * draw_scaling_factor);
    p2x = cx + rad_o * Math.cos(position + n_step * theta + theta_step);
    p2y = cy + rad_o * Math.sin(position + n_step * theta + theta_step);
    ctx.lineTo(p2x * draw_scaling_factor, world_size * draw_scaling_factor - p2y * draw_scaling_factor);
    p3x = cx + rad_i * Math.cos(position + n_step * theta + 2 * theta_step);
    p3y = cy + rad_i * Math.sin(position + n_step * theta + 2 * theta_step);
    ctx.lineTo(p3x * draw_scaling_factor, world_size * draw_scaling_factor - p3y * draw_scaling_factor);
    p4x = cx + rad_i * Math.cos(position + n_step * theta + 4 * theta_step);
    p4y = cy + rad_i * Math.sin(position + n_step * theta + 4 * theta_step);
    ctx.lineTo(p4x * draw_scaling_factor, world_size * draw_scaling_factor - p4y * draw_scaling_factor);
    p5x = cx + rad_o * Math.cos(position + n_step * theta + 5 * theta_step);
    p5y = cy + rad_o * Math.sin(position + n_step * theta + 5 * theta_step);
    ctx.lineTo(p5x * draw_scaling_factor, world_size * draw_scaling_factor - p5y * draw_scaling_factor);
    p6x = cx + rad_o * Math.cos(position + n_step * theta + 6 * theta_step);
    p6y = cy + rad_o * Math.sin(position + n_step * theta + 6 * theta_step);
    ctx.lineTo(p6x * draw_scaling_factor, world_size * draw_scaling_factor - p6y * draw_scaling_factor);
  }
  ctx.stroke();
}

function draw_basic_planetary_gear_set() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = Math.max(1, Math.round(draw_size * 0.005));
  ctx.strokeStyle = '#191919';
  // Draw sun
  var cx = world_size / 2;
  var cy = world_size / 2;
  draw_basic_gear(cx, cy, planetary_gear.sun);
  ctx.beginPath();
  ctx.arc(world_size / 2 * draw_scaling_factor, world_size / 2 * draw_scaling_factor, planetary_gear.sun.hub_diameter * draw_scaling_factor, -planetary_gear.sun.position, -planetary_gear.sun.position + 2 * PI, false);
  ctx.stroke();
  // Draw ring
  draw_basic_gear(cx, cy, planetary_gear.ring);
  outer_diameter = planetary_gear.ring.outer_diameter;
  ctx.beginPath();
  ctx.arc(cx * draw_scaling_factor, world_size * draw_scaling_factor - cy * draw_scaling_factor, outer_diameter / 2 * draw_scaling_factor, -planetary_gear.ring.position, -planetary_gear.ring.position + 2 * PI, false);
  ctx.stroke();
  // Draw planets
  for (var i = 0; i < planetary_gear.planets.length; i++) {
    cx = (cx + planetary_gear.carrier_pitch / 2 * Math.cos(planetary_gear.carrier_position + i * 2 * PI / planetary_gear.planets.length));
    cy = (cy + planetary_gear.carrier_pitch / 2 * Math.sin(planetary_gear.carrier_position + i * 2 * PI / planetary_gear.planets.length));
    draw_basic_gear(cx, cy, planetary_gear.planets[i]);
    ctx.beginPath();
    ctx.arc(cx * draw_scaling_factor, world_size * draw_scaling_factor - cy * draw_scaling_factor, planetary_gear.planets[i].hub_diameter * draw_scaling_factor, -planetary_gear.planets[i].position, -planetary_gear.planets[i].position + 2 * PI,
      false);
    ctx.stroke();
    cx = world_size / 2;
    cy = world_size / 2;
  }
}

function app_loop() {
  var time_elapsed = get_time() - start_time;
  planetary_gear.fixed_speed_update(time_elapsed);
  draw_basic_planetary_gear_set();
  window.requestAnimationFrame(app_loop);
}

function resize_canvas() {
  var viewport_width = $(window).width();
  var viewport_height = $(window).height();
  var canvas_size = Math.round(0.80 * Math.min(viewport_width, 0.85 * viewport_height));
  ctx.canvas.height = canvas_size;
  ctx.canvas.width = canvas_size;
  draw_size = Math.min(canvas.width, canvas.height);
  draw_scaling_factor = draw_size / world_size;
}

function randomise() {
  var gear_size_min = 15;
  var gear_size_max = 30;
  var planets_min = 1;
  var planets_max = 8;
  var gear_speed_max = 1.7;
  var gear_speed_min = -1.7;
  var sun_size = Math.round(Math.random() * (gear_size_max - gear_size_min) + gear_size_min);
  var planet_size = Math.round(Math.random() * (gear_size_max - gear_size_min) + gear_size_min);
  var number_of_planets = Math.round(Math.random() * (planets_max - planets_min) + planets_min);
  var ring_size = sun_size + 2 * planet_size;
  // Maximum allowable number of planet gears to prevent overcrowding
  var planets_max_allowable = (Math.PI) / (Math.asin((planet_size + 3) / (sun_size + planet_size)));
  // Randomise the angular velocities of the gear train components
  var speed_A = Math.random() * (gear_speed_max - gear_speed_min) + gear_speed_min;
  var speed_B = Math.random() * (gear_speed_max - gear_speed_min) + gear_speed_min;
  // Select one of the gear train components to be fixed on average half of the time
  if (Math.random() > 0.5) {
    if (Math.random() > 0.5) {
      speed_A = 0;
    } else {
      speed_B = 0;
    }
  }
  if (is_num_integer((sun_size + (sun_size + 2 * planet_size)) / number_of_planets) && planets_max_allowable > number_of_planets) {
    var random_variable = Math.random();
    if (random_variable < 0.033) {
      planetary_gear = new PlanetaryGear(1, sun_size, planet_size, 1, speed_A, speed_B, 0.032, number_of_planets);
      if ((planetary_gear.ring.gear_speed > gear_speed_max) || (planetary_gear.ring.gear_speed < gear_speed_min)) {
        randomise();
      }
    } else if (random_variable < 0.66) {
      planetary_gear = new PlanetaryGear(1, sun_size, planet_size, 2, speed_A, speed_B, 0.032, number_of_planets);
      if ((planetary_gear.carrier_speed > gear_speed_max) || (planetary_gear.carrier_speed < gear_speed_min)) {
        randomise();
      }
    } else {
      planetary_gear = new PlanetaryGear(1, sun_size, planet_size, 3, speed_A, speed_B, 0.032, number_of_planets);
      if ((planetary_gear.sun.gear_speed > gear_speed_max) || (planetary_gear.sun.gear_speed < gear_speed_min)) {
        randomise();
      }
    }
    world_size = planetary_gear.ring.outer_diameter * 1.05;
    draw_scaling_factor = draw_size / world_size;
    start_time = get_time();
  } else {
    randomise();
  }
}

$('#randomise').on('click', function(e) {
  randomise();
});

$(window).resize(function() {
  clearTimeout(debounce);
  debounce = setTimeout(function() {
    resize_canvas();
  }, 50);
});

$(document).ready(function() {
  resize_canvas();
  draw_basic_planetary_gear_set();
  start_time = get_time();
  window.requestAnimationFrame(app_loop);
});
