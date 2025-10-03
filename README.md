# Will It Rain On My Parade? 🌦️

**2025 NASA Space Apps Challenge – Intermediate Level**

Welcome to the official repository of our project for the NASA Space Apps Challenge 2025. Our goal is to develop an application that allows users to know the probability of extreme or uncomfortable weather conditions for a specific location and date, based on historical Earth observation data provided by NASA. With additional fun features to complement this application.

---

## 🔹 Project Description

If you’re planning an outdoor event — such as a hike, a walk, fishing, or a picnic — knowing the chances of bad weather can be crucial. Our project uses NASA’s historical data to inform users about the probability of conditions such as:

- Very hot
- Very cold
- Very windy
- Very humid/rainy
- Generally uncomfortable

The application is not a weather forecast, but rather a tool based on historical data that enables users to make more informed planning decisions.

---

## 🔹 Objectives

- Build an **interactive and personalized dashboard** where users can select:

  - Location (by name, pin on map, or drawn boundaries)
  - Day of the year or date range

- Display the probability of extreme weather conditions using charts and maps.
- Provide **data download options** in CSV or JSON formats, with metadata and links to NASA sources.
- Present the information in an accessible and visual way, including:

  - Probability curves
  - Time series data
  - Interactive maps

---

## 🔹 Data and Resources

- NASA historical Earth observation data: rainfall, wind speed, temperature, snow, dust, cloud cover, extreme temperature indices, among others.
- NASA models to calculate probabilities of extreme weather conditions.
- Visualization and data analysis tools to clearly and understandably present results.

**Useful Links:**

- [NASA Earth Observation Data](https://earthdata.nasa.gov/)
- [Space Apps Challenge Resources](https://2025.spaceappschallenge.org/)

---

## 🔹 Project Features

- Location selection by:

  - City name
  - Pin on interactive map
  - Drawing boundaries on map

- Visualization of weather event probabilities:

  - Bar or line charts
  - Heatmaps by location
  - Simple explanatory texts

- Download of relevant data according to user query:

  - CSV and JSON formats
  - Includes units and sources

- Customizable dashboard according to user preferences

---

## 🔹 Technologies

- **Frontend:** React, Leaflet.js (maps), Chart.js / D3.js (visualization)
- **Backend:** Python, Flask / FastAPI (data and processing API)
- **Data:** NASA Earth Observation datasets, NASA APIs

---

## 🔹 Considerations

- Carefully select the variables displayed to avoid overwhelming the user.
- Prioritize data relevant to outdoor activities.
- Ensure information is presented in a visual and intuitive way.
- Possibility to expand the app to new variables or regions in the future.

---

## 🔹 Team

- Marcos Mesa
- Raúl Martín
- Cristian Gil
- Rubén Morales

---

## 🔹 Project Status

- [ ] Data collection
- [ ] Data processing and analysis
- [ ] Backend development
- [ ] Frontend development
- [ ] Integration and testing
- [ ] Documentation and deployment

---

## 🔹 License

This project is under the MIT license.
