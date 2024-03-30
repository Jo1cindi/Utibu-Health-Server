const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("mssql/msnodesqlv8");

//Create Account
router.post("/signup", async (req, res) => {
  const customerID = Math.random(Math.floor() * 10000);
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10);

  new sql.Request().query(
    `select * from Customers where Email = '${email}' and Phone_Number = '${phoneNumber}'`,
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      } else {
        if (result.recordset[0]) {
          res.status(409).send({
            message: "This user exists",
          });
        } else {
          new sql.Request().query(
            `insert into Customers (Customer_ID, First_Name, Last_Name, Email, Phone_Number, Password) values ('${customerID}', '${firstName}', '${lastName}', '${email}', '${phoneNumber}', '${hashedPassword}')`,
            (err, results) => {
              if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
              } else {
                console.log(results);
                res.status(200).send("Customer added");
              }
            }
          );
        }
        console.log(result);
      }
    }
  );

  console.log(req.body);
  console.log(hashedPassword);
});

module.exports = router;
