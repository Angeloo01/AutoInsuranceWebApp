Description
-----------

The DataGen python script produces a .sql file containing a serious of SQL statements that, when imported to MySQL database initialized to teh autoinsurance.sql file in the API folder, will populate it with dyanmically generated, semi-realistic data for the purposes of testing and demonstration.

How to Use
----------

As this is a python program it requies an installation python, preferably v3 as this was tested on v3.10.4. On a command line in this directory, the program is started with the following structure:

	py DataGen.py <# of customers>

Where <> represents an integer value that is the number of SQL statements for creating customer tuples it will generate. The number of other tuples that are generated is created dynamically sometimes with more (vehicles, notes) or less (claims). A number from 50-200 is recommended for a reasonable spread of users and a file small enough that it can still be processed by a program like phpMyAdmin. The number managers is always 3 for the group memebers of this project with their known usernames (mohamedyassin1, Angeloo01, aghiles5) and the password 'root'. The credentials for customers are completely random and would need to be found directly from the database for use.

After the program has run it will produce a file called 'data.sql' containing the statements. Using the phpMyAdmin tool included in the AppServ package where the project is run, this file can be imported to a EMPTY database defined by API/autosinsurance.sql. It must be empty as this database auto increments some primary keys and the data generator assumes it is starting these at the default 1.