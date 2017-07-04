# Planetary Gears

A Javascript library for modelling [Planetary (Epicyclic) Gear Trains](https://en.wikipedia.org/wiki/Epicyclic_gearing) for animation purposes.

[Link ](https://tommccracken.github.io/PlanetaryGears/) to demonstration.

## About

NOTE: THIS IS A RELATIVELY NEW PROJECT AND AS SUCH IS A WORK IN PROGRESS.

This project is aimed at developing a Javascript library to model simple [Planetary (Epicyclic) Gear Trains](https://en.wikipedia.org/wiki/Epicyclic_gearing) for animation purposes. In particular the library supports modeling the positions and velocities of planetary gear trains comprising one inner "sun" gear, one outer "ring" gear and one or more central "planet" gears (within a carrier).

The library, including this demonstration/documentation web page, is hosted on GitHub and licensed under the permissive open source Apache 2.0 License. The key project files, located within the GitHub repository, are as follows:

- /lib/PlanetaryGearModel.js -
  This is the library file that is used to model the planetary gear train. This library makes use of some ECMA2015 features including the "class" and "let" keywords.

- /dist/PlanetaryGearModel.ES5.min.js -
  This is a transpiled (ES5), and minified, version of the above mentioned library.

The project demonstration/documentation web page is located within the repository /docs/ folder. In this demonstration, a planetary gear train is modeled and animated using an HTML5 canvas element.

## Usage

### Instantiation

To create an instance of a planetary gear model within an application, the constructor can be called as follows.

```javascript
var planetary_gear = new PlanetaryGear (size_input_mode,
                                        size_A,
                                        size_B,
                                        speed_input_mode,
                                        speed_A,
                                        speed_B,
                                        tooth_pitch,
                                        number_of_planets);
```


  The following is an explanation of the constructor parameters:

  - **size_input_mode** - An integer value of 1, 2 or 3.

    A value of 1 means that the sun and planet sizes will be input as size_A and size_B respectively and the ring size will be calculated.

    A value of 2 means that the sun and ring sizes will be input as size_A and size_B respectively and the planet size will be calculated.

    A value of 3 means that the planet and ring sizes will be input as size_A and size_B respectively and the sun size will be calculated.

  - **size_A** - The gear size (the number of gear teeth). An integer value.

  - **size_B** - The gear size (the number of gear teeth). An integer value.

  - **speed_input_mode** - An integer value of 1, 2 or 3.

    A value of 1 means that the sun and carrier speeds will be input as speed_A and speed_B respectively and the ring speed, and planet speed(s), will be calculated.

    A value of 2 means that the sun and ring speeds will be input as speed_A and speed_B respectively and the carrier speed, and planet speed(s), will be calculated.

    A value of 3 means that the carrier and ring speeds will be input as speed_A and speed_B respectively and the sun speed, and planet speed(s), will be calculated.

  - **speed_A** - The gear angular speed in rad/s.

  - **speed_B** - The gear angular speed in rad/s.

  - **tooth_pitch** - The gear tooth pitch in m.

  - **number_of_planets** - The quantity of planet gears. An integer value.

### Updating positions

The following method can be called to update the positions of the components within a planetary gear model.

  ```javascript
    planetary_gear.fixed_speed_update(elapsed_time);
  ```

This will update the positions of the components within the overall model based on the total time that has elapsed since starting the simulation. The parameter "elapsed_time" needs to be passed to the method. This assumes that the modeled components travel at a fixed speed.

### Animation

Whilst animation of planetary gear trains is not the primary purpose of this project, the index.html file demonstrates how various model parameters can be accessed in order for an application to animate the planetary gear train.
Whilst animation of planetary gear trains is not the primary purpose of this library, the demonstration/documentation web page demonstrates how various model parameters can be accessed in order for an application to animate the modeled planetary gear train.

Note: The animation example in the demonstration/documentation web page does not accurately model gears using involute profiles; it only approximates the shape of a gear tooth with a simple trapezium profile.

## Theory

The library uses the following equations to solve for the unknown size and speed variables based on the known variables and the particular size and speed input modes that have been selected.

With regard to the following equations, the variables Ws, Wp, Wc and Wr represent the angular velocities of the sun gear, planet gear(s)
, carrier, and ring gear respectively and the variables Ns, Np and Nr represent the sizes (numbers of teeth) of the sun gear, planet gear(s)
and ring gear respectively.

### Size calculations:

- **Nr = Ns + 2Np** (Equation 1) - This is a geometric constraint based on the fact that the size of the ring gear must be equal to the size of the sun gear plus twice the size of the planet gear(s).

### Speed calculations:

- **NsWs + NpWp - (Ns + Np)Wc = 0** (Equation 2) - This is a velocity constraint that requires the tangential velocity between the sun gear and a planet gear, at the point of contact, to be equal.

- **NrWr - NpWp - (Nr - Np)Wc = 0** (Equation 3) - This is a velocity constraint that requires the tangential velocity between the ring gear and a planet gear, at the point of contact, to be equal.

- **NsWs + NrWr = (Ns+Nr)Wc** (Equation 4) - This can be derived from Equations 2 and 3 and relates the size of the sun gear, ring gear and carrier.

[Link to source repository](https://github.com/tommccracken/PlanetaryGears)

Copyright 2017 Thomas O. McCracken  
