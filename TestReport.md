# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)





# Dependency graph 
![Dependency Graph](./images/dependency_graph.png)   
# Integration approach
    
    Bottom-up integration: In this approach, integration starts with the lowest-level modules and progresses upward. The dependent modules are integrated first, followed by the main modules that depend on them. The sequence can be defined as:
    
    Step 1: Unit testing of lower-level functions (Auth.js and Utils.js) and lowest-level modules (models.js and User.js). WB/ statement coverage technique is used to define the test cases, covering all the possible statements.
    Step 2: Unit testing of higher-level functions (controller.js, users.js, and genericFunctions.js). WB/ statement coverage technique is used to define the test cases, covering all the possible statements.
    Step 3: Integration testing of the lower-level modules (models.js and User.js) and higher-level functions (controller.js, users.js, and genericFunctions.js). 
    Step 4: API testing of the routes.js file, verifying the correct interaction between the endpoints, functions, and modules.
    Step 5: System testing of the application, verifying the correct interaction between the endpoints, functions, database, and modules.



# Tests

   <in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case  (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)>   <split the table if needed>


| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
| Successful transaction creation by user | createTransaction | Unit | WB/ statement coverage |
| Unauthorized transaction creation by user| createTransaction | Unit | WB/ statement coverage |
| Different user request by user| createTransaction | Unit | WB/ statement coverage |
| Successful admin transaction creation for different user| createTransaction | Unit | WB/ statement coverage |
| Invalid parameters| createTransaction | Unit | WB/ statement coverage |
| Database Error Transaction| createTransaction | Unit | WB/ statement coverage |
| User or Category not found| createTransaction | Unit | WB/ statement coverage |
| Transaction created by user | createTransaction | Integration | BB/ Bottom Up |
| Different url | createTransaction | Integration | BB/ Bottom Up |
| Invalid parameters | createTransaction | Integration | BB/ Bottom Up |
| Category dosen't exist | createTransaction | Integration | BB/ Bottom Up |
| Unauthorized User | createTransaction | Integration | BB/ Bottom Up |
| Transaction created by admin | createTransaction | Integration | BB/ Bottom Up |
| Transaction for another user created by admin | createTransaction | Integration | BB/ Bottom Up |
|--|--|--|--|
| Successful Request | getAllTransactions | Unit | WB/ statement coverage |
| Unauthorized Request | getAllTransactions | Unit | WB/ statement coverage |
| Empty Request | getAllTransactions | Unit | WB/ statement coverage |
| Database Error Request | getAllTransactions | Unit | WB/ statement coverage |
| Retrieved all transactions | getAllTransactions | Integration | BB/ Bottom Up |
| Unauthorized admin | getAllTransactions | Integration | BB/ Bottom Up |
|--|--|--|--|
| Successful User Request | getTransactionsByUser | Unit | WB/ statement 
| Unauthorized User Request | getTransactionsByUser | Unit | WB/ statement coverage |
| Successful Admin Request | getTransactionsByUser | Unit | WB/ statement coverage |
| Unauthorized Admin Request | getTransactionsByUser | Unit | WB/ statement coverage |
| Inexistent User Request | getTransactionsByUser | Unit | WB/ statement coverage |
| Database Error Request | getTransactionsByUser | Unit | WB/ statement coverage |
| Successful user request | getTransactionsByUser | Integration | BB/ Bottom Up |
| Unauthorized user request | getTransactionsByUser | Integration | BB/ Bottom Up |
| Unauthorized admin request | getTransactionsByUser | Integration | BB/ Bottom Up |
| User not found | getTransactionsByUser | Integration | BB/ Bottom Up |
|--|--|--|--|
| Successful User Request | getTransactionsByUserByCategory | Unit | WB/ statement coverage |
| Unauthorized User Request | getTransactionsByUserByCategory | Unit | WB/ statement coverage |
| Successful Admin Request | getTransactionsByUserByCategory | Unit | WB/ statement coverage |
| Unauthorized Admin Request | getTransactionsByUserByCategory | Unit | WB/ statement coverage |
| User not found Request | getTransactionsByUserByCategory | Unit | WB/ statement coverage |
| Category not found Request | getTransactionsByUserByCategory | Unit | WB/ statement coverage |
| Database Error Request | getTransactionsByUserByCategory | Unit | WB/ statement coverage |
| Successful user request | getTransactionsByUserByCategory | Integration | BB/ Bottom Up |
| Unauthorized user request | getTransactionsByUserByCategory | Integration | BB/ Bottom Up |
| Successful admin request | getTransactionsByUserByCategory | Integration | BB/ Bottom Up |
| Unauthorized admin request | getTransactionsByUserByCategory | Integration | BB/ Bottom Up |
| User not found request | getTransactionsByUserByCategory | Integration | BB/ Bottom Up |
| Category not found request | getTransactionsByUserByCategory | Integration | BB/ Bottom Up |
|--|--|--|--|
| Successful User Request | getTransactionsByGroup | Unit | WB/ statement coverage |
| Unauthorized User Request | getTransactionsByGroup | Unit | WB/ statement coverage |
| Successful Admin Request | getTransactionsByGroup | Unit | WB/ statement coverage |
| Unauthorized Admin Request | getTransactionsByGroup | Unit | WB/ statement coverage |
| Inexistent Group Request | getTransactionsByGroup | Unit | WB/ statement coverage |
| Database Error (Group) Request | getTransactionsByGroup | Unit | WB/ statement coverage |
| Database Error (User) Request | getTransactionsByGroup | Unit | WB/ statement coverage |
| Database Error (Aggregate) Request | getTransactionsByGroup | Unit | WB/ statement coverage |
| Successful user request | getTransactionsByGroup | Integration | BB/ Bottom Up |
| Unauthorized user request | getTransactionsByGroup | Integration | BB/ Bottom Up |
| Successful admin request | getTransactionsByGroup | Integration | BB/ Bottom Up |
| Unauthorized admin request | getTransactionsByGroup | Integration | BB/ Bottom Up |
| Group not found | getTransactionsByGroup | Integration | BB/ Bottom Up |
|--|--|--|--|
| Successful User Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Unauthorized User Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Successful Admin Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Unauthorized Admin Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Group not found Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Category not found Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Database Error (Group) Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Database Error (User) Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Database Error (Aggregate) Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
| Successful user request | getTransactionsByGroupByCategory | Integration | BB/ Bottom Up |
| Unauthorized user request | getTransactionsByGroupByCategory | Integration | BB/ Bottom Up |
| Successful admin request | getTransactionsByGroupByCategory | Integration | BB/ Bottom Up |
| Unauthorized admin request | getTransactionsByGroupByCategory | Integration | BB/ Bottom Up |
| Group not found | getTransactionsByGroupByCategory | Integration | BB/ Bottom Up |
| Category not found | getTransactionsByGroupByCategory | Integration | BB/ Bottom Up |
|--|--|--|--|
| Successful User Delete Transaction | deleteTransaction | Unit | WB/ statement coverage |
| Unauthorized User | deleteTransaction | Unit | WB/ statement coverage |
| User or transaction not found | deleteTransaction | Unit | WB/ statement coverage |
| Successful Admin transaction for different users | deleteTransaction | Unit | WB/ statement coverage |
| Missing transaction attributes | deleteTransaction | Unit | WB/ statement coverage |
| Database Error Transaction Request | deleteTransaction | Unit | WB/ statement coverage |
| Transaction deleted by user | deleteTransaction | Integration | BB/ Bottom Up |
| Transaction deleted by admin | deleteTransaction | Integration | BB/ Bottom Up |
| User not authorized | deleteTransaction | Integration | BB/ Bottom Up |
| User not found | deleteTransaction | Integration | BB/ Bottom Up |
| Transaction not found | deleteTransaction | Integration | BB/ Bottom Up |
| Missing ID | deleteTransaction | Integration | BB/ Bottom Up |
|--|--|--|--|
| Successful Request | deleteTransactions | Unit | WB/ statement coverage |
| Unauthorized Request | deleteTransactions | Unit | WB/ statement coverage |
| Invalid ID | deleteTransactions | Unit | WB/ statement coverage |
| Empty Request | deleteTransactions | Unit | WB/ statement coverage |
| Database Error Request | deleteTransactions | Unit | WB/ statement coverage |
| Transactions deleted by admin | deleteTransactions | Integration | BB/ Bottom Up |
| Unauthorized admin | deleteTransactions | Integration | BB/ Bottom Up |
| Invalid transaction | deleteTransactions | Integration | BB/ Bottom Up |
| Invalid ids | deleteTransactions | Integration | BB/ Bottom Up |
|||||

# Coverage



## Coverage of FR

<Report in the following table the coverage of  functional requirements (from official requirements) >

| Functional Requirements covered |   Test(s) | 
| ------------------------------- | ----------- | 
|  FR1  | ------------- |
| FR11 |  |
| FR12|  |
| FR13|  |
| FR14 |  |
| FR15 |  |
| FR16 |  |
| FR17 |  |
| FR2   | ------------- |
| FR21 |  |
| FR22|  |
| FR23|  |
| FR24|  |
| FR26|  |
| FR28|  |
|  FR3   | -------------|
|FR31| Successful transaction creation by user | 
| | Unauthorized transaction creation by user| 
| | Different user request by user|
| | Successful admin transaction creation for different user| 
| | Invalid parameters|
| | Database Error Transaction|
| | User or Category not found|
| | Transaction created by user |
| | Different url |
| | Invalid parameters |
| | Category dosen't exist |
| | Unauthorized User |
| | Transaction created by admin | 
| | Transaction for another user created by admin | 
|FR32| Successful Request |
|   |Unauthorized Request |
|   |Empty Request |
|   |Database Error Request |
|   |Retrieved all transactions |
|   |Unauthorized admin |
| FR33 | Successful User Request |
|   |Unauthorized User Request |
|   |Successful Admin Request |
|   |Unauthorized Admin Request |
|   |Inexistent User Request | 
|   |Database Error Request |
|   |Successful user request |
|   |Unauthorized user request |
|   |Unauthorized admin request |
|   |User not found |
| FR34| Successful User Request | 
|  | Unauthorized User Request | 
|  | Successful Admin Request | 
|  | Unauthorized Admin Request |
|  | User not found Request | 
|  | Category not found Request |
|  | Database Error Request |
|  | Successful user request | 
|  | Unauthorized user request | 
|  | Successful admin request |
|  | Unauthorized admin request | 
|  | User not found request | 
|  | Category not found request |
| FR35| Successful User Request |
|  |Unauthorized User Request |
|  |Successful Admin Request |
|  |Unauthorized Admin Request |
|  |Inexistent Group Request |
|  |Database Error (Group) Request |
|  |Database Error (User) Request |
|  |Database Error (Aggregate) Request | 
|  |Successful user request |
|  |Unauthorized user request | 
|  |Successful admin request | 
|  |Unauthorized admin request |
|  |Group not found | 
| FR36| Successful User Request | 
| | Unauthorized User Request | 
| | Successful Admin Request | 
| | Unauthorized Admin Request | 
| | Group not found Request | 
| | Category not found Request | 
| | Database Error (Group) Request | 
| | Database Error (User) Request | 
| | Database Error (Aggregate) Request | 
| | Successful user request | 
| | Unauthorized user request | 
| | Successful admin request | 
| | Unauthorized admin request | 
| | Group not found |
| | Category not found | 
| FR37| Successful User Delete Transaction | 
|  | Unauthorized User |
|  | User or transaction not found |
|  | Successful Admin transaction for different users |
|  | Missing transaction attributes |
|  | Database Error Transaction Request | 
|  | Transaction deleted by user | 
|  | Transaction deleted by admin |
|  | User not authorized |
|  | User not found |
|  | Transaction not found |
|  | Missing ID |
|  | FR38 | Successful Request |
|  | Unauthorized Request | 
|  | Invalid ID |
|  | Empty Request | 
|  | Database Error Request | 
|  | Transactions deleted by admin | 
|  | Unauthorized admin | 
|  | Invalid transaction | 
|  | Invalid ids | 
|  FR4   | -------------|
| FR41|  |
| FR42|  |
| FR43|  |
| FR44 |  |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage 

![coverage_results](./images/coverage_results.png) 





