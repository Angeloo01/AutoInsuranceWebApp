# AutoInsuranceWebApp
Welcome to our readme for the CPSC471 final project. We are group 7: Mohamed Yassin, Angelo Gonzales, Adam Hiles.

We have 3 directories: API,DataGen,Dummy Website, WebInterface.

To run the API:
1. Install node.js
2. Navigate to the API directory, and do "npm install" in the terminal. This should install the express and mysql versions listed in package.json
3. Run the API with "node index.js"
4. If you want to run the API so that your saved changes update immediately without re-typing node index.js, do "npm install -g nodemon", this will install nodemon globally, and you can run your app with "nodemon index.js" Instead.
5. Change the user and password in index.js to your own mysql username and password. You may need to go to file->open SQL script and open the autoinsurance.sql file in workbench to actually use it. If that doesn't work, run this command in workbench: "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';" and replace the password value in index.js with the "password".

To run the web interface (the website used to access the api):
1. First make sure the API is running on localhost.
2. Navigate to the WebInterface directory, and run the "npm install" command in the terminal. This should install all the dependencies needed.
3. Run the interface with "node server.js".
4. Open localhost:8080 on Chrome and start exploring the web app.

To Generate lots of Data for the MySQL database so you can test it. Read the readme in DataGen.
