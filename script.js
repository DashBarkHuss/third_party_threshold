function loadJSON(callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", "./results.json", true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(JSON.parse(xobj.responseText));
    }
  };
  xobj.send(null);
}
let results;
loadJSON(function (json) {
  results = json; // this will log out the json object
});

fetch("https://unpkg.com/us-atlas/states-10m.json")
  .then((r) => r.json())
  .then((us) => {
    const nation = ChartGeo.topojson.feature(us, us.objects.nation).features[0];
    const states = ChartGeo.topojson.feature(us, us.objects.states).features;
    states.splice(44, 3);
    states.splice(46, 2);
    const numbers = results.map((x) => parseFloat(x.vp5toVp));
    numbers.splice(0, 2);
    const max = Math.max(...numbers);

    const chart = new Chart(
      document.getElementById("canvas").getContext("2d"),
      {
        type: "choropleth",
        data: {
          labels: states.map((d) => d.properties.name),
          datasets: [
            {
              label:
                "How Much A 3rd Party Vote Has An Effect by State Compared to A Major Party Vote",
              outline: nation,
              data: states.map((d, i) => {
                const stateName = d.properties.name;
                const result = results.find((x) => x.state == stateName);
                return {
                  feature: d,
                  value: result.vp5toVp / max,
                };
              }),
            },
          ],
        },

        options: {
          legend: {
            display: true,
          },

          scale: {
            projection: "albersUsa",
          },

          geo: {
            colorScale: {
              display: true,
              position: "bottom",
              quantize: 15,
              legend: {
                position: "bottom-right",
              },
            },
          },
        },
      }
    );

    chart.chart.config.data.datasets[0].data.forEach((x) => {
      const result = results.find((r) => r.state == x.feature.properties.name);
      x.value = `Your vote counts ${Math.round(
        result.vp5toVp
      )} times more when you vote for a 3rd party than when you vote for the presidential outcome.`;
    });
  });
