# Patient Cost Transparency Client
This project provides a web application that is capable of generating GFE request and displaying the GFE response. In addition, it provides a functionality to allow the client to send the inquiry request for Advance EOB and displays the response from the payer server.  This project is written in JavaScript and runs in [node.js](https://nodejs.org/en/).  

## Running the PCT client locally
1. Install node.js
2. Clone the repository
  * `git clone https://github.com/HL7-DaVinci/pct-client/`
3. Install the dependencies
  * `npm install`
4. Run the application
  * `npm start`
5. The web application is running on http://localhost:3000

## Running within Docker container
1. Install [Docker](https://docs.docker.com/get-docker/)
2. Build pct-client image
   From command line:
    * `docker build -t pct-client .`
   It can also be built from Docker desktop Dashboard
3. Run pct-client within Docker
   From command line:
   * `docker run -p 80:80 pct-client`
   It can also be run from Docker desktop Dashboard
4. The web application is running on http://localhost

## Testing pointing to different servers
By default, the client is pointing to the provider's data server and the payer's GFE server hosted on Logica server. 
To point the client to different servers, go to "Settings" and update the settings. 