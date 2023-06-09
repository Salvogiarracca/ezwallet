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
| 1 | Test #1 - wrong date format | handleDateFilterParams | Unit | WB - Statement Coverage |
| 2 | Test #2 - wrong body | handleDateFilterParams | Unit | WB - Statement Coverage |
| 3 | Test #3 - $gte | handleDateFilterParams | Unit | WB - Statement Coverage |
| 4 | Test #4 - $lte | handleDateFilterParams | Unit | WB - Statement Coverage |
| 5 | Test #5 - $gte and $lte | handleDateFilterParams | Unit | WB - Statement Coverage |
| 6 | Test #6 - upTo before from | handleDateFilterParams | Unit | WB - Statement Coverage |
| 7 | Test #7 - upTo and from - Invalid date | handleDateFilterParams | Unit | WB - Statement Coverage |
| 8 | Test #8 - upTo - Invalid date | handleDateFilterParams | Unit | WB - Statement Coverage |
| 9 | Test #9 - upTo - dd > 31 | handleDateFilterParams | Unit | WB - Statement Coverage |
| 10 | Test #10 - upTo - mm > 12 | handleDateFilterParams | Unit | WB - Statement Coverage |
| 11 | Test #11 - wrong leap year | handleDateFilterParams | Unit | WB - Statement Coverage |
| 12 | Test #12 - dd > 30 for april | handleDateFilterParams | Unit | WB - Statement Coverage |
| 13 | Test #13 - upTo before from | handleDateFilterParams | Unit | WB - Statement Coverage |
| 14 | Test #14 - upTo before from | handleDateFilterParams | Unit | WB - Statement Coverage |
| 15 | Simple authentication | verifyAuth | Unit | WB - Statement Coverage |
| 16 | Simple authentication: missing parameter in the access token error | verifyAuth | Unit | WB - Statement Coverage |
| 17 | Simple authentication: missing parameter in the refresh token error | verifyAuth | Unit | WB - Statement Coverage |
| 18 | Simple authentication: access token expired | verifyAuth | Unit | WB - Statement Coverage |
| 19 | Simple authentication: access token and refresh token expired | verifyAuth | Unit | WB - Statement Coverage |
| 20 | User authentication | verifyAuth | Unit | WB - Statement Coverage |
| 21 | User authentication: access token expired and correct username | verifyAuth | Unit | WB - Statement Coverage |
| 22 | User authentication: username of token doesnt match the request #1 | verifyAuth | Unit | WB - Statement Coverage |
| 23 | User authentication: username of token doesnt match the request #2 | verifyAuth | Unit | WB - Statement Coverage |
| 24 | User authentication: access token expired and incorrect username | verifyAuth | Unit | WB - Statement Coverage |
| 25 | Administrator authentication | verifyAuth | Unit | WB - Statement Coverage |
| 26 | Administrator authentication: access token expired and refresh role correct | verifyAuth | Unit | WB - Statement Coverage |
| 27 | Administrator authentication: role of token doesnt match the request #1 | verifyAuth | Unit | WB - Statement Coverage |
| 28 | Administrator authentication: role of token doesnt match the request #2 | verifyAuth | Unit | WB - Statement Coverage |
| 29 | Administrator authentication: access token expired and refresh role incorrect | verifyAuth | Unit | WB - Statement Coverage |
| 30 | Group authentication | verifyAuth | Unit | WB - Statement Coverage |
| 31 | Group authentication: access token expired and correct email | verifyAuth | Unit | WB - Statement Coverage |
| 32 | Group authentication: email not in emails group error #1 | verifyAuth | Unit | WB - Statement Coverage |
| 33 | Group authentication: email not in emails group error #2 | verifyAuth | Unit | WB - Statement Coverage |
| 34 | Group authentication: access token expired and incorrect email | verifyAuth | Unit | WB - Statement Coverage |
| 35 | Test #1, $gte | handleAmountFilterParams | Unit | WB - Statement Coverage |
| 36 | Test #2, $lte | handleAmountFilterParams | Unit | WB - Statement Coverage |
| 37 | Test #3, $gte and $lte | handleAmountFilterParams | Unit | WB - Statement Coverage |
| 38 | Test #4, NaN | handleAmountFilterParams | Unit | WB - Statement Coverage |
| 39 | Test #5, min bigger than max | handleAmountFilterParams | Unit | WB - Statement Coverage |
| 40 | Test #6, NaN (min) | handleAmountFilterParams | Unit | WB - Statement Coverage |
| 41 | Test #7, NaN (max) | handleAmountFilterParams | Unit | WB - Statement Coverage |
| 42 | should handle errors and return a 500 code | register | Unit | WB - Statement Coverage |
| 43 | should fail if email is not valid | register | Unit | WB - Statement Coverage |
| 44 | Regular user registration | register | Unit | WB - Statement Coverage |
| 45 | Missing parameters: Error test #1 | register | Unit | WB - Statement Coverage |
| 46 | Missing parameters: Error test #2 | register | Unit | WB - Statement Coverage |
| 47 | Already existing username: Error test #1 | register | Unit | WB - Statement Coverage |
| 48 | Already existing email: Error test #1 | register | Unit | WB - Statement Coverage |
| 49 | should handle errors and return a 500 code | registerAdmin | Unit | WB - Statement Coverage |
| 50 | should fail if email is not valid | registerAdmin | Unit | WB - Statement Coverage |
| 51 | Regular admin registration | registerAdmin | Unit | WB - Statement Coverage |
| 52 | Missing parameters: Error test #1 | registerAdmin | Unit | WB - Statement Coverage |
| 53 | Missing parameters: Error test #2 | registerAdmin | Unit | WB - Statement Coverage |
| 54 | Already existing admin username: Error test #1 | registerAdmin | Unit | WB - Statement Coverage |
| 55 | Already existing admin email: Error test #1 | registerAdmin | Unit | WB - Statement Coverage |
| 56 | Log in: Test #1 | login | Unit | WB - Statement Coverage |
| 57 | Log in error test: Missing parameters #1 | login | Unit | WB - Statement Coverage |
| 58 | Log in error test: Missing parameters #2 | login | Unit | WB - Statement Coverage |
| 59 | Invalid email | login | Unit | WB - Statement Coverage |
| 60 | Log in error test: User not found #1 | login | Unit | WB - Statement Coverage |
| 61 | Log in error test: Password mismatch #1 | login | Unit | WB - Statement Coverage |
| 62 | Log out: Test #1 | logout | Unit | WB - Statement Coverage |
| 63 | Log out error test: User not found #1 | logout | Unit | WB - Statement Coverage |
| 64 | Log out error test: User not found #2 | logout | Unit | WB - Statement Coverage |
| 65 | Successful User [createCategory] - Test #1 | createCategory | Unit | WB - Statement Coverage |
| 66 | Unauthorized User [createCategory] - Test #2 | createCategory | Unit | WB - Statement Coverage |
| 67 | Missing attributes [createCategory] - Test #3 | createCategory | Unit | WB - Statement Coverage |
| 68 | Empty string attribute [createCategory] - Test #4 | createCategory | Unit | WB - Statement Coverage |
| 69 | Existing category [createCategory] - Test #5 | createCategory | Unit | WB - Statement Coverage |
| 70 | Missing access token [createCategory] - Test #6 | createCategory | Unit | WB - Statement Coverage |
| 71 | Missing attributes (empty string) [updateCategory] - Test #1 | updateCategory | Unit | WB - Statement Coverage |
| 72 | Missing attributes (no body) [updateCategory] - Test #2 | updateCategory | Unit | WB - Statement Coverage |
| 73 | Category does not exist [updateCategory] - Test #3 | updateCategory | Unit | WB - Statement Coverage |
| 74 | New category type already defined [updateCategory] - Test #4 | updateCategory | Unit | WB - Statement Coverage |
| 75 | Admin auth [updateCategory] - Test #5 | updateCategory | Unit | WB - Statement Coverage |
| 76 | Success [updateCategory] - Test #6 | updateCategory | Unit | WB - Statement Coverage |
| 77 | Wrong color format [updateCategory] - Test #7 | updateCategory | Unit | WB - Statement Coverage |
| 78 | Mismatched types [updateCategory] - Test #8 | updateCategory | Unit | WB - Statement Coverage |
| 79 | No access token [updateCategory] - Test #9 | updateCategory | Unit | WB - Statement Coverage |
| 80 | Missing attributes [deleteCategory] - Test #1 | deleteCategory | Unit | WB - Statement Coverage |
| 81 | Only one category [deleteCategory] - Test #2 | deleteCategory | Unit | WB - Statement Coverage |
| 82 | Empty string [deleteCategory] - Test #3 | deleteCategory | Unit | WB - Statement Coverage |
| 83 | Category does not exist [deleteCategory] - Test #4 | deleteCategory | Unit | WB - Statement Coverage |
| 84 | Success N>T [deleteCategory] - Test #5 | deleteCategory | Unit | WB - Statement Coverage |
| 85 | Success N=T [deleteCategory] - Test #6 | deleteCategory | Unit | WB - Statement Coverage |
| 86 | Unauthorized [deleteCategory] - Test #7 | deleteCategory | Unit | WB - Statement Coverage |
| 87 | Empty array [deleteCategory] - Test #8 | deleteCategory | Unit | WB - Statement Coverage |
| 88 | Unauthorized (no access token) [deleteCategory] - Test #9 | deleteCategory | Unit | WB - Statement Coverage |
| 89 | Fail N<T [deleteCategory] - Test #10 | deleteCategory | Unit | WB - Statement Coverage |
| 90 | Successful Request [getCategories] - Test #1 | getCategories | Unit | WB - Statement Coverage |
| 91 | Unauthorized Request [getCategories] - Test #2 | getCategories | Unit | WB - Statement Coverage |
| 92 | Empty Request [getCategories] - Test #3 | getCategories | Unit | WB - Statement Coverage |
| 93 | Unauthorized Request (no accessToken) [getCategories] - Test #4 | getCategories | Unit | WB - Statement Coverage |
| 94 | Generic error [getCategories] - Test #5 | getCategories | Unit | WB - Statement Coverage |
| 95 | Successful transaction creation by user [createTransaction] - Unit Test #1 | createTransaction | Unit | WB - Statement Coverage |
| 96 | Unauthorized transaction creation by user [createTransaction] - Unit Test #2 | createTransaction | Unit | WB - Statement Coverage |
| 97 | Different user request by user [createTransaction] - Unit Test #3 | createTransaction | Unit | WB - Statement Coverage |
| 98 | Successful admin transaction creation for different user [createTransaction] - Unit Test #4 | createTransaction | Unit | WB - Statement Coverage |
| 99 | Invalid parameters [createTransaction] - Unit Test #5 | createTransaction | Unit | WB - Statement Coverage |
| 100 | Database Error Transaction Request [createTransaction] - Unit Test #6 | createTransaction | Unit | WB - Statement Coverage |
| 101 | User or Category not found [createTransaction] - Unit Test #7 | createTransaction | Unit | WB - Statement Coverage |
| 102 | Successful Request [getAllTransactions] - Unit Test #1 | getAllTransactions | Unit | WB - Statement Coverage |
| 103 | Unauthorized Request [getAllTransactions] - Unit Test #2 | getAllTransactions | Unit | WB - Statement Coverage |
| 104 | Empty Request [getAllTransactions] - Unit Test #3 | getAllTransactions | Unit | WB - Statement Coverage |
| 105 | Database Error Request [getAllTransactions] - Unit Test #4 | getAllTransactions | Unit | WB - Statement Coverage |
| 106 | Successful User Request [getTransactionsByUser] - Unit Test #1 | getTransactionsByUser | Unit | WB - Statement Coverage |
| 107 | Unauthorized User Request [getTransactionsByUser] - Unit Test #2 | getTransactionsByUser | Unit | WB - Statement Coverage |
| 108 | Successful Admin Request [getTransactionsByUser] - Unit Test #3 | getTransactionsByUser | Unit | WB - Statement Coverage |
| 109 | Unauthorized Admin Request [getTransactionsByUser] - Unit Test #3 | getTransactionsByUser | Unit | WB - Statement Coverage |
| 110 | Inexistent User Request [getTransactionsByUser] - Unit Test #4 | getTransactionsByUser | Unit | WB - Statement Coverage |
| 111 | Database Error Request [getTransactionsByUser] - Unit Test #5 | getTransactionsByUser | Unit | WB - Statement Coverage |
| 112 | Successful User Request [getTransactionsByUserByCategory] - Unit Test #1 | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
| 113 | Unauthorized User Request [getTransactionsByUserByCategory] - Unit Test #2 | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
| 114 | Successful Admin Request [getTransactionsByUserByCategory] - Unit Test #3 | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
| 115 | Unauthorized Admin Request [getTransactionsByUserByCategory] - Unit Test #4 | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
| 116 | User not found Request [getTransactionsByUserByCategory] - Unit Test #5 | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
| 117 | Category not found [getTransactionsByUserByCategory] - Unit Test #1 | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
| 118 | Database Error Request [getTransactionsByUserByCategory] - Unit Test #6 | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
| 119 | Successful User Request [getTransactionsByGroup] - Unit Test #1 | getTransactionsByGroup | Unit | WB - Statement Coverage |
| 120 | Unauthorized User Request [getTransactionsByGroup] - Unit Test #2 | getTransactionsByGroup | Unit | WB - Statement Coverage |
| 121 | Successful Admin Request [getTransactionsByGroup] - Unit Test #3 | getTransactionsByGroup | Unit | WB - Statement Coverage |
| 122 | Unauthorized Admin Request [getTransactionsByGroup] - Unit Test #4 | getTransactionsByGroup | Unit | WB - Statement Coverage |
| 123 | Inexistent Group Request [getTransactionsByGroup] - Unit Test #5 | getTransactionsByGroup | Unit | WB - Statement Coverage |
| 124 | Database Error (Group) Request [getTransactionsByGroup] - Unit Test #6 | getTransactionsByGroup | Unit | WB - Statement Coverage |
| 125 | Database Error (User) Request [getTransactionsByGroup] - Unit Test #7 | getTransactionsByGroup | Unit | WB - Statement Coverage |
| 126 | Database Error (Aggregate) Request [getTransactionsByGroup] - Unit Test #8 | getTransactionsByGroup | Unit | WB - Statement Coverage |
| 127 | Successful User Request [getTransactionsByGroupByCategory] - Unit Test #1 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 128 | Unauthorized User Request [getTransactionsByGroupByCategory] - Unit Test #2 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 129 | Successful Admin Request [getTransactionsByGroupByCategory] - Unit Test #3 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 130 | Unauthorized Admin Request [getTransactionsByGroupByCategory] - Unit Test #4 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 131 | Group not found Request [getTransactionsByGroupByCategory] - Unit Test #5 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 132 | Category not found Request [getTransactionsByGroupByCategory] - Unit Test #1 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 133 | Database Error (Group) Request [getTransactionsByGroupByCategory] - Unit Test #6 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 134 | Database Error (User) Request [getTransactionsByGroupByCategory] - Unit Test #7 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 135 | Database Error (Aggregate) Request [getTransactionsByGroupByCategory] - Unit Test #8 | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
| 136 | Successful User Delete Transaction [deleteTransaction] - Unit Test #1 | deleteTransaction | Unit | WB - Statement Coverage |
| 137 | Unauthorized User [deleteTransaction] - Unit Test #2 | deleteTransaction | Unit | WB - Statement Coverage |
| 138 | User or transaction not found [deleteTransaction] - Unit Test #3 | deleteTransaction | Unit | WB - Statement Coverage |
| 139 | Successful Admin transaction for different users [deleteTransaction] - Unit Test #4 | deleteTransaction | Unit | WB - Statement Coverage |
| 140 | Missing transaction attributes [deleteTransaction] - Unit Test #5 | deleteTransaction | Unit | WB - Statement Coverage |
| 141 | Database Error Transaction Request [deleteTransaction] - Unit Test #6 | deleteTransaction | Unit | WB - Statement Coverage |
| 142 | Successful Request [deleteTransactions] - Unit Test #1 | deleteTransactions | Unit | WB - Statement Coverage |
| 143 | Unauthorized Request [deleteTransactions] - Unit Test #2 | deleteTransactions | Unit | WB - Statement Coverage |
| 144 | Invalid ID [deleteTransactions] - Unit Test #3 | deleteTransactions | Unit | WB - Statement Coverage |
| 145 | Empty Request [deleteTransactions] - Unit Test #3 | deleteTransactions | Unit | WB - Statement Coverage |
| 146 | Database Error Request [deleteTransactions] - Unit Test #4 | deleteTransactions | Unit | WB - Statement Coverage |
| 147 | should handle errors and return a 500 code | getUsers | Unit | WB - Statement Coverage |
| 148 | should return empty list if there are no users | getUsers | Unit | WB - Statement Coverage |
| 149 | should retrieve list of all users | getUsers | Unit | WB - Statement Coverage |
| 150 | should be unauthorized if caller is not admin | getUsers | Unit | WB - Statement Coverage |
| 151 | should handle errors and return a 500 code | getUser | Unit | WB - Statement Coverage |
| 152 | should return caller user info | getUser | Unit | WB - Statement Coverage |
| 153 | should return info of requested user if caller is admin | getUser | Unit | WB - Statement Coverage |
| 154 | should fail if user does not exist | getUser | Unit | WB - Statement Coverage |
| 155 | should fail if Regular user requests other users info | getUser | Unit | WB - Statement Coverage |
| 156 | should handle errors and return a 500 code | createGroup | Unit | WB - Statement Coverage |
| 157 | should create a new group | createGroup | Unit | WB - Statement Coverage |
| 158 | should fail if user is not authenticated | createGroup | Unit | WB - Statement Coverage |
| 159 | should fail if missing attributes | createGroup | Unit | WB - Statement Coverage |
| 160 | should fail if name is an empty string | createGroup | Unit | WB - Statement Coverage |
| 161 | should fail if an email is an empty string or invalid | createGroup | Unit | WB - Statement Coverage |
| 162 | should fail if calling user is already in a group | createGroup | Unit | WB - Statement Coverage |
| 163 | should fail if all the members either do not exist or are already in a group | createGroup | Unit | WB - Statement Coverage |
| 164 | should fail if a group with the same name already exists | createGroup | Unit | WB - Statement Coverage |
| 165 | should handle errors and return a 500 code | getGroups | Unit | WB - Statement Coverage |
| 166 | should fail if caller is not an Admin | getGroups | Unit | WB - Statement Coverage |
| 167 | should return all the groups | getGroups | Unit | WB - Statement Coverage |
| 168 | should handle errors and return a 500 code | getGroup | Unit | WB - Statement Coverage |
| 169 | should return own group info | getGroup | Unit | WB - Statement Coverage |
| 170 | should return any group info if Admin | getGroup | Unit | WB - Statement Coverage |
| 171 | should fail if group does not exist | getGroup | Unit | WB - Statement Coverage |
| 172 | should fail if not authenticated as Group | getGroup | Unit | WB - Statement Coverage |
| 173 | should handle errors and return a 500 code | addToGroup | Unit | WB - Statement Coverage |
| 174 | should add users to own group (User) | addToGroup | Unit | WB - Statement Coverage |
| 175 | should add users to a group (Admin) | addToGroup | Unit | WB - Statement Coverage |
| 176 | should not add users to a group and suggests to change api (Admin) | addToGroup | Unit | WB - Statement Coverage |
| 177 | should fail if user is not part of the group | addToGroup | Unit | WB - Statement Coverage |
| 178 | should fail if insert is called by a Regular user | addToGroup | Unit | WB - Statement Coverage |
| 179 | should fail if group does not exist | addToGroup | Unit | WB - Statement Coverage |
| 180 | should fail if missing fields in the body | addToGroup | Unit | WB - Statement Coverage |
| 181 | should fail if all the members either do not exist or are already in a group (Group) | addToGroup | Unit | WB - Statement Coverage |
| 182 | should fail if all the members either do not exist or are already in a group (Admin) | addToGroup | Unit | WB - Statement Coverage |
| 183 | should fail if at least one email is not in a valid format or is an empty string | addToGroup | Unit | WB - Statement Coverage |
| 184 | should handle errors and return a 500 code | removeFromGroup | Unit | WB - Statement Coverage |
| 185 | should remove a member of own group (User) | removeFromGroup | Unit | WB - Statement Coverage |
| 186 | should remove a member of a group (Admin) | removeFromGroup | Unit | WB - Statement Coverage |
| 187 | should not add users to a group and suggests to change api (Admin) | removeFromGroup | Unit | WB - Statement Coverage |
| 188 | should fail if the user is not part of the group (Group) | removeFromGroup | Unit | WB - Statement Coverage |
| 189 | should fail if user is not an admin | removeFromGroup | Unit | WB - Statement Coverage |
| 190 | should fail if group does not exist | removeFromGroup | Unit | WB - Statement Coverage |
| 191 | shoud fail if request body does not contain all the necessary attributes | removeFromGroup | Unit | WB - Statement Coverage |
| 192 | should fail if at least one email is an empty string is not valid | removeFromGroup | Unit | WB - Statement Coverage |
| 193 | should fail if all the members either do not exist or not in the group | removeFromGroup | Unit | WB - Statement Coverage |
| 194 | should fail if group contains only one member | removeFromGroup | Unit | WB - Statement Coverage |
| 195 | should handle errors and return a 500 code | deleteUser | Unit | WB - Statement Coverage |
| 196 | should fail if the user is not an admin | deleteUser | Unit | WB - Statement Coverage |
| 197 | shoud delete user succesfully and delete the group because last one | deleteUser | Unit | WB - Statement Coverage |
| 198 | should fail if missing attributes in the body | deleteUser | Unit | WB - Statement Coverage |
| 199 | should fail if email is not valid or is an empty string | deleteUser | Unit | WB - Statement Coverage |
| 200 | should fail if email do not belongs to any user in the database | deleteUser | Unit | WB - Statement Coverage |
| 201 | should delete the user and update the database if is not the last one | deleteUser | Unit | WB - Statement Coverage |
| 202 | should delete the user that not belongs to any group | deleteUser | Unit | WB - Statement Coverage |
| 203 | should handle errors and return a 500 code | deleteGroup | Unit | WB - Statement Coverage |
| 204 | should fail if user is not an admin | deleteGroup | Unit | WB - Statement Coverage |
| 205 | should fail if missing name or is an empty string | deleteGroup | Unit | WB - Statement Coverage |
| 206 | should fail if group does not exist | deleteGroup | Unit | WB - Statement Coverage |
| 207 | should delete the group | deleteGroup | Unit | WB - Statement Coverage |
| 208 | Dummy test, change it | handleDateFilterParams | Integration | WB - Statement Coverage |
| 209 | Simple authentication | verifyAuth | Integration | WB - Statement Coverage |
| 210 | Simple authentication: missing parameter in the access token error | verifyAuth | Integration | WB - Statement Coverage |
| 211 | Simple authentication: missing parameter in the refresh token error | verifyAuth | Integration | WB - Statement Coverage |
| 212 | Simple authentication: missing parameter in the refresh token error | verifyAuth | Integration | WB - Statement Coverage |
| 213 | User authentication | verifyAuth | Integration | WB - Statement Coverage |
| 214 | User authentication: access token expired and correct username | verifyAuth | Integration | WB - Statement Coverage |
| 215 | User authentication: username of token doesnt match the request #1 | verifyAuth | Integration | WB - Statement Coverage |
| 216 | User authentication: username of token doesnt match the request #2 | verifyAuth | Integration | WB - Statement Coverage |
| 217 | User authentication: access token expired and incorrect username | verifyAuth | Integration | WB - Statement Coverage |
| 218 | Administrator authentication | verifyAuth | Integration | WB - Statement Coverage |
| 219 | Administrator authentication: access token expired and correct role | verifyAuth | Integration | WB - Statement Coverage |
| 220 | Administrator authentication: role of token doesnt match the request #1 | verifyAuth | Integration | WB - Statement Coverage |
| 221 | Administrator authentication: role of token doesnt match the request #2 | verifyAuth | Integration | WB - Statement Coverage |
| 222 | Administrator authentication: access token expired and incorrect role | verifyAuth | Integration | WB - Statement Coverage |
| 223 | Group authentication | verifyAuth | Integration | WB - Statement Coverage |
| 224 | Group authentication: access token expired and correct email | verifyAuth | Integration | WB - Statement Coverage |
| 225 | Group authentication: email not in emails group error #1 | verifyAuth | Integration | WB - Statement Coverage |
| 226 | Group authentication: email not in emails group error #2 | verifyAuth | Integration | WB - Statement Coverage |
| 227 | Group authentication: access token expired and incorrect email | verifyAuth | Integration | WB - Statement Coverage |
| 228 | Dummy test, change it | handleAmountFilterParams | Integration | WB - Statement Coverage |
| 229 | Regular user registration: Test #1 | register | Integration | WB - Statement Coverage |
| 230 | Missing parameters: Error test #1 | register | Integration | WB - Statement Coverage |
| 231 | Missing parameters: Error test #2 | register | Integration | WB - Statement Coverage |
| 232 | Already existing username: Error test #1 | register | Integration | WB - Statement Coverage |
| 233 | Already existing email: Error test #1 | register | Integration | WB - Statement Coverage |
| 234 | Regular admin registration: Test #1 | registerAdmin | Integration | WB - Statement Coverage |
| 235 | Missing parameters: Error test #1 | registerAdmin | Integration | WB - Statement Coverage |
| 236 | Missing parameters: Error test #2 | registerAdmin | Integration | WB - Statement Coverage |
| 237 | Already existing admin username Pippo: Error test #1 | registerAdmin | Integration | WB - Statement Coverage |
| 238 | Already existing admin email: Error test #1 | registerAdmin | Integration | WB - Statement Coverage |
| 239 | Log in: Test #1 | login | Integration | WB - Statement Coverage |
| 240 | Log in error test: Missing parameters #1 | login | Integration | WB - Statement Coverage |
| 241 | Log in error test: Missing parameters #2 | login | Integration | WB - Statement Coverage |
| 242 | Log in error test: User not found #1 | login | Integration | WB - Statement Coverage |
| 243 | Log in error test: Password mismatch #1 | login | Integration | WB - Statement Coverage |
| 244 | Log out: Test #1 | logout | Integration | WB - Statement Coverage |
| 245 | Log out error test: User not found #1 | logout | Integration | WB - Statement Coverage |
| 246 | Log out error test: User not found #2 | logout | Integration | WB - Statement Coverage |
| 247 | Category created by admin | createCategory | Integration | WB - Statement Coverage |
| 248 | Category created by unauthorized user | createCategory | Integration | WB - Statement Coverage |
| 249 | Missing attributes #1 [empty string] | createCategory | Integration | WB - Statement Coverage |
| 250 | Category already exist | createCategory | Integration | WB - Statement Coverage |
| 251 | Missing attributes #2 [missing part] | createCategory | Integration | WB - Statement Coverage |
| 252 | No access token | createCategory | Integration | WB - Statement Coverage |
| 253 | Category created by unauthorized user | updateCategory | Integration | WB - Statement Coverage |
| 254 | Missing attributes #1 [empty string] | updateCategory | Integration | WB - Statement Coverage |
| 255 | Missing attributes #2 [missing argument] | updateCategory | Integration | WB - Statement Coverage |
| 256 | New type refers to existing category | updateCategory | Integration | WB - Statement Coverage |
| 257 | Route exists, category doesnt | updateCategory | Integration | WB - Statement Coverage |
| 258 | Success | updateCategory | Integration | WB - Statement Coverage |
| 259 | Missing access token | updateCategory | Integration | WB - Statement Coverage |
| 260 | Category created by unauthorized user | deleteCategory | Integration | WB - Statement Coverage |
| 261 | Empty array | deleteCategory | Integration | WB - Statement Coverage |
| 262 | Missing array | deleteCategory | Integration | WB - Statement Coverage |
| 263 | Empty string in array | deleteCategory | Integration | WB - Statement Coverage |
| 264 | One category in array does not exist | deleteCategory | Integration | WB - Statement Coverage |
| 265 | One category in db | deleteCategory | Integration | WB - Statement Coverage |
| 266 | Success N>T | deleteCategory | Integration | WB - Statement Coverage |
| 267 | Success N==T | deleteCategory | Integration | WB - Statement Coverage |
| 268 | Category created by unauthorized user (missing accessToken) | deleteCategory | Integration | WB - Statement Coverage |
| 269 | Fail N<T | deleteCategory | Integration | WB - Statement Coverage |
| 270 | Retrieved all categories | getCategories | Integration | WB - Statement Coverage |
| 271 | Unauthorized user | getCategories | Integration | WB - Statement Coverage |
| 272 | Retrieved empty array | getCategories | Integration | WB - Statement Coverage |
| 273 | No access token | getCategories | Integration | WB - Statement Coverage |
| 274 | Transaction created by user [createTransaction] - Integration Test #1 | createTransaction | Integration | WB - Statement Coverage |
| 275 | Different url [createTransaction] - Integration Test #2 | createTransaction | Integration | WB - Statement Coverage |
| 276 | Invalid parameters [createTransaction] - Integration Test #3 | createTransaction | Integration | WB - Statement Coverage |
| 277 | Category dosent exist [createTransaction] - Integration Test #4 | createTransaction | Integration | WB - Statement Coverage |
| 278 | Unauthorized User [createTransaction] - Integration Test #5 | createTransaction | Integration | WB - Statement Coverage |
| 279 | Transaction created by admin [createTransaction] - Integration Test #6 | createTransaction | Integration | WB - Statement Coverage |
| 280 | Transaction for another user created by admin [createTransaction] - Integration Test #7 | createTransaction | Integration | WB - Statement Coverage |
| 281 | Retrieved all transactions [getAllTransactions] - Integration Test #1 | getAllTransactions | Integration | WB - Statement Coverage |
| 282 | Unauthorized admin [getAllTransactions] - Integration Test #2 | getAllTransactions | Integration | WB - Statement Coverage |
| 283 | Successful user request [getTransactionsByUser] - Integration Test #1 | getTransactionsByUser | Integration | WB - Statement Coverage |
| 284 | Unauthorized user request [getTransactionsByUser] - Integration Test #2 | getTransactionsByUser | Integration | WB - Statement Coverage |
| 285 | Successful admin request [getTransactionsByUser] - Integration Test #3 | getTransactionsByUser | Integration | WB - Statement Coverage |
| 286 | Unauthorized admin request [getTransactionsByUser] - Integration Test #4 | getTransactionsByUser | Integration | WB - Statement Coverage |
| 287 | User not found [getTransactionsByUser] - Integration Test #5 | getTransactionsByUser | Integration | WB - Statement Coverage |
| 288 | Successful user request [getTransactionsByUserByCategory] - Integration Test #1 | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
| 289 | Unauthorized user request [getTransactionsByUserByCategory] - Integration Test #2 | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
| 290 | Successful admin request [getTransactionsByUserByCategory] - Integration Test #3 | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
| 291 | Unauthorized admin request [getTransactionsByUserByCategory] - Integration Test #4 | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
| 292 | User not found request [getTransactionsByUserByCategory] - Integration Test #5 | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
| 293 | Category not found request [getTransactionsByUserByCategory] - Integration Test #6 | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
| 294 | Successful user request [getTransactionsByGroup] - Integration Test #1 | getTransactionsByGroup | Integration | WB - Statement Coverage |
| 295 | Unauthorized user request [getTransactionsByGroup] - Integration Test #2 | getTransactionsByGroup | Integration | WB - Statement Coverage |
| 296 | Successful admin request [getTransactionsByGroup] - Integration Test #3 | getTransactionsByGroup | Integration | WB - Statement Coverage |
| 297 | Unauthorized admin request [getTransactionsByGroup] - Integration Test #4 | getTransactionsByGroup | Integration | WB - Statement Coverage |
| 298 | Group not found [getTransactionsByGroup] - Integration Test #5 | getTransactionsByGroup | Integration | WB - Statement Coverage |
| 299 | Successful user request [getTransactionsByGroupByCategory] - Integration Test #1 | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
| 300 | Unauthorized user request [getTransactionsByGroupByCategory] - Integration Test #2 | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
| 301 | Successful admin request [getTransactionsByGroupByCategory] - Integration Test #3 | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
| 302 | Unauthorized admin request [getTransactionsByGroupByCategory] - Integration Test #4 | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
| 303 | Group not found request [getTransactionsByGroupByCategory] - Integration Test #5 | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
| 304 | Category not found request [getTransactionsByGroupByCategory] - Integration Test #6 | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
| 305 | Transaction deleted by user [deleteTransaction] - Integration Test #1 | deleteTransaction | Integration | WB - Statement Coverage |
| 306 | Transaction deleted by admin [deleteTransaction] - Integration Test #2 | deleteTransaction| Integration | WB - Statement Coverage |
| 307 | User not authorized [deleteTransaction] - Integration Test #3 | deleteTransaction | Integration | WB - Statement Coverage |
| 308 | User not found [deleteTransaction] - Integration Test #4 | deleteTransaction | Integration | WB - Statement Coverage |
| 309 | Transaction not found [deleteTransaction] - Integration Test #5 | deleteTransaction | Integration | WB - Statement Coverage |
| 310 | Missing ID [deleteTransaction] - Integration Test #6 | deleteTransaction | Integration | WB - Statement Coverage |
| 311 | Transactions deleted by admin [deleteTransactions] - Integration Test #1 | deleteTransactions | Integration | WB - Statement Coverage |
| 312 | Unauthorized admin [deleteTransactions] - Integration Test #2 | deleteTransactions | Integration | WB - Statement Coverage |
| 313 | Invalid transaction [deleteTransactions] - Integration Test #3 | deleteTransactions | Integration | WB - Statement Coverage |
| 314 | Invalid ids [deleteTransactions] - Integration Test #4 | deleteTransactions | Integration | WB - Statement Coverage |
| 315 | should return empty list if ther are no users | getUsers | Integration | WB - Statement Coverage |
| 316 | should return list of all users | getUsers | Integration | WB - Statement Coverage |
| 317 | should be not authorized if no cookies are provided | getUser | Integration | WB - Statement Coverage |
| 318 | should be not authorized if asking for other user info (Regular user) | getUser | Integration | WB - Statement Coverage |
| 319 | should get own user info | getUser | Integration | WB - Statement Coverage |
| 320 | should fail if resquested user does not exist (Admin) | getUser | Integration | WB - Statement Coverage |
| 321 | should return other user data (Admin) | getUser | Integration | WB - Statement Coverage |
| 322 | should return unauthorized if missing cookies | createGroup | Integration | WB - Statement Coverage |
| 323 | should crete a new group | createGroup | Integration | WB - Statement Coverage |
| 324 | should fail if only the caller is a valid user to add and all the members either do not exist or are already in a group | createGroup | Integration | WB - Statement Coverage |
| 325 | should fail if at leas one email is not valid or an empty string | createGroup | Integration | WB - Statement Coverage |
| 326 | should fail if the group already exists | createGroup | Integration | WB - Statement Coverage |
| 327 | should return unauthorized if missing cookies | getGroups | Integration | WB - Statement Coverage |
| 328 | should return unauthorized if called by a Regular user | getGroups | Integration | WB - Statement Coverage |
| 329 | should return an empty list if no groups are present | getGroups | Integration | WB - Statement Coverage |
| 330 | should return a list of groups | getGroups | Integration | WB - Statement Coverage |
| 331 | should be unauthorized if no cookies ar provided | getGroup | Integration | WB - Statement Coverage |
| 332 | should be unauthorized if user does not belongs to the group | getGroup | Integration | WB - Statement Coverage |
| 333 | should fail if requested group does not exist | getGroup | Integration | WB - Statement Coverage |
| 334 | should be authorized also if he does not belong to the group (Admin) | getGroup | Integration | WB - Statement Coverage |
| 335 | should fail if not admin (insert route) | addToGroup | Integration | WB - Statement Coverage |
| 336 | should fail if user does not belongs to the group | addToGroup | Integration | WB - Statement Coverage |
| 337 | should fail if body is missng information | addToGroup | Integration | WB - Statement Coverage |
| 338 | should fail if group does not exist | addToGroup | Integration | WB - Statement Coverage |
| 339 | should return the group with added members (Admin route) | addToGroup | Integration | WB - Statement Coverage |
| 340 | should fail if group does not exist | removeFromGroup | Integration | WB - Statement Coverage |
| 341 | should fail if missing emails in body request | removeFromGroup | Integration | WB - Statement Coverage |
| 342 | should fail if user tries to remove member of another group | removeFromGroup | Integration | WB - Statement Coverage |
| 343 | should fail if user is not an Admin (pull route) | removeFromGroup | Integration | WB - Statement Coverage |
| 344 | should fail if all the members either do not exist or not in the group | removeFromGroup | Integration | WB - Statement Coverage |
| 345 | should fail if the group has only one member before deleting someone | removeFromGroup | Integration | WB - Statement Coverage |
| 346 | should delete some of requested users | removeFromGroup | Integration | WB - Statement Coverage |
| 347 | should fail if user is not authenticated | deleteUser | Integration | WB - Statement Coverage |
| 348 | should fail if user is not an admin | deleteUser | Integration | WB - Statement Coverage |
| 349 | should delete the requested user that belongs to a group and should remove the group as well | deleteUser | Integration | WB - Statement Coverage |
| 350 | should delete the requested user | deleteUser | Integration | WB - Statement Coverage |
| 351 | should fail if not authenticated | deleteGroup | Integration | WB - Statement Coverage |
| 352 | should fail if user is not an admin | deleteGroup | Integration | WB - Statement Coverage |
| 353 | should fail if the body does not contain all the necessary attributes | deleteGroup | Integration | WB - Statement Coverage |
| 354 | should fail if group not found | deleteGroup | Integration | WB - Statement Coverage |
| 355 | should delete the group | deleteGroup | Integration | WB - Statement Coverage |

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





