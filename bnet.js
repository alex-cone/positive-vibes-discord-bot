const creds = require("./credentials.js");
const blizzard = require("blizzard.js").initialize({
  origin: "us",
  locale: "en_US",
  key: creds.blizzKey,
  secret: creds.blizzSecret
});

const getAvatar = () => {
  blizzard
    .getApplicationToken(["profile"], {
      origin: "us",
      key: "7612ac0d3415424299217980dc49dacb",
      secret: "yRmNduMSbERsvlBePPLKPgm1IsAdHrcY"
    })
    .then(response => {
      blizzard.defaults.token = response.data.access_token;
      return blizzard.wow
        .guild(["members"], {
          realm: "Kil'jaeden",
          name: "Chicken Dinner"
        })
        .then(response => {
          console.log(response.data.members); 
        });
    });
};
