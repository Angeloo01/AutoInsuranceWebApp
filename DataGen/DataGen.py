#Creates an SQL file for populating the insurance database with random data
#ver 1: customer table
#WARNING: Intended for an empty database, assumes autoincrement ids from 0

from sys import *
from random import *
import string
import datetime

try:
	custCt = int(argv[1])
except:
	print("One positive integer command line argument needs to be provided for the desired customer count")
	quit()
	
sampleNotes = []
	
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
		
with open("artwar.txt", "r") as f:
	section = []
	par = ""
	for line in f:
		if (line.isspace()):
			if (len(par) == 0):
				continue
			else:
				section.append(par)
				par = ""
		elif (line[0] == "?" and len(section) != 0):
			sampleNotes.append(section)
			section = []
		else:
			par += line.partition(" ")[2]
		
f = open("data.sql", "w")
		
#***MANAGER***
manager.append(["mohamedyassin1", "root"])
manager.append(["Angeloo01", "root"])
manager.append(["aghiles5", "root"])
		
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
	
#***POLICY***

for i in range(custCt):
	polCt = int(uniform(1, 2.2))
	
	for j in range(polCt):
		newEntry = []
		
		newEntry.append(choice([250, 500, 1000]))
		newEntry.append(str(randint(int(customer[i][9][0:4]) + 15, 2021)) + "-" + str(randint(1, 12)) + "-" + str(randint(1, 28)))
		newEntry.append(choices(["ACTIVE", "CANCELLED", "LAPSED"], weights=[0.9, 0.05, 0.05])[0])
		newEntry.append("null")
		newEntry.append(i + 1)
		
		policy.append(newEntry)
		
#***CLAIM***

for i in range(randint(0, int(custCt * 0.3))):
	newEntry = []
	
	newEntry.append(str(randint(2012, 2021)) + "-" + str(randint(1, 12)) + "-" + str(randint(1, 28)))
	newEntry.append(choices(["PENDING", "ACCEPTED", "DENIED"], weights=[0.8, 0.15, 0.05])[0])
	newEntry.append(choice(["COLL", "H&R", "PILEUP", "ANIMAL", "WEATHER", "VAND", "FIRE", "OBJECT"]))
	if randint(0, 1):
		location = choice(provs) + " Highway"
	else:
		cityNo = randint(0, len(cities) - 1)
		location = cities[cityNo] + ", " + provs[cityNo]
	newEntry.append(location)
	
	claim.append(newEntry)
	
#***RELATED_TO***
for i in range(len(claim)):
	newEntry = []
	
	newEntry.append(randint(1, len(policy)))
	newEntry.append(i + 1)
	
	related_to.append(newEntry)
	
#***PAYMENT***
for i in range(len(policy)):
	payCt = randint(2, 8)
	
	for j in range(payCt):
		newEntry = []
		
		newEntry.append(i + 1)
		newEntry.append(randint(1000000, 2000000000))
		newEntry.append(randint(500, 10000))
		newEntry.append(str(randint(int(policy[i][1][0:4]), 2021)) + "-" + str(randint(1, 12)) + "-" + str(randint(1, 28)))
		
		payment.append(newEntry)
	
#***DRIVER***
for i in range(len(policy) + len(claim)):
	if (i < len(policy)):
		drvCt = randint(1, 5)
		custNo = policy[i][4]
		licProv = customer[custNo - 1][4]
		for dr in range(0, drvCt):
			licNo = (str(randint(0, 999999)).rjust(3, "0") + "-" + str(randint(0, 999)).rjust(3, "0"))
			training = choice(["Y", "N"])
			grid_rating = randint(-15, 15)
			license_class = randint(3, 5)
			LName = customer[custNo - 1][2]
			if (dr == 0):
				bd = customer[custNo -1][9]
				year, month, day = bd.split("-")
				licDate = str(int(year) + 16) + "-" + month + "-" + day
				FName = customer[custNo -1][0]
				MName = customer[custNo -1][1]
				sex = customer[custNo -1][8]
				relation = "SELF"
				
			else:
				year = randint(1950, 2006)
				month = str(randint(1, 12))
				day = str(randint(1, 28))
				bd = str(year) + "-" + month + "-" + day
				licDate = str(year + 16) + "-" + month + "-" + day
				
				nameSex = randint(0, 1)
				FName = choice(fnames[1000*nameSex:1000 + 1000*nameSex])
				MName = choice(fnames[1000*nameSex:1000 + 1000*nameSex])
				sex = ["M", "F"][nameSex]
				relation = choice(["PARENT", "SIBLING", "SPOUSE", "CHILD", "OTHER"])
				
			newEntry = [licDate, licNo, licProv, FName, MName, LName, training, sex, bd, grid_rating, license_class]
			newEntryRel = [licDate, licNo, licProv, i + 1, relation]
			driver.append(newEntry)
			driver_for.append(newEntryRel)
			
	if (i >= len(policy)):
		clmNo = i - len(policy)
		clmType = claim[clmNo][2]
		
		faultPled = False
		if (clmType == "COLL"):
			drvCt = 1
		elif (clmType == "PILEUP"):
			drvCt = randint(2, 4)
		else:
			continue
			
		for dr in range(0, drvCt):
			year = randint(1950, 2006)
			month = str(randint(1, 12))
			day = str(randint(1, 28))
			bd = str(year) + "-" + month + "-" + day
			licDate = str(year + 16) + "-" + month + "-" + day
			licNo = (str(randint(0, 999999)).rjust(3, "0") + "-" + str(randint(0, 999)).rjust(3, "0"))
			licProv = choice(provs)
			nameSex = randint(0, 1)
			FName = choice(fnames[1000*nameSex:1000 + 1000*nameSex])
			MName = choice(fnames[1000*nameSex:1000 + 1000*nameSex])
			LNmae = choice(lnames)
			sex = ["M", "F"][nameSex]
			training = choice(["Y", "N"])
			grid_rating = randint(-15, 15)
			license_class = randint(3, 5)
			
			fault = choice([0, 50, 100])
			if ((fault == 100) and not faultPled):
				faultPled = True
			elif ((fault == 100) and faultPled):
				fault = 50
			
			newEntry = [licDate, licNo, licProv, FName, MName, LName, training, sex, bd, grid_rating, license_class]
			newEntryIID = [licDate, licNo, licProv, "T", fault, clmNo + 1]
			driver.append(newEntry)
			involved_in_driver.append(newEntryIID)
			
#***Conviction***	
for i in range(len(driver)):
	conChance = randint(1, 7)
	if conChance != 7:
		continue
		
	conCt = randint(1, 8)
	
	for con in range(conCt):
		newEntry = []
		
		licDate = driver[i][0]
		newEntry.append(licDate)
		newEntry.append(driver[i][1])
		newEntry.append(driver[i][2])
		licYear = int(licDate[0:4])
		if licYear < 2021:
			year = randint(licYear + 1 , 2021)
		else:
			continue
		newEntry.append(str(year) + "-" + str(randint(1, 12)) + "-" + str(randint(1, 28)))
		newEntry.append(randint(1, 3))
		
		conviction.append(newEntry)
		
#***Note***
for i in range(len(policy)):
	noteCt = randint(1, 8)
	rawDate = policy[i][1].split("-")
	lastDate = datetime.date(int(rawDate[0]), int(rawDate[1]), int(rawDate[2]))
	thisOne = datetime.date.today()
	for j in range(noteCt):
		newEntry = []
		
		newEntry.append(i + 1)
		
		section = randint(0, len(sampleNotes) - 1)
		par = randint(0, len(sampleNotes[section]) - 1)
		
		newEntry.append(str(section + 1) + ". " + str(par + 1) + ".")
		
		rawDist = thisOne - lastDate
		dayDist = rawDist.days
		randDay = randrange(dayDist)
		newDate = lastDate + datetime.timedelta(days = randDay)
		if (newDate == lastDate):
			continue;
		lastDate = newDate
		
		newEntry.append(newDate)
		newEntry.append(sampleNotes[section][par])
		newEntry.append(randint(1, 3))

		note.append(newEntry)
	

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
	
for pol in policy:
	line = "INSERT INTO policy (Deductible, EffectiveDate, Status, Premium, CustomerNo) VALUES ("
	for field in pol:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for clm in claim:
	line = "INSERT INTO claim (Accident_Date, Status, Type, location) VALUES ("
	for field in clm:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for rel in related_to:
	line = "INSERT INTO related_to (PolicyNo, ClaimID) VALUES ("
	for field in rel:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for pay in payment:
	line = "INSERT INTO payment (PolicyNo, TransactionID, Amount, Date) VALUES ("
	for field in pay:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for dr in driver:
	line = "INSERT INTO driver (License_Date, License_No, License_Prov, FName, MName, LName, Training, Sex, Birth_Date, Grid_Rating, License_Class) VALUES ("
	for field in dr:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for dr in driver_for:
	line = "INSERT INTO driver_for (License_Date, License_No, License_Prov, PolicyNo, Relationship) VALUES ("
	for field in dr:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for dr in involved_in_driver:
	line = "INSERT INTO involved_in_driver (License_Date, License_No, License_Prov, F_T_Party, Percent_At_Fault, ClaimID) VALUES ("
	for field in dr:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")

for con in conviction:
	line = "INSERT INTO conviction (License_Date, License_No, License_Prov, Date, Degree) VALUES ("
	for field in con:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
for nute in note:
	line = "INSERT INTO note (PolicyNo, Note_Title, Date, Text, ManagerID) VALUES ("
	for field in nute:
		line += "\'" + str(field) + "\', "
	f.write(line[0:-2] + ");\n")
	
f.close()
	

