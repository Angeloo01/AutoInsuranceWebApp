# AutoInsuranceWebApp
The API directory is set up for coding. Add all the endpoints in the index.js file.

do res.json() to return results in JSON format from the MySQL database, this will make it easier to work with the data.

To run the API:
1. Install node.js
2. Navigate to the API directory, and do "npm install" in the terminal. This should install the express and mysql versions listed in package.json
3. Run the API with "node index.js"
4. If you want to run the API so that your saved changes update immediately without re-typing node index.js, do "npm install -g nodemon", this will install nodemon globally, and you can run your app with "nodemon index.js" Instead.
5. Change the user and password in index.js to your own mysql username and password. You may need to go to file->open SQL script and open the autoinsurance.sql file in workbench to actually use it. If that doesn't work, run this command in workbench: "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';" and replace the password value in index.js with the "password".
