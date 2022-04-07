#Creates an SQL file for populating the insurance database with random data
#ver 1: customer table
#WARNING: Intedned for an empty database, assumes autoincrement ids from 0

from sys import *
from random import *
import string

try:
	custCt = int(argv[1])
except:
	print("One positive integer command line argument needs to be provided for the desired customer count")
	quit()
	
cities = []
provs = []
fnames = []
lnames = []
streets = []
edomains = ["gmail.com", "outlook.com", "yahoo.ca", "me.com", "aol.com", "hotmail.com"]

manager = [] #No Foreign
customer = [] #No Foreign
claim = [] #No Foreign
policy = []
payment = []
driver = [] #No Foreign, should make customers themselves drivers
vehicle = [] #No Foreign, considerations for subclasses
driver_for = []
conviction = []
drives = []
endorsement = []
motorcycle = []
motorhome = []
snow_atv_moped = []
accessory = []
involved_in_vehicle = []
note = []
reviews = []
related_to = []
involved_in_driver = []

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
		
f = open("data.sql", "w")
		
#***MANAGER***

for i in range(randint(1, 1 + int(custCt * 0.01)):
	newEntry = []
	
	newEntry.append((choice(fnames) + choice(lnames)).lower() + randint(0, 999999))
	newEntry.append("".join(choice(string.ascii_letters) for i in range(20)))
	
	manager.append(newEntry)
		
#***CUSTOMER***
		
for i in range(custCt):
	newEntry = []
	
	nameSex = randint(0, 1)
	newEntry.append(choice(fnames[1000*nameSex:1000 + 1000*nameSex]))
	newEntry.append(choice(fnames[1000*nameSex:1000 + 1000*nameSex]))
	newEntry.append(choice(lnames))
	cityNo = randint(0, len(cities) - 1)
	newEntry.append(str(randint(1, 9999)) + " " + choice(streets) + ", " + cities[cityNo])
	newEntry.append(provs[cityNo])
	newEntry.append("Canada")
	newEntry.append(str(randint(0, 999)).rjust(3, "0") + "-" + str(randint(0, 999)).rjust(3, "0") + "-" + str(randint(0, 9999)).rjust(4, "0"))
	newEntry.append((newEntry[0][0] + newEntry[1][0] + newEntry[2]).lower() + str(randint(1, 9999)) + "@" + choice(edomains))
	newEntry.append(["M", "F"][nameSex])
	newEntry.append(str(randint(1950, 2006)) + "-" + str(randint(1, 12)) + "-" + str(randint(1, 28)))
	newEntry.append("".join(choice(string.ascii_letters) for i in range(20)))
	newEntry.append(randint(1, 99999))
	newEntry.append(randint(1, 999))
	newEntry.append(randint(1, 99999999999))
	
	customer.append(newEntry)
	
#***CLAIM***

for i in range(randint(0, int(custCt * 0.3))):
	newEntry = []
	
	newEntry.append(str(randint(2012, 2021)) + "-" + str(randint(1, 12)) + "-" + str(randint(1, 28)))
	newEntry.append(choice(["PENDING", "ACCEPTED", "DENIED"]))
	newEntry.append(choice(["2PARTYCOLL", "H&R", "PILEUP", "ANIMAL", "WEATHER", "VAND", "FIRE", "OBJECT"]))
	if randint(0, 1):
		location = choice(provs) + " Highway"
	else
		cityNo = randint(0, len(cities) - 1)
		location = cities[cityNo] + ", " + provs[cityNo]
	newEntry.append(location)
	
	claim.append(newEntry)
	
#***POLICY***

for i in range(custCt):
	newEntry = []
	
	polCt = int(uniform(1, 2.2)
	
	for j in range(polCt):
		newEntry.append(choice([250, 500, 1000]))
		newEntry.append(str(randint(int(customer[i][9][0:4]) + 15, 2021)) + "-" + str(randint(1, 12)) + "-" + str(randint(1, 28)))
		newEntry.append(choice(["ACTIVE", "CANCELLED", "LAPSED"]))
		newEntry.append("null")
		newEntry.append(i + 1)
	
	policy.append(newEntry)
	
#***PAYMENT***
for i in range(len(policy)):
	newEntry = []
	
	payCt = randint(2, 8)
	
	for j in range(payCt):
		
	
	payment.append(newEntry)

for mang in manager:
	line = "INSERT INTO manager (Username, Password) VALUES ("
	for field in mang:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for cust in customer:
	line = "INSERT INTO customer (Fname, MName, LName, Addr_Line, Province, Country, Phone_No, Email, Sex, Birth_Date, Password, Transit_No, Institute_No, Acct_No) VALUES ("
	for field in cust:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for clm in claim:
	line = "INSERT INTO claim (Accident_Date, Status, Type, location) VALUES ("
	for field in clm:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for pol in policy:
	line = "INSERT INTO claim (Deductible, EffectiveDate, Status, Premium, CustomerNo) VALUES ("
	for field in pol:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
f.close()
	

