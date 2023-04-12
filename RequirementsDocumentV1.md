# Requirements Document - current EZWallet

Date: 12-04-2023

Version: V1 - description of EZWallet in CURRENT form (as received by teachers)

 
| Version number | Change |
| ----------------- |:-----------|
| 1.0 | ? | 


# Contents

- [Informal description](#informal-description)
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



# Stakeholders


| Stakeholder name  | Description | 
| :----------------- |:-----------|
| User | Someone who will use the application to keep track of his expenses | 
| Administrator | User with more privileges |
| COO | Person who guide the company's operations based on an analysis of the system |

# Context Diagram and interfaces

## Context Diagram
\<Define here Context diagram using UML use case diagram>

EZWallet

\<actors are a subset of stakeholders>

User

Administrator

## Interfaces
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------| -----|
| User | Smartphone | GUI (tdb + key functions: managing transactions and categories) |
| Administrator | PC | GUI (tbd + all functions + management of users) |

# Stories and personas
\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>

## Persona 1: female, 23 y.o., student, low income, not married
Story: wants to keep track of common expenses with housemates (electrical/internet bills, food, cleaning products…) to correctly split expenses

## Persona 2: male, 51 y.o., worker, high income, married
Story: wants to track household expenses with his wife and children, such as rent, school tuition, food, electrical bills, etc.

## Persona 3: male, old age, retired, low income, married
Story: wants to keep track of how his pension is used during the month in order to have the needed amount for medicines

## Persona 4: female, 28 y.o., worker, medium income, not married.
Story: wants to keep track of travel expenses with a group of friends.

## Persona 5: other, young age, part-time worker, low income, not married
Story: wants to keep track of expenses to keep paying its school

## Persona 6: male, young age, worker, medium income, not married
Story: wants to keep track of expenses related to his ski hobby

# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

| ID        | Description  |
| ------------- |:-------------| 
| FR1 | Manage transactions/expenses |
| FR2 | Manage categories |
| FR3 | Manage users | 
| FR4 | Authentication |

## Non Functional Requirements

\<Describe constraints on functional requirements>

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
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
| Actors Involved        |  |
| ------------- |:-------------| 
|  Precondition   | User must have an account |
|  Post condition | User is authorized |
|  Nominal Scenario | User wants to be authorized |
|  Variants     | - |
|  Exceptions     | User is already logged in; User’s account doesn't exist; Wrong credentials |

##### Scenario 1.1 

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

| Scenario 1.1 | |
| ------------- |:-------------| 
|  Precondition     | User must have an account |
|  Post condition     | User is authorized |
| Step#        | Description  |
|  1 | User asks to login |  
|  2 | System asks email and password |
|  3 | User enters email and password |
|  4 | System checks, account name and password correct, user is authorized |
|  5 | Post condition: user is authorized |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2
..

### Use case x, UCx
..



# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships> 

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >




