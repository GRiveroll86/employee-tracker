const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'mySQLpw!12345',
      database: 'tracker_db'
    });

const departmentArr = [];
const roleArr = [];
const managerArr = [];
const employeeArr = [];

const addRoleQs = [{
    type: 'input',
    message: "What is the name of the role?",
    name: 'roleName'
},
{
    type: 'input',
    message: "What is the salary of the role?",
    name: 'roleSalary'
},
{
    type: 'list',
    message: "Which department does the role belong to?",
    name: 'roleDepartment',
    choices: departmentArr
}];

const addEmployeeQs = [{
    type: 'input',
    message: "What is the employee's first name?",
    name: 'employeeFirstName'
},
{
    type: 'input',
    message: "What is the employee's last name?",
    name: 'employeeLastName'
},
{
    type: 'list',
    message: "What is the employee's role",
    name: 'employeeRole',
    choices: roleArr
},
{
    type: 'list',
    message: "Who is the employee's manager?",
    name: 'employeeManager',
    choices: ["None", managerArr]
}];

const updateEmployeeQs = [{
    type: 'list',
    message: "Which employee's role do you want to update?",
    name: 'updateEmployeeName',
    choices: employeeArr
},
{
    type: 'list',
    message: "Which role do you want to assign the selected employee?",
    name: 'updateEmployeeRole',
    choices: roleArr
}];

function createConnection(){
    db.connect(function(err){
        if (err) throw err;
        console.log('Connected to MySQL.')
        createArr();
        init();
    })
}

function createArr(){
    db.query(`SELECT name FROM department`, function (err, results) {
        if (err) throw err;
        if (results.length > 0){
            for (i=0;i<results.length;i++){
                departmentArr.push(results[i].name)
            }
        }
    });
    db.query(`SELECT title FROM role`, function (err, results) {
        if (err) throw err;
        if (results.length > 0){
            for (i=0;i<results.length;i++){
                roleArr.push(results[i].title)
            }
        }
    });
    db.query(`SELECT first_name, last_name FROM employee`, function (err, results) {
        if (err) throw err;
        if (results.length > 0){
            for (i=0;i<results.length;i++){
                employeeArr.push(results[i].first_name + " " + results[i].last_name)
            }
        }
    });
}

function init(){
    inquirer
    .prompt({
        type: 'list',
        message: "What would you like to do?",
        name: 'init',
        choices: ['Add Department', 'Add Role', 'Add Employee', 'Update Employee Role', 'View All Departments', 'View All Roles', 'View All Employees', 'Quit']
    })
    .then((response) => {
        if (response.init === 'View All Employees'){
            viewAllEmployees();
        } else if (response.init === 'Add Employee'){
            addEmployee();
        } else if (response.init === 'Update Employee Role'){
            updateEmployeeRole();
        } else if (response.init === 'View All Roles'){
            viewAllRoles();
        } else if (response.init === 'Add Role'){
            addRole();
        } else if (response.init === 'View All Departments'){
            viewAllDepartments();
        } else if (response.init === 'Add Department'){
            addDepartment();
        } else if (response.init === 'Quit'){
            process.exit();
        }
    })
}

function addDepartment() {
    inquirer
    .prompt({
        type: 'input',
        message: "What is the name of the department?",
        name: 'departmentName'
    })
    .then((response) => {
        db.query(`INSERT INTO department (name) VALUES ("${response.departmentName}")`, function (err, results) {
            if (err) throw err;
            departmentArr.push(response.departmentName);
            console.log(`Added ${response.departmentName} to the database.`);
            init();
        });
    })
}

function addRole() {
    if (departmentArr.length === 0){
        console.log("*\nA department must be created before you can add a role.\n*");
        return init();
    };
    inquirer
    .prompt(addRoleQs)
    .then((response) => {
        db.query(`INSERT INTO role (title, salary, department_id) VALUES ("${response.roleName}"), (${response.roleSalary}), (SELECT id FROM department WHERE name = "${response.roleDepartment}")`, function (err, results) {
            if (err) throw err;
            roleArr.push(response.roleName)
            console.log(`Added ${response.roleName} to the database.`);
            init();
        });
    })
}

function addEmployee() {
    if (roleArr.length === 0){
        console.log("*\nA role must be created before you can add an employee.\n*");
        return init();
    };
    inquirer
    .prompt(addEmployeeQs)
    .then((response) => {
        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${response.employeeFirstName}", ${response.employeeLastName}, ${response.employeeRole}, ${response.employeeManager})`, function (err, results) {
            if (err) throw err;
            employeeArr.push(response.employeeFirstName + " " + response.employeeLastName);
            console.log(`Added ${response.employeeFirstName} ${response.employeeLastName} to the database.`);
            init();
        });
    })
}

function updateEmployeeRole() {
    if (employeeArr.length === 0){
        console.log("*\nAn employee must be created before you can them.\n*")
        return init();
    };
    inquirer
    .prompt(updateEmployeeQs)
    .then((response) => {
        // ADD QUERY
        db.query(`SELECT * FROM department`, function (err, results) {
            if (err) throw err;
            console.log(`Updated ${response.updateEmployeeName}'s role to ${response.updateEmployeeRole}.`);
            init();
        });
    })
}

function viewAllDepartments() {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) throw err;
        console.table(results);
        init();
    });
}

function viewAllRoles() {
    db.query('SELECT role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id', function (err, results) {
        if (err) throw err;
        console.table(results);
        init();
    });
}

function viewAllEmployees() {
    db.query('SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary FROM employee JOIN role ON employee.role_id = role.id JOIN department ON department.id = role.id', function (err, results) {
        if (err) throw err;
        console.table(results);
        init();
    });
}

createConnection();