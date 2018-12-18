const express = require('express');
const body = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const Database = require('./db');
const mysql = require('mysql');
const mysqlssh = require('mysql-ssh');
const app = express();
const fs = require('fs');

app.use(express.static(path.join(__dirname + '.../public')));
app.use(body.urlencoded({extended: false}));
app.use(body.json());
app.set('views', './views');
app.set('view engine', 'ejs');

const ESTATE_SELECTS =  {
  Owner : 'SELECT * FROM `Owner`',
  "Document" : 'SELECT * FROM `Document`',
  Requisite : "SELECT * FROM `Requisite`",
  TypeEstate : "SELECT * FROM `Type_Estate`",
  Area : "SELECT * FROM `Area`",
  Bank : "SELECT * FROM `Bank`",
  EstateInformation : "SELECT * FROM `Estate Information`",
  PersonInformation : "SELECT * FROM `Person Information`",
  RedCertificate : "SELECT * FROM `Red Certificate`",
  Series : "SELECT * FROM `Series`",
  EstateToCommunications : "SELECT * FROM `Relation_Estate_to_Communication`",
  Communications : "SELECT * FROM `Communications`"
}
let selectBirthDocument = "SELECT * FROM `Birth Document`";
let selectPersonalInformation = "SELECT * FROM `Personal Information`"
let selectPassport = "SELECT * FROM `Passport`";
let selectDriverLicense = "SELECT * FROM `Driver License`";
let selectAddress = "SELECT * FROM `Address`";
let selectCountry = "SELECT * FROM `Country`";
let selectDateRange = "SELECT * FROM `Daterange`";
let selectDriverLicenseCategory = "SELECT * FROM `Driver License Category`";
let selectInternationalPassport = "SELECT * FROM `InternationalPassport`";
let selectRelationCategory = "SELECT * FROM `Relation category`";
const db = new Database();
function executeQuery(sql, cb){
  db.execute(sql, (result) => {
    cb(result);
  })
}


app.post('/medical_card', async(req, res) => {
  const json = {
    "Address": "SELECT * FROM `Address`",
    "History_diseases_medical_card": "SELECT * FROM `History_diseases_medical_card`",
    "Allergy_History": "SELECT * FROM `Allergy History`",
    "Allergy_Type": "SELECT * FROM `Allergy_Type`",
    "Disease Type": "SELECT * FROM `Disease Type`",
    "Duty Suitability": "SELECT * FROM `Duty Suitability`",
    "History Of Disease Instance": "SELECT * FROM `History Of Disease Instance`",
    "History of inspection": "SELECT * FROM `History of inspection`",
    "History_allergy_medical_card": "SELECT * FROM `History_allergy_medical_card`",
    "History_vaccination_medical_card": "SELECT * FROM `History_vaccination_medical_card`",
    "Medical_Card": "SELECT * FROM `Medical_Card`",
    "Military Inspection": "SELECT * FROM `Military Inspection`",
    "Name of Vaccine": "SELECT * FROM `Name of Vaccine`",
    "Pregnancy Inspections": "SELECT * FROM `Pregnancy Inspections`",
    "Vaccination History": "SELECT * FROM `Vaccination History`"
  }
  db.connect('healthcare');
  const data = await new Promise((resolve, reject) => {
        executeQuery(json[req.body.type], (result) => {
            resolve(result);
        });
  });
  console.log(data);
  res.render('all', {data: data});
});
app.get('/medical_card', async(req, res) => {
  db.connect('healthcare');
  res.render('medical_card', {data: ''})
});


app.post('/medical_card/add', async(req, res) => {
  const json = {
      'firstName': 'Something',
      'lastName': 'OKAY',
      'fatherName': 'dowekwer',
      'birthday': '2018-122',
      'region': 'Moscow',
      'city': 'Bishkek',
      'district': 'Moscow ',
      'street': 'Komsomoskl',
      'house': '12',
      'title': 'Kor',
      'catalysts': 'CATALYSTS',
      'reaction': 'No reaction',
      'treatment': 'sdfsdfsdfs'
    }
  const {region, city, district, street, house, firstName, lastName, fatherName, birthday, title,
  catalysts, reaction, treatment} = req.body;

  db.connect('healthcare');
  db.startTransaction((conn) => {
    let addAddress = "INSERT INTO `Address` (`region`, `city`, `district`, `street`, `house`) VALUES (";
    addAddress += `'${region}', '${city}', '${district}', '${street}', '${house}');`;
    if(!region || !city || !district || !street || !house) {
      conn.rollback(() => {
        console.log('Need to fill fields for address');
        console.error('Roll Back!');
      });
      return;
    }
    conn.query(addAddress, (err, result, fields) => {
      if(err) {
        conn.rollback(() => {
          throw err;
        });
        return;
      }
      const address_id = result.insertId;
      console.log('Address table is Succesfully Inserted!');
      console.log('Its id = ', address_id);
      if(!firstName || !lastName || !birthday || !address_id) {
        conn.rollback(() => {
          console.log('PersonInformation is required!');
          console.error('Roll Back!');
        });
        return;
      }
      const isValidDate = new Date(birthday);
      if(isNaN(isValidDate)) {
        conn.rollback(() => {
          console.log('Birthday is incorrect Date!');
          console.error('Roll Back!');
        });
        return;
      }
      let addMedical_Card_Information = "INSERT INTO `Medical_Card` (firstName, lastName, fatherName, birthday, address_id) VALUES (";
      addMedical_Card_Information += `'${firstName}', '${lastName}', '${fatherName}', '${birthday}', '${address_id}');`;
      conn.query(addMedical_Card_Information, (err, med_res, fields) => {
          if(err) {
            conn.rollback(() => {
              throw err;
            });
            console.error('Roll Back!');
            return;
          }
          const med_id = med_res.insertId;
          console.log('Medical Card table is Succesfully Inserted!');
          console.log('Its id = ', med_id);
          if(!title) {
            conn.rollback(() => {
              console.error('Type of Allergy is required!');
              console.error('Roll Back!');
            });
            return;
          }
          let addAllergyType = 'INSERT INTO `Allergy_Type` (title) VALUES (';
          addAllergyType += `'${title}');`;
          conn.query(addAllergyType, (err, typ_res, fields) => {
            if(err) {
              conn.rollback(() => {
                throw err;
              });
              console.error('Roll Back!');
              return;
            }
            const type_id = typ_res.insertId;
            console.log('Allergy_Type table is Succesfully Inserted!');
            console.log('Its id = ', type_id);
            if(!type_id || !catalysts || !reaction || !treatment) {
              conn.rollback(() => {
                console.error('All fields of Allergy History is required!');
                console.error('Roll Back!');
              });
              return;
            }
            let addAllergyHistory = 'INSERT INTO `Allergy History` (allergy_type_id, catalysts, reaction, treatment) VALUES (';
            addAllergyHistory += `'${type_id}', '${catalysts}', '${reaction}', '${treatment}');`;
            conn.query(addAllergyHistory, (err, res_allergy, fields) => {
              if(err) {
                conn.rollback(() => {
                  throw err;
                });
                console.error('Roll Back!');
                return;
              }
              const allergy_id = res_allergy.insertId;
              console.log('Allergy History table is Succesfully Inserted!');
              console.log('Its id = ', allergy_id);
              if(!allergy_id || !med_id) {
                conn.rollback(() => {
                  console.error('Connection between Allergy History and Medical Card failed!');
                  console.error('Roll Back!');
                })
                return;
              }
              let connection_allergy_medical_card = 'INSERT INTO `History_allergy_medical_card` (allergy_history_id, medical_card_id) VALUES (';
              connection_allergy_medical_card += `'${allergy_id}', '${med_id}');`;
              conn.query(connection_allergy_medical_card, (err, full_result, fields) => {
                if(err) {
                  conn.rollback(() => {
                    throw err;
                  });
                  console.error('Roll Back!');
                  return;
                }
                const full_id = full_result.insertId;
                console.log('Connection Medical Card and Allergy History tables are Succesfully Inserted!');
                console.log('Its id = ', full_id);
                conn.commit(function(err) {
                  if (err) {
                    conn.rollback(function() {
                      throw err;
                    });
                    console.error('Roll Back!');
                    return;
                  }
                  console.log('Transaction Completed!');
                  conn.end();
                });
              });
            });
          });
      });
    });
  });
  res.render('medical_card', {data: ''});
});

app.get('/medical_card/add', async(req, res) => {
  res.render('add_medical_card', {data: ''})
});



app.post('/all', async (req, res) => {
  const json = {
    "Address" : selectAddress,
    "Birth Document" : selectBirthDocument,
    "Country" : selectCountry,
    "Daterange" : selectDateRange,
    "Driver License" : selectDriverLicense,
    "Driver License Category" : selectDriverLicenseCategory,
    "International Passport" : selectInternationalPassport,
    "Passport": selectPassport,
    "Person Information" : selectPersonalInformation,
    "Relation Category" : selectRelationCategory
  }
  db.connect('mukhamed');
  const data = await new Promise((resolve, reject) => {
        executeQuery(json[req.body.type], (result) => {
            resolve(result);
        });
  });
  console.log(json);
  res.render('all', {data: data});
});

app.get('/all', (req, res) => {
  res.render('all', {data: ''})
});

app.post('/estate', async (req, res) => {
    const json = {
      "Owner" : ESTATE_SELECTS.Owner,
      "Document" : ESTATE_SELECTS.Document,
      "Requisite" : ESTATE_SELECTS.Requisite,
      "Type Estate" : ESTATE_SELECTS.TypeEstate,
      "Area" : ESTATE_SELECTS.Area,
      "Bank" : ESTATE_SELECTS.Bank,
      "Estate Information" : ESTATE_SELECTS.EstateInformation,
      "Person Information" : ESTATE_SELECTS.PersonInformation,
      "Red Certificate" : ESTATE_SELECTS.RedCertificate,
      "Series" : ESTATE_SELECTS.Series,
      "Estate to Communications" : ESTATE_SELECTS.EstateToCommunications,
      "Communications" : ESTATE_SELECTS.Communications
    }
    db.connect('Estate');
    const data = await new Promise((resolve, reject) => {
        executeQuery(json[req.body.type], (result) => {
            resolve(result);
        });
    });
    res.render('estate', {data: data});
});

app.get('/estate', (req, res) => {
  res.render('estate', {data: ''})
});

app.post('/dmv', async (req, res) => {
  const json = {
    "Auto Appearance" : "SELECT * FROM `Auto Appearance`",
    "Automobiles" : "SELECT * FROM `Automobiles`",
    "Category" : "SELECT * FROM `Category`",
    "Holder" : "SELECT * FROM `Holder`",
    "Registration Number" : "SELECT * FROM `Registration Number`",
    "Taxes" : "SELECT * FROM `Taxes`",
    "Taxes of Passport" : "SELECT * FROM `Taxes Of Passport`",
    "Technical Passport" : "SELECT * FROM `Technical Passport`",
    "Technical Passport Category" : "SELECT * FROM `Technical Passport Category`"
  }
  db.connect('DMV');
  const data = await new Promise((resolve, reject) => {
      executeQuery(json[req.body.type], (result) => {
          resolve(result);
      });
  });
  res.render('dmv', {data: data});
});

app.get('/dmv', function (req, res) {
  res.render('dmv', {data: ''});
});

app.get('/', (req, res) => {
    res.render('index', {data: ''});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
