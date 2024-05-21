import { createServer } from "./server";

const server = createServer();

server.listen(4001, () => {
  console.log("api running on port 4001");
});
