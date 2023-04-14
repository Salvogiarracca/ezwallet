# Requirements Document - current EZWallet

Date: 12-04-2023

Version: V1 - description of EZWallet in CURRENT form (as received by teachers)

 
| Version number | Change |
| :-----------------: |:-----------:|
| 1.1 | 2 | 


# Contents

- [Informal description](#informal-description)
- [Business model](#business-model)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
	
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	+ [Functional Requirements](#functional-requirements)
	+ [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	+ [Use case diagram](#use-case-diagram)
	+ [Use cases](#use-cases)
    	+ [Relevant scenarios](#relevant-scenarios)
- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)

# Informal description
EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.

# Business Model
This application is being developed as an open-source project. The project aims to become a self-hosted solution for users who want to manage their expenses without relying on any commercial product that may be more at risk of potential data leaks or, without the user knowing, may sell their information online. 

The user who sets up the application has full rights on transactions and categories created and can grant more privileges to normal users. Normal users can login and track their expense, eventually inside a group composed by other individuals.

The community behind the project is composed of developers that work on the application in their free time. To support them a small bank account has been setted up to accept donations by users.


# Stakeholders

| Stakeholder name  | Description | 
| :----------------- |:-----------|
| User | Someone who will use the application to keep track of his expenses | 
| Administrator | Developer who has special privileges over the functions performed by the application (currently the system doesn't distinguish between roles so it isn't an actor) |

# Context Diagram and interfaces

## Context Diagram
\<Define here Context diagram using UML use case diagram>

EZWallet

\<actors are a subset of stakeholders>

User

## Interfaces

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------| -----|
| User | Smartphone | GUI (tdb + key functions: managing transactions and categories) |

# Stories and personas

Persona 1 (P1): female, 23 y.o., student, low income, not married. <br>
Interacts with the application through a web browser on her phone.

Persona 2 (P2): male, 51 y.o., worker, high income, married. <br>
Interacts with the application through a web browser on his laptop.

Persona 3 (P3): male, old age, retired, low income, married. <br>
Interacts with the application through a web browser on his desktop computer.

Persona 4 (P4): female, 28 y.o., worker, medium income, not married.<br>
Interacts with the application through a web browser on her phone.

Persona 5 (P5): other, young age, part-time worker, low income, not married.<br>
Interacts with the application through a web browser on its phone.

Persona 6 (P6): male, young age, worker, medium income, not married.<br>
Interacts with the application through a web browser on his phone.

# Functional and non functional requirements

## Functional Requirements

| ID        | Description  |
| ------------- |:-------------| 
| FR1 | Manage transactions/expenses |
| FR2 | Manage categories |
| FR3 | Manage users | 
| FR4 | Authentication |

## Non Functional Requirements

| ID | Type (efficiency, reliability, ..) | Description | Refers to |
| ------------- |:-------------| :-----| :-----|
| NFR1 | Usability | Core functions for users should be used with no training, only with previous experience with smartphones | FR1, FR2, FR4 |
| NFR2 | Availability | Max. Server downtime 1 hr / year | FR1, FR2, FR3, FR4 |
| NFR3 | Security | Authorize users access | FR3 |
| NFR4 | Efficiency | All functions should be completed in less than 2 seconds | FR1, FR2, FR3, FR4 | 
| NFR5 | Portability | Application can be run independently of the operating system/device by having a web interface | FR1, FR2, FR3, FR4 | 
| NFR6 | Correctness | Transactions should be managed correctly without errors to avoid having wrong informations recorded | FR1 | 


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


\<next describe here each use case in the UCD>
### UC1: Login
| User       |  |
| ------------- |:-------------| 
|  Precondition   | User must have an account |
|  Post condition | User is authorized |
|  Nominal Scenario | Scenario 1.1  |
|  Variants     | - |
|  Exceptions     | User is already logged in; User’s account doesn't exist; Wrong credentials |

| Scenario 1.1 | |
| ------------- |:-------------| 
|  Precondition     | User must have an account |
|  Post condition     | User is authorized |
| Step        | Description  |
|  1 | User asks to login |  
|  2 | System asks email and password |
|  3 | User enters email and password |
|  4 | System checks, account name and password correct |
|  5 | Server sends two cookies to the client that contain an access and a refresh token respectively: <br> - Access token has an expiration time of one hour <br> - Refresh token has an expiration time of seven days |

### UC2: Register
| User        |  |
| ------------- |:-------------| 
|  Precondition   | User must not have an account |
|  Post condition | Account is created |
|  Nominal Scenario | Scenario 2.1  |
|  Variants     | - |
|  Exceptions     | User is already registered; Account not created |

| Scenario 2.1 | |
| ------------- |:-------------| 
|  Precondition     | User must not have an account |
|  Post condition     | Account is created |
| Step        | Description  |
|  1 | User asks to sign up |  
|  2 | System asks for email, checks if email is available |
|  3 | System asks for password and username |

### UC3: Logout
| User        |  |
| ------------- |:-------------| 
|  Precondition   | User must have an account and must be logged in |
|  Post condition | User is logged out |
|  Nominal Scenario | Scenario 3.1  |
|  Variants     | - |
|  Exceptions     | User already logged out; User’s session expired (7 days); User not found |

| Scenario 3.1 | |
| ------------- |:-------------| 
|  Precondition     | User must have an account and must be logged in |
|  Post condition     | User is logged out |
| Step        | Description  |
|  1 | User asks to log out |  
|  2 | User’s device checks if access and refresh tokens exist |
|  3 | System checks if refresh token exists |
|  4 | System erases access and refresh tokens from user’s account |

### UC4: Create a transaction
| User        |  |
| ------------- |:-------------| 
|  Precondition   | User must be logged in |
|  Post condition | Transaction created |
|  Nominal Scenario | Scenario 4.1  |
|  Variants     | - |
|  Exceptions     | User not authorized |

| Scenario 4.1 | |
| ------------- |:-------------| 
|  Precondition | User must be logged in |
|  Post condition | Transaction created |
| Step        | Description  |
|  1 | User enters name, amount, and type |  
|  2 | System creates new transaction |

### UC5: Delete a transaction
| User        |  |
| ------------- |:-------------| 
|  Precondition   | User must be logged in |
|  Post condition | Transaction deleted |
|  Nominal Scenario | Scenario 5.1  |
|  Variants     | - |
|  Exceptions     | User not authorized  |

| Scenario 5.1 | |
| ------------- |:-------------| 
|  Precondition | User must be logged in |
|  Post condition | Transaction deleted |
| Step        | Description  |
|  1 | User enters transaction |  
|  2 | System deletes transaction |

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships> 

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >




