// Use pg to connect and execute SQL queries. 
// Explain what SQl injection is and how to prevent it with pg 
// Examine CRUD on a single resource with Express and pg 

// The Node SQL Ecosystem 
// ORMs (SEQUELIZE)
// Query builder (KNEX.js)
// SQL driver 
// 

// PG is a SQL driver. 

////////////////////////

// Connecting to PG

// Similar to psycopg2 with python 
// Allows us to extablish a connection to a database and execute SQL 
// npm install pg
// It's common to abstract this logic to another file. SO let's create a file db.js 


// debugger;
// nodemon --inspect server.js

/////////////////////// 

// SQL Injection 

// A technique where an attacker tries to execute undesirable SQL statements on your db. 
// It's a common attack, and it's easy to be vulnerable if you aren't careful. 

// To prevent against SQL injection, we need to sanitize our inputs 
// ORMs typically do this for you automatically 

// In SQL statment, represent variables like $1, $2, $3, etc. 
// - You can have as many variables as you want 
// For the second argument to db.query, pass an array of values 
// - $1 will evaluate to the first array element, $2 to the second, etc. 
// Note: the variable naming is 1-indexed 

//////////////////////////// 

// Creating Users PG 

// In SQL, for INSERT/UPDATE/DELETE, you can have a RETURNING clause. 
// This is to return data that was inserted, updated, or deleted :
// INSERT INTO users (name, type) VALUES (...) RETURNING id, name;
// INSERT INTO users (name, type) VALUES (...) RETURNING *; 

// Committing 

// With SQLAlchemy, you had to commit after all changes - because SQLA put all work into a db transaction. 
// That isn't the case with pg - so you don't need to explicitly commit (each INSERT/UPDATE?DELETE commits automatically)

///////////////////////////

// Running Tests 

// Make sure you create a test database first, otherwise they will hange. 
// createdb cats_test 
// psql cats_test < data.sql 
// Once you have db, run your tests as usual with jest 


// The main difference between the PUT and PATCH method is that the PUT method uses the request 
// URI to supply a modified version of the requested resource which replaces the original version of the resource, 
// whereas the PATCH method supplies a set of instructions to modify the resource.