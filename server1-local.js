"use strict";

const app = require("./server/server1.js");

app.listen(process.env.PORT || 4242, () =>
  console.log(`Node server listening at http://localhost:${4242}!`)
);
