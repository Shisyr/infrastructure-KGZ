const mysql = require('mysql');
class Database {
  constructor() {}
  connect(database) {
    if(!this.connection) {
      this.connection = mysql.createConnection({
              host: '127.0.0.1',
              port: 3306,
              user: 'mukhamed',
              password: 'mysql',
              database: database
      });
      console.log('connection');
      this.connection.connect((err) => {
        if(err) throw err;
        console.log('Succesfully  Connected!');
      });
    }
  }
  execute(sql, cb) {
    this.connection.query(sql, (err, result, fields) => {
      if(err) throw err;
      cb(result);
    });
  }

  startTransaction(cb) {
    this.connection.beginTransaction((err) => {
      if(err) throw err;
      cb(this.connection);
    })
  }

}
// function database() {
//   let connection;
//   function connect(database) {
//     connection = mysql.createConnection({
//             host: '127.0.0.1',
//             port: 3306,
//             user: 'mukhamed',
//             password: 'mysql',
//             database: database
//     });
//     console.log('connection');
//     connection.connect((err) => {
//       if(err) throw err;
//       console.log('Succesfully  Connected!');
//     });
//   }
//   function execute(sql, cb) {
//     connection.query(sql, (err, result, fields) => {
//       if(err) throw err;
//       cb(result);
//     });
//   }
//
//   function beginTranscation(cb) {
//     connection.beginTranscation((err) => {
//       if(err) throw err;
//       cb(connection);
//     })
//   }
//
// }
module.exports = Database;
