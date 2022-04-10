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
insd_under = []

truck = ["2F4", 1990, 2022, "Ford", "F150", 1500]
civic = ["2HJ", 1990, 2022, "Honda", "Civic", 1500]
rover = ["SAD", 2021, 2022, "Ranger Rover", "L460", 2400]
sprint = ["WMX", 1995, 2022, "Mercedes-Benz", "Sprinter", 1600]
imprez = ["JF1", 1992, 2022, "Subaru", "Impreza", 1200]
focus = ["MNA", 1998, 2022, "Ford", "Focus", 1200]
corol = ["2T1", 1991, 2022, "Toyota", "Corolla", 1300]
camaro = ["1GC", 2009, 2022, "Chevrolet", "Camaro", 2300]
veyron = ["VF9", 2005, 2011, "Bugatti", "Veyron", 50000]

sampleVeh = [truck, civic, rover, sprint, imprez, focus, corol, camaro, veyron]

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

#***REVIEWS***
for i in range(len(claim)):
	newEntry = []
	
	newEntry.append(i + 1)
	newEntry.append(randint(1, 3))
	
	reviews.append(newEntry)
	
	
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
		elif (clmType != "H&R"):
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
			elif (clmType == "H&R"):
				fault = 100
			
			newEntry = [licDate, licNo, licProv, FName, MName, LName, training, sex, bd, grid_rating, license_class]
			newEntryIID = [licDate, licNo, licProv, "Third", fault, clmNo + 1]
			driver.append(newEntry)
			involved_in_driver.append(newEntryIID)
			
#***VEHICLE***
for i in range(len(involved_in_driver) + len(policy)):
	if i < len(involved_in_driver):
		vehCt = 1
	else:
		vehCt = choices([1, 2, 3], weights=[0.4, 0.35, 0.25])[0]
	for j in range(vehCt):
		newEntry, newEntryIU, newEntryIIV = [], [], []
		
		vehInfo = choices(sampleVeh, weights=[0.15, 0.15, 0.06, 0.15, 0.15, 0.15, 0.15, 0.039999, 0.000001])[0]
		
		newVIN = 0
		vinTaken = True
		while vinTaken:
			vinTaken = False
			newVIN = (vehInfo[0] + "".join(hex(randint(0, 15)).lstrip("0x") for j in range(14))).upper()
			for veh in vehicle:
				if (newVIN == veh[0]):
					vinTaken = True
					
		newEntryIU.append(newVIN)	
		newEntryIU.append(i - len(involved_in_driver) + 1)	
		newEntryIIV.append(newVIN)
			
		newEntry.append(newVIN)
		newEntry.append(randint(vehInfo[1], vehInfo[2]))
		newEntry.append(vehInfo[3])
		newEntry.append(vehInfo[4])
		newEntry.append(choices(["Personal", "Business"], weights=[0.7, 0.3])[0])
		newEntry.append(randint(10000, 20000))
		newEntry.append(choices(["Owned", "Leased"], weights=[0.8, 0.2])[0])
		newEntry.append(randint(0, 8))
		
		if i < len(involved_in_driver):
			newEntryIIV.append(involved_in_driver[i][5])
		else:
			insd_under.append(newEntryIU)
		vehicle.append(newEntry)
			
#***DRIVES***
for i in range(len(insd_under)):
	posDrivers = []
	
	pol = insd_under[i][1]
	for person in driver_for:
		if person[3] == pol:
			posDrivers.append(person)
			
	drCt = randint(1, len(posDrivers))
	for j in range(drCt):
		newEntry = []
		
		dri = choice(posDrivers)
		posDrivers.remove(dri)
		
		newEntry.append(dri[0])
		newEntry.append(dri[1])
		newEntry.append(dri[2])
		newEntry.append(insd_under[i][0])
		if j == 0:
			newEntry.append("Primary")
		else:
			newEntry.append("Occasional")
	
		drives.append(newEntry)

#***INVOLVED IN VEHICLE***
for i in range(len(related_to)):
	newEntry, posVeh = [], []
	
	pol = related_to[i][0]
	for veh in insd_under:
		if veh[1] == pol:
			posVeh.append(veh)
			
	clmVeh = choice(posVeh)
	
	newEntry.append(veh[0])
	newEntry.append(related_to[i][1])
	
	involved_in_vehicle.append(newEntry)
			
#***INVOLVED IN DRIVER***
for i in range(len(related_to)):
	newEntry, posDrivers = [], []

	clm = related_to[i][1]
	clmType = claim[clm - 1][2]
	if (clmType not in ["COLL", "PILEUP", "ANIMAL", "OBJECT"]):
		continue
	
	for veh in involved_in_vehicle:
		if veh[1] == clm:
			clmVehVIN = veh[0]
			
	for rel in drives:
		if rel[3] == clmVehVIN:
			posDrivers.append([rel[0], rel[1], rel[2]])
	
	invDriver = choice(posDrivers)
	
	newEntry.append(invDriver[0])
	newEntry.append(invDriver[1])
	newEntry.append(invDriver[2])
	newEntry.append("First")
	
	fault = 100
	faultPled = True
	for drv in involved_in_driver:
		if ((drv[5] == clm) and (drv[4] == 100)):
			faultPled = False
	
	if faultPled:
		fault = choice([0, 50])
	elif clmType == "ANIMAL":
		fault = 0
	
	newEntry.append(fault)
	newEntry.append(clm)
	
	involved_in_driver.append(newEntry)
			
#***Conviction***	
for i in range(len(driver)):
	conChance = randint(1, 7)
	if conChance != 7:
		continue
		
	conCt = randint(1, 8)
	
	rawDate = driver[i][0].split("-")
	lastDate = datetime.date(int(rawDate[0]), int(rawDate[1]), int(rawDate[2]))
	thisOne = datetime.date.today()
	
	for con in range(conCt):
		newEntry = []
		
		licDate = driver[i][0]
		newEntry.append(licDate)
		newEntry.append(driver[i][1])
		newEntry.append(driver[i][2])
		
		rawDist = thisOne - lastDate
		dayDist = rawDist.days
		try:
			randDay = randrange(dayDist)
		except:
			continue
		newDate = lastDate + datetime.timedelta(days = randDay)
		if (newDate == lastDate):
			continue;
		lastDate = newDate
		
		newEntry.append(newDate)
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
		try:
			randDay = randrange(dayDist)
		except:
			continue
		newDate = lastDate + datetime.timedelta(days = randDay)
		if (newDate == lastDate):
			continue;
		lastDate = newDate
		
		newEntry.append(newDate)
		newEntry.append(sampleNotes[section][par])
		newEntry.append(randint(1, 3))

		note.append(newEntry)

def writeData(list, tableStruct):
	for tup in list:
		line = "INSERT INTO " + tableStruct + " VALUES ("
		for field in tup:
			line += "\'" + str(field) + "\', "
		f.write(line[0:-2] + ");\n")
	
writeData(manager, "manager (Username, Password)")
writeData(customer, "customer (Fname, MName, LName, Addr_Line, Province, Country, Phone_No, Email, Sex, Birth_Date, Password, Transit_No, Institute_No, Acct_No)")	
writeData(policy, "policy (Deductible, EffectiveDate, Status, Premium, CustomerNo)")
writeData(claim, "claim (Accident_Date, Status, Type, location)")
writeData(vehicle, "vehicle (VIN, Year, Make, Model, Uses, Km_per_yr, Lease_status, Driving_record)")
writeData(involved_in_vehicle, "involved_in_vehicle (VIN, ClaimID)")
writeData(insd_under, "insd_under (VIN, PolicyNo)")
writeData(reviews, "reviews (ClaimID, ManagerID)")
writeData(related_to, "related_to (PolicyNo, ClaimID)")
writeData(payment, "payment (PolicyNo, TransactionID, Amount, Date)")
writeData(driver, "driver (License_Date, License_No, License_Prov, FName, MName, LName, Training, Sex, Birth_Date, Grid_Rating, License_Class)")
writeData(driver_for, "driver_for (License_Date, License_No, License_Prov, PolicyNo, Relationship)")
writeData(drives, "drives (License_Date, License_No, License_Prov, VIN, P_O_Operator)")
writeData(involved_in_driver, "involved_in_driver (License_Date, License_No, License_Prov, F_T_Party, Percent_At_Fault, ClaimID)")
writeData(conviction, "conviction (License_Date, License_No, License_Prov, Date, Degree)")
writeData(note, "note (PolicyNo, Note_Title, Date, Text, ManagerID)")
	
f.close()
	

