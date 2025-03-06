const http = require("http");
const { hostname } = require("os");

const port = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hello, ZeroSploit</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(-45deg, #8360c3, #2ebf91, #1FA2FF, #12D8FA);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            color: #fff;
          }
          @keyframes gradientBG {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          h1 {
            font-size: 3rem;
          }
        </style>
      </head>
      <body>
        <h1>Hello, ZeroSploit</h1>
      </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log(`Server running on http://${hostname}:${port}`);
});

