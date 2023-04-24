# Requirements Document - future EZWallet

Date: 

Version: V2 - description of EZWallet in FUTURE form (as proposed by the team)

 
| Version number | Change |
|:-----------------:|:-----------:|
| 1.0.1 | 2 | 


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


# Business model
This application is being developed as an open-source project. The project aims to become a self-hosted solution for users who want to manage their expenses without relying on any commercial product that may be more at risk of potential data leaks or, without the user knowing, may sell their information online. 

The community behind the project is composed of developers that work on the application in their free time. The owners of the repository on gitlab are the project leaders that guide the other developers towards predefined goals during the development phase. To support them a small bank account has been setted up to accept donations by users.

The user who sets up the service on the server has elevated privileges and can modify transactions, categories and user accounts' informations in order to intervene in case problems arise. Users can access the service through their browser to register or login and start tracking their expenses, eventually inside a group composed of other individuals. 

The system allows users to link the application to their bank account, in order to recover previous transaction informations, without having the need to input them manually.


# Stakeholders

| Stakeholder name  | Description | 
|:----------------- |:----------- |
| Project leader    | Owner of the project. He guides and supports other project developers towards realizing the intended functionalities. | 
| Project developer | He contributes in developing the application. |
| Donator 			| He donates to the project because he wants to support its continuing development. |
| User		 		| General user belonging to the project-related community that makes use of the service and talks about it. He registers or logins to the application to make use of its services and can edit his profile informations that are available to other registered users. He can see other registered users on the service instance and contact them. He can have three different roles: "System administrator", "Wallet administrator" and "Wallet user". |
| System administrator | He sets up the application on a server so that the users can make use of EZWallet services. He has elevated privileges on the server instance, allowing him to solve problems during critical situations. |
| Wallet administrator  | Owner of one or more wallets. He manages a wallet by configuring it, adding transactions and categories. He can ask other users to join his wallet. |
| Wallet user | Member of a wallet. He can add, edit and request the deletion of one or more transactions and categories. |
| Bank system | APIs used to get transactions informations automatically. |
| Currency converter system | APIs used to perform conversions between different currencies. |


# Context Diagram and interfaces
![Context diagram](V2-Images/Context%20diagram.png)

## Interfaces
| Actor | Logical Interface | Physical Interface  |
|:------|:------------------|:--------------------|
| Project leader | PC | GUI (tbd + all functions + debug features) |
| Project developer | PC | GUI (tbd + all functions + debug features) |
| System administrator | PC | GUI (tbd + all functions + management of users and wallets  + configuration of server instance) |
| Wallet administrator | PC/Smartphone | GUI (tbd + all functions + management of group settings) |
| Wallet member | PC/Smartphone | GUI (tbd + all functions) |
| Bank system | Internet connection | APIs |
| Currency converter system | Internet connection | APIs |

# Stories and personas

### Persona 1 (P1): female, 23 y.o., student, low income, not married. <br>
Interacts with the application through a web browser on her phone. <br>
Story: wants to keep track of common expenses with housemates (electrical/internet bills, food, cleaning products…) to correctly split payments.

### Persona 2 (P2): male, 51 y.o., worker, high income, married. <br>
Interacts with the application through a web browser on his desktop pc. <br>
Story: wants to track household expenses with his wife and children, such as rent, school tuition, food, electrical bills, etc. and get alerts if they are exceeding their budget.

### Persona 3 (P3): male, old age, retired, low income, married. <br>
Interacts with the application through a web browser on his desktop pc. <br>
Story: wants to keep track of how his pension is used during the month in order to have the needed amount for medicines.

### Persona 4 (P4): female, 28 y.o., worker, medium income, not married. <br>
Interacts with the application through her laptop's browser. <br>
Story: wants to keep track of travel expenses with a group of friends in order to avoid spending too much money. <br>

### Persona 5 (P5): other, young age, part-time worker, medium income, not married. <br>
Interacts with EZWallet's services through its smartphone's browser. <br>
Story: wants to keep track of expenses to make sure it can keep paying its school tuition. <br>

### Persona 6 (P6): male, young age, worker, medium income, not married. <br>
Interacts with the services by using his laptop's browser. <br>
Story: wants to keep track of expenses related to his ski hobby. <br>

### Persona 7 (P7): male, middle age, worker , high income, divorced. <br>
Interacts with the application through a browser on his desktop pc. <br>
Story: wants to keep track of travel expenses of his tour to Japan.


# Functional and non functional requirements

## Functional Requirements
| ID        | Description  |
|-----------|:-------------| 
|  FR1      | Manage transactions |
|  FR2      | Manage currencies	  |
|  FR3 		| Handle bank accounts | 
|  FR4		| Manage categories |
|  FR5		| Handle goals |
|  FR6 		| Create statistics |
|  FR7		| Manage users |
|  FR8		| Manage Wallets |
|  FR9		| Authentication |

## Non Functional Requirements

\<Describe constraints on functional requirements>

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     |   |  | |
|  NFR2     | |  | |
|  NFR3     | | | |
| NFRx .. | | | | 


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


\<next describe here each use case in the UCD>
### Use case 1, UC1
| Actors Involved        |  |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after UC is finished> |
|  Nominal Scenario     | \<Textual description of actions executed by the UC> |
|  Variants     | \<other normal executions> |
|  Exceptions     | \<exceptions, errors > |

##### Scenario 1.1 

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

| Scenario 1.1 | |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the scenario can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after scenario is finished> |
| Step#        | Description  |
|  1     |  |  
|  2     |  |
|  ...     |  |

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




