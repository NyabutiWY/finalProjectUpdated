# Kiambu Suitability App

The Kiambu Suitability App helps you determine the suitability of different sublocations in Kiambu for growing basil. This application uses geolocation to find your current location and provides information on the suitability of the sublocation for basil farming.

## Features

- **Geolocation:** Automatically find and display your current location on the map.
- **Search Functionality:** Search for sublocations and display their suitability.
- **Interactive Map:** View the map with highlighted boundaries and suitability information.
- **Suitability Ratings:** Provides ratings from 'Unsuitable' to 'Highly suitable' based on different criteria.

## How It Works

1. **Geolocation:** The app uses the browser's geolocation API to get the user's current position.
2. **Suitability Calculation:** Based on the user's coordinates, the app identifies the sublocation and retrieves its suitability score.
3. **Map Display:** The map shows the user's location, highlights the identified sublocation, and displays the suitability rating.

## Technologies Used

- **HTML** for the structure of the web page.
- **CSS** for styling the web page.
- **JavaScript** for implementing the interactive features and geolocation functionality.
- **Leaflet.js** for rendering the map.
- **Turf.js** for geospatial calculations and handling geographical data.
