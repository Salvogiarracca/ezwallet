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

     <report the here the dependency graph of EzWallet>
     
# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above)>
    <One step will  correspond to API testing, or testing unit route.js>
    


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
| Inexistent User or Category Request | getTransactionsByUserByCategory | Unit | WB/ statement coverage |
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
| Inexistent Group or category Request | getTransactionsByGroupByCategory | Unit | WB/ statement coverage |
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
| FR33|  |
| FR34|  |
| FR35|  |
| FR36|  |
| FR37|  |
| FR38|  |
|  FR4   | -------------|
| FR41|  |
| FR42|  |
| FR43|  |
| FR44 |  |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage 






