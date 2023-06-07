const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
module.exports = app;

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodoQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodoQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodoQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getTodoQuery);
  response.send(data);
});
//API2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  console.log(todo);
  response.send(todo);
});

//API3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;

  const { id, todo, priority, status } = todoDetails;

  const addTodoQuery = `
    INSERT INTO
      todo (id, todo,priority,status)
    VALUES
      (
       ${id},
      '${todo}',
       '${priority}',
       '${status}'
      );`;

  const dbResponse = await db.run(addTodoQuery);
  const todoId = dbResponse.lastID;
  response.send("Todo Successfully Added");
});

//API4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  //console.log(todoDetails);
  switch (true) {
    case todoDetails.status !== undefined:
      updateTodoQuery = `
     UPDATE
      todo 
      SET
      status="DONE"
      WHERE 
      id=${todoId};`;
      response.send("Status Updated");
      await db.run(updateTodoQuery);
      break;
    case todoDetails.priority !== undefined:
      updateTodoQuery = `
     UPDATE
      todo 
      SET
      priority="HIGH"
      WHERE 
      id=${todoId};`;
      response.send("Priority Updated");
      await db.run(updateTodoQuery);
      break;
    case todoDetails.todo !== undefined:
      updateTodoQuery = `
     UPDATE
      todo 
      SET
      todo="Some task"
      WHERE 
      id=${todoId};`;
      response.send("Todo Updated");
      await db.run(updateTodoQuery);
      break;
  }
});

//delete
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
