# Architecture Design Document

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to outline the design of a sign-in page for a volunteering organization. This page will authenticate users through Azure OAuth and redirect them to different pages based on their role (volunteer or admin). The document focuses on the design of the sign-in page and the volunteer PIN page, with specific details on the database schema required.

### 1.2 Scope
The scope of this design includes the development of:
- A sign-in page that redirects to Azure OAuth for authentication.
- A volunteer PIN page that allows volunteers to sign in using a dropdown selection and a 4-digit PIN.
- A mechanism to retrieve forgotten PINs.
- A database schema to support volunteer sign-ins.

The admin dashboard and volunteer dashboard functionalities are outside the scope of this document.

### 1.3 Definitions, Acronyms, and Abbreviations
- **OAuth**: Open Authorization, a protocol for secure user authentication.
- **PIN**: Personal Identification Number.

### 1.4 References
- Azure OAuth Documentation
- User Interface Design Guidelines

## 2. System Overview
The system will consist of a sign-in page that authenticates users via Azure OAuth. Depending on the email address used during authentication, users will be redirected to either:
- A volunteer PIN page (for volunteers).
- An admin dashboard (for administrators).

The volunteer PIN page will present a dropdown list of all volunteers and a field to enter a 4-digit PIN. Upon successful entry, the volunteer will be redirected to a volunteer dashboard.

## 3. Architecture Goals and Constraints

### 3.1 Goals
- Provide a secure sign-in process using Azure OAuth.
- Allow volunteers to authenticate using a simple PIN mechanism.
- Ensure data integrity and security for volunteer information.
- Provide a way for volunteers to retrieve forgotten PINs.

### 3.2 Constraints
- Must use Azure OAuth for authentication.
- Admin and volunteer dashboards are outside the scope of this design.
- The solution must comply with data protection and privacy regulations.

## 4. Architectural Representations

### 4.1 High-Level Architecture Diagram
The high-level architecture includes the following components:
- **Sign-In Page**: Redirects to Azure OAuth.
- **Azure OAuth Service**: Authenticates users based on their email.
- **Volunteer PIN Page**: Allows volunteers to sign in using a dropdown and PIN.
- **Database**: Stores volunteer information, including PIN and last sign-in date.

### 4.2 Component Descriptions
- **Sign-In Page**: Initial landing page for all users; redirects to Azure OAuth for authentication.
- **Azure OAuth Service**: Handles secure authentication; determines user role based on the email domain.
- **Volunteer PIN Page**: Displays a dropdown of volunteers and a PIN field; checks entered data against the database.
- **Database**: Manages volunteer data, including first name, last name, phone number, email address, PIN, and last sign-in date.

## 5. Detailed Design

### 5.1 Subsystems and Components
#### Sign-In Page
- **Purpose**: Redirect users to Azure OAuth for authentication.
- **Input**: User clicks the sign-in button.
- **Output**: Redirect to Azure OAuth login page.
- **Dependencies**: Azure OAuth Service.

#### Volunteer PIN Page
- **Purpose**: Allows volunteers to authenticate using a dropdown selection and a 4-digit PIN.
- **Input**: Selected volunteer name and entered PIN.
- **Output**: Redirect to the volunteer dashboard upon successful authentication.
- **Dependencies**: Database for volunteer details.

### 5.2 Data Flow
1. User accesses the sign-in page and is redirected to Azure OAuth.
2. After successful OAuth authentication, the user is redirected based on their role.
3. Volunteers are shown the volunteer PIN page.
4. The selected volunteer and entered PIN are validated against the database.
5. Upon successful validation, the volunteer is redirected to the volunteer dashboard.

## 6. Security and Compliance

### 6.1 Security Considerations
- Use Azure OAuth to ensure secure authentication.
- Store PINs securely in the database with encryption.
- Implement data validation to prevent unauthorized access.

### 6.2 Compliance Requirements
- Ensure compliance with GDPR for handling volunteer data.
- Follow best practices for data encryption and storage.

## 7. Performance Considerations

### 7.1 Performance Requirements
- Authentication via Azure OAuth should be seamless and quick.
- Database queries for volunteer information should be optimized for fast response times.

### 7.2 Scalability
- The architecture should support adding more volunteers and scaling up the database as needed.
- The system should handle increased traffic during peak volunteer sign-in times.

## 8. Deployment Considerations

### 8.1 Deployment Strategy
- Deploy the web application on a cloud platform (e.g., Azure Web Services).
- Integrate Azure OAuth configurations for authentication.
- Ensure database backups and failover strategies are in place.

### 8.2 Maintenance
- Regularly update and patch the OAuth integration for security.
- Monitor the database for performance and maintain data integrity.

## 9. Risk Analysis
- **Risk**: Unauthorized access if PINs are guessed.
  - **Mitigation**: Implement rate limiting and lockout mechanisms after multiple failed attempts.
- **Risk**: Data breaches compromising volunteer information.
  - **Mitigation**: Use encryption for sensitive data and secure access controls.

## 10. Database Schema

### Volunteer Table
| Column Name      | Data Type | Description                          |
|------------------|-----------|--------------------------------------|
| `id`             | INT       | Primary key, auto-increment.         |
| `first_name`     | VARCHAR   | Volunteer’s first name.              |
| `last_name`      | VARCHAR   | Volunteer’s last name.               |
| `phone_number`   | VARCHAR   | Volunteer’s phone number.            |
| `email_address`  | VARCHAR   | Volunteer’s email address (unique).  |
| `pin`            | CHAR(4)   | 4-digit PIN for volunteer access.    |
| `last_signed_in` | DATETIME  | Timestamp of the last sign-in.       |

## 11. Conclusion
The architecture outlined provides a secure and user-friendly approach for volunteer sign-ins using Azure OAuth and a simple PIN mechanism. The design focuses on security, performance, and scalability, ensuring that the system meets the needs of the volunteering organization.
