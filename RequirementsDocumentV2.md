# Requirements Document - future EZWallet

Date: 

Version: V2 - description of EZWallet in FUTURE form (as proposed by the team)

 
| Version number | Change |
|:-----------------:|:-----------:|
| 1.0 | 1 | 


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
\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>


# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

| ID        | Description  |
| ------------- |:-------------:| 
|  FR1     |  |
|  FR2     |   |
| FRx..  | | 

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




