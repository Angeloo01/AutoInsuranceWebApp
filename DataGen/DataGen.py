#Creates an SQL file for populating the insurance database with random data
#ver 1: customer table

from sys import *
from random import *
import string

custCt = int(argv[1])
cities = []
provs = []
fnames = []
lnames = []
streets = []
customer = []
edomains = ["gmail.com", "outlook.com", "yahoo.ca", "me.com", "aol.com", "hotmail.com"]


with open("cities.txt", "r") as f:
	for line in f:
		data = line.strip().split(",")
		cities.append(data[0])
		provs.append(data[1])
		
with open("FNames.txt", "r") as f:
	for line in f:
		fnames.append(line.strip())
		
with open("LNames.txt", "r") as f:
	for line in f:
		lnames.append(line.strip().strip(","))
		
with open("streets.txt", "r") as f:
	for line in f:
		streets.append(line.strip().split(". ")[1])
		
for cust in range(custCt):
	newEntry = []
	nameSex = randint(0, 1)
	newEntry.append(choice(fnames[1000*nameSex:1000 + 1000*nameSex]))
	newEntry.append(choice(fnames[1000*nameSex:1000 + 1000*nameSex]))
	newEntry.append(choice(lnames))
	cityNo = randint(0, custCt)
	newEntry.append(str(randint(1, 9999)) + " " + choice(streets) + ", " + cities[cityNo])
	newEntry.append(provs[cityNo])
	newEntry.append("Canada")
	newEntry.append(str(randint(0, 999)).rjust(3, "0") + "-" + str(randint(0, 999)).rjust(3, "0") + "-" + str(randint(0, 9999)).rjust(4, "0"))
	newEntry.append((newEntry[0][0] + newEntry[1][0] + newEntry[2]).lower() + str(randint(1, 9999)) + "@" + choice(edomains))
	newEntry.append(["M", "F"][nameSex])
	newEntry.append(str(randint(1950, 2006)) + "-" + str(randint(1, 12)) + "-" + str(randint(1, 28)))
	letters = string.ascii_letters
	newEntry.append("".join(choice(letters) for i in range(20)))
	newEntry.append(randint(1, 99999))
	newEntry.append(randint(1, 999))
	newEntry.append(randint(1, 99999999999))
	
	customer.append(newEntry)
	
f = open("data.sql", "w")
for cust in customer:
	line = "INSERT INTO customer (Fname, MName, LName, Addr_Line, Province, Country, Phone_No, Email, Sex, Birth_Date, Password, Transit_No, Institute_No, Acct_No) VALUES ("
	for field in cust:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
f.close()
	

