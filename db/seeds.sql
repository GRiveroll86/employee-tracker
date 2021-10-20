USE tracker_db;

INSERT INTO department (id, name)
VALUES (1, "Engineering"),
        (2, "Sales");

INSERT INTO role (id, title, salary, department_id)
VALUES (1, "Sales Lead", 100000, 2),
        (2, "Lead Engineer", 150000, 1);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, "John", "Doe", 2, 1),
        (2, "Jane", "Doe", 1, 2);