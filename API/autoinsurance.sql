DROP DATABASE IF EXISTS AUTO_INSURANCE;
CREATE DATABASE AUTO_INSURANCE; 
USE AUTO_INSURANCE;

DROP TABLE IF EXISTS MANAGER;
CREATE TABLE MANAGER (
	Username		varchar(25) not null,
	Password		varchar(25) not null,
    ManagerID		int auto_increment not null,
	primary key (ManagerID)
);

DROP TABLE IF EXISTS CUSTOMER;
CREATE TABLE CUSTOMER (
	CustomerNo			int auto_increment not null,
    FName			varchar(25) not null,
    MName			varchar(25) not null,
    LName			varchar(25) not null,
    Addr_Line		varchar(50) not null,
    Province		varchar(25) not null,
    Country			varchar(25) not null,
    Phone_No		varchar(25) not null,
    Email			varchar(250) not null,
    Sex				varchar(25) not null,
    Birth_Date 		date not null,
    Password		varchar(500) not null,
    Transit_No		int not null,
    Institute_No	int not null,
    Acct_No			int not null,
    primary key (CustomerNo)
);

DROP TABLE IF EXISTS CLAIM;
CREATE TABLE CLAIM (
	ClaimID			int auto_increment not null primary key,
    Accident_Date		datetime not null,
    Status			varchar(25) not null,
    Type			varchar(25) not null,
    location		varchar(25) not null
);

DROP TABLE IF EXISTS POLICY;
CREATE TABLE POLICY (
	PolicyNo 	int not null auto_increment primary key,
    Deductible	int not null,
    EffectiveDate date not null,
    Status 		varchar(25) not null,
    Premium		int not null,
    CustomerNo  int not null,
    foreign key (CustomerNo) references CUSTOMER(CustomerNo)
);

DROP TABLE IF EXISTS PAYMENT;
CREATE TABLE PAYMENT (
	PolicyNo 	int not null,
    TransactionID int not null,
    Amount		int not null,
    Date		datetime not null,
    foreign key (PolicyNo) references POLICY(PolicyNo),
    primary key (PolicyNo, TransactionID)
);

DROP TABLE IF EXISTS DRIVER;
CREATE TABLE DRIVER (
	License_Date	date not null,
    License_No		varchar(25) not null,
    License_Prov	varchar(25) not null,
    FName			varchar(25) not null,
    MName			varchar(25) not null,
    LName			varchar(25) not null,
    Training		varchar(25) not null,
    Sex				varchar(25) not null,
    Birth_Date 		date not null,
    Grid_Rating		int not null,
    License_Class	int not null,
    primary key (License_Date, License_No, License_Prov)
);

DROP TABLE IF EXISTS VEHICLE;
CREATE TABLE VEHICLE (
	VIN		varchar(50) not null primary key,
    Year	int not null,
    Make	varchar(25) not null,
    Uses		varchar(25) not null,
    Km_per_yr	int not null,
    Lease_status	varchar(25) not null,
    Driving_record varchar(50) not null,
    PolicyNo	int not null,
    foreign key (PolicyNo) references POLICY(PolicyNo)
);

DROP TABLE IF EXISTS DRIVER_FOR;
CREATE TABLE DRIVER_FOR (
	License_Date	date not null,
    License_No		varchar(25) not null,
    License_Prov	varchar(25) not null,
    PolicyNo		int not null,
    Relationship	varchar(25) not null,
    foreign key (License_Date, License_No, License_Prov) references DRIVER(License_Date, License_No, License_Prov),
    foreign key (PolicyNo) references POLICY(PolicyNo),
    primary key (License_Date, License_No, License_Prov, PolicyNo)
);

DROP TABLE IF EXISTS CONVICTION;
CREATE TABLE CONVICTION (
	License_Date	date not null,
    License_No		varchar(25) not null,
    License_Prov	varchar(25) not null,
    Date			date not null,
    Degree			varchar(25) not null,
    foreign key (License_Date, License_No, License_Prov) references DRIVER(License_Date, License_No, License_Prov),
    primary key (License_Date, License_No, License_Prov, Date)
);

DROP TABLE IF EXISTS DRIVES;
CREATE TABLE DRIVES (
	License_Date	date not null,
    License_No		varchar(25) not null,
    License_Prov	varchar(25) not null,
    VIN				varchar(50) not null,
    P_O_Operator	varchar(25) not null,
    foreign key (License_Date, License_No, License_Prov) references DRIVER(License_Date, License_No, License_Prov),
    primary key (License_Date, License_No, License_Prov, VIN)
);

DROP TABLE IF EXISTS ENDORSEMENT;
CREATE TABLE ENDORSEMENT (
	VIN		varchar(50) not null,
    Endorsement varchar(25) not null,
    foreign key (VIN) references VEHICLE(VIN),
    primary key (VIN, Endorsement)
);

DROP TABLE IF EXISTS MOTORCYCLE;
CREATE TABLE MOTORCYCLE (
	VIN		varchar(50) not null,
    CCs		int not null,
    Category varchar(25) not null,
    foreign key (VIN) references VEHICLE(VIN),
    primary key (VIN)
);

DROP TABLE IF EXISTS MOTORHOME;
CREATE TABLE MOTORHOME (
	VIN		varchar(50) not null,
    Length	int not null,
    Value	 int not null,
    foreign key (VIN) references VEHICLE(VIN),
    primary key (VIN)
);

DROP TABLE IF EXISTS SNOW_ATV_MOPED;
CREATE TABLE SNOW_ATV_MOPED (
	VIN		varchar(50) not null,
    CCs		int not null,
    Value int not null,
    foreign key (VIN) references VEHICLE(VIN),
    primary key (VIN)
);

DROP TABLE IF EXISTS ACCESSORY;
CREATE TABLE ACCESSORY (
	VIN		varchar(50) not null,
    Accessory varchar(25) not null,
    foreign key (VIN) references VEHICLE(VIN),
    primary key (VIN, Accessory)
);

DROP TABLE IF EXISTS INVOLVED_IN_VEHICLE;
CREATE TABLE INVOLVED_IN_VEHICLE (
	VIN		varchar(50) not null,
    ClaimID		int not null,
    foreign key (VIN) references VEHICLE(VIN),
    foreign key (ClaimID) references CLAIM(ClaimID),
    primary key (VIN, ClaimID)
);

DROP TABLE IF EXISTS NOTE;
CREATE TABLE NOTE (
	PolicyNo		int not null,
	Note_Title		varchar(25) not null,
    Date			datetime not null,
    Text			varchar(100) not null,
    ManagerID		int not null,
	primary key (PolicyNo, Date),
    foreign key(PolicyNo) references POLICY(PolicyNo),
    foreign key(ManagerID) references MANAGER(ManagerID)
);

DROP TABLE IF EXISTS REVIEWS;
CREATE TABLE REVIEWS (
	ClaimID			int not null,
    ManagerID		int not null,
	primary key (ManagerID, ClaimID),
    foreign key(ClaimID) references Claim(ClaimID),
    foreign key(ManagerID) references MANAGER(ManagerID)
);


DROP TABLE IF EXISTS RELATED_TO;
CREATE TABLE RELATED_TO (
	PolicyNo	int not null,
    ClaimID		int not null,
    primary key (PolicyNo, ClaimID),
    foreign key (PolicyNo) references POLICY(PolicyNo),
    foreign key (ClaimID) references CLAIM(ClaimID)
);

DROP TABLE IF EXISTS INVOLVED_IN_DRIVER;
CREATE TABLE INVOLVED_IN_DRIVER (
	License_Date	date not null,
    License_No		varchar(25) not null,
    License_Prov	varchar(25) not null,
    F_T_Party		varchar(50) not null,
    Percent_At_Fault		int not null,
    ClaimID 		int not null,
    foreign key (License_Date, License_No, License_Prov) references DRIVER(License_Date, License_No, License_Prov),
    foreign key (ClaimID) references CLAIM(ClaimID),
    primary key (License_Date, License_No, License_Prov, ClaimID)
);


