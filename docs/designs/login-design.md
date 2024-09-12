# Architecture Design Document

## 1. Introduction

### 1.1 Purpose
This document outlines the design of a sign-in page for PH admins and volunteers. Users will be authenticated through Azure OAuth and redirected based on their role (admin or volunteer). The document focuses on the design of the sign-in page, the volunteer PIN page, and the supporting database schema.

### 1.2 Scope
The scope of this design includes the development of:
- A sign-in page redirecting to Azure OAuth for authentication.
- Role-based redirection:  admins are directed to the dashboard, while volunteers are directed to a name selection page before entering their 4-digit PIN.
- A volunteer name page where volunteers select their name and enter a 4-digit PIN for sign-in.
- A mechanism to retrieve forgotten PINs via email.
- A database schema supporting volunteer sign-ins.

The functionalities of the admin dashboard, volunteer dashboard, setting user activation status, and enrolling or deleting users are outside the scope of this document.

### 1.3 Definitions, Acronyms, and Abbreviations
- **OAuth**: Open Authorization, a protocol for secure user authentication.
- **PIN**: Personal Identification Number.

### 1.4 References
- Azure OAuth Documentation
- User Interface Design Guidelines

## 2. System Overview
The system authenticates users via Azure OAuth, enforcing that the email domain is @plymouthhousing.org. After authentication:
- Volunteers are redirected to a PIN page (such as volunteers@plymouthhousing.org).
- Administrators are redirected to the admin dashboard (for accounts not using the volunteers@plymouthhousing.org domain).

Volunteers will select their name from a dropdown and enter a 4-digit PIN to sign in.

## 3. Architecture Goals and Constraints

### 3.1 Goals
- Secure sign-in via Azure OAuth.
- Role-based redirection.
- Simple PIN-based authentication for volunteers.
- Data integrity and security for volunteer information.
- Mechanism for PIN recovery via email.


### 3.2 Constraints
- Must use Azure OAuth for authentication.
- Admin and volunteer dashboards are outside the scope of this design.
- The solution must comply with data protection and privacy regulations.
- The process for resetting a volunteer's PIN has not been finalized. It could be managed by admins via the admin page or by the volunteers themselves through a new PIN reset page.

## 4. Architectural Representations

### 4.1 High-Level Architecture Diagram
The high-level architecture includes the following components:
- **Sign-In Page**: Redirects to Azure OAuth.
- **Azure OAuth Service**: Authenticates users based on their email.
- **Volunteer Name Page**: Allows volunteers to select name using a dropdown.
- **Volunteer PIN Page**: Allows volunteers to sign in using a PIN.
- **Email Notification**: Sends email notifications for user to reset the PIN.
- **Database**: Stores volunteer details, including the PIN, activation status, and last sign-in date.

### 4.2 Component Descriptions
- **Sign-In Page**: Initial landing page for all users; redirects to Azure OAuth for authentication.
- **Azure OAuth Service**: Handles secure authentication; determines user role based on the email domain.
- **Volunteer Name Page**: Displays a dropdown of volunteers names.
- **Volunteer PIN Page**: Displays a PIN field; checks entered data against the database.
- **Email Notification via Resend API**:  Sends email notifications using the Resend API through Supabase Edge Functions. This feature is used for sending important notifications, such as PIN reset emails to volunteers. [Resend API Documentation](https://resend.com/docs/send-with-supabase-edge-functions)
- **Database**: Manages volunteer data, including name, email address, PIN, and last sign-in date.

## 5. Detailed Design

### 5.1 Subsystems and Components
#### Sign-In Page
- **Purpose**: Redirect users to Azure OAuth for authentication.
- **Input**: User clicks the Azure sign-in button.
- **Output**: Redirect to Azure OAuth login page.
- **Dependencies**: Azure OAuth Service.

#### Volunteer Name Page
- **Purpose**: Allows volunteers to choice their name using a dropdown selection.
- **Input**: Selected volunteer name.
- **Output**: Redirect to the volunteer Volunteer PIN Page.
- **Dependencies**: Database for volunteer details.
- **Additional Features**:
  - **“I don’t see my name, what do I do now”** link: When clicked, a dialog will pop up. Provides a phone number or email of a PH admin that can sort it out (either get them activated in the database, and/or let them into another account for urgent matters)
  - **Active User Filtering**: Only volunteers marked as "active" in the database will appear in the dropdown selection. This ensures that only currently active volunteers can sign in.

#### Volunteer PIN Page
- **Purpose**: Allows volunteers to authenticate using a dropdown selection and a 4-digit PIN.
- **Input**: Entered corresponding PIN.
- **Output**: Redirect to the volunteer dashboard upon successful authentication.
- **Dependencies**: Database for volunteer details.
- **Additional Features**:
  - **Temporary PIN Visibility**: When the volunteer enters their PIN, the input will be visible for 1 second and then automatically obscured, enhancing security while still providing immediate visual feedback to the user.
  - **Previous Page Button**: Allows the volunteer to return to the previous "Select Volunteer Name Page" if needed.
  - **"Forgot my PIN"** Link: When clicked, a dialog will pop up, allowing volunteers to enter their registered email to reset or retrieve their PIN. After entering the correct email, a reset link will be sent to the volunteer’s personal email with instructions to reset their PIN.
  - **Consideration**: he process for resetting a volunteer's PIN has not been finalized. It could be managed by admins via an admin page, or volunteers could reset the PIN themselves through a new self-service PIN reset page. Further discussion is needed to determine the most appropriate approach.


#### Email Notification via Resend API
- **Purpose**: Sends email notifications for PIN reset requests and other important notifications to volunteers using the Resend API integrated through Supabase Edge Functions.
- **Dependencies**:  [Resend API](https://resend.com/docs/send-with-supabase-edge-functions), [Supabase Edge Functions](https://supabase.com/docs/guides/functions).
- **Additional Details**: Supabase supports email sending through the Resend API, which is free for up to 3,000 emails per month (100 per day). This limit should be sufficient for our current needs.
- **Consideration**: We need to decide whether to use the default domain provided by Resend for email notifications or configure our own custom domain for branding and authentication purposes.


### 5.2 Data Flow
1. User accesses the sign-in page and is redirected to Azure OAuth.
2. After successful OAuth authentication, the user is redirected based on their role.
3. Volunteers are shown the volunteer PIN page.
4. The selected volunteer and entered PIN are validated against the database.
5. Upon successful validation, the volunteer is redirected to the volunteer dashboard.

## 6. Security and Compliance

### 6.1 Security Considerations
- **Azure OAuth**: Use Azure OAuth to ensure secure authentication.
- **Domain Restriction**: After a user logs in through Azure OAuth via Supabase, enforce domain restrictions by verifying that the user's email domain matches @plymouthhousing.org. This ensures that only authorized users from the organization can log in.
- **Encryption in sensitive user information**: PINs and other sensitive data should be securely stored in the database using encryption. This protects the information from being exposed in case of a data breach.
- **Data Validation**: Ensure that the PIN is exactly 4 digits long, validated both on the frontend and with server-side checks to prevent unauthorized access attempts and injection attacks.

### 6.2 Compliance Requirements
- Ensure compliance with GDPR for handling volunteer data.
  - **Data Minimization**: Only collect data that is necessary for the operation of the system. For example, storing name, email, and PIN is necessary for authentication.
  - **Encryption**: The PIN field must be encrypted using secure cryptographic algorithms, such as AES, to ensure that sensitive data is protected against unauthorized access.

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
  - **Mitigation**: Implement rate limiting, captchas, and account lockout mechanisms after multiple failed attempts.
- **Risk**: Data breaches compromising volunteer information.
  - **Mitigation**: Use encryption for sensitive data and secure access controls.

## 10. Database Schema

### Volunteer Table
| Column Name      | Data Type | Description                          |
|------------------|-----------|--------------------------------------|
| `id`             | INT       | Primary key, auto-increment.         |
| `name`     | VARCHAR   | Volunteer’s name(unique).              |
| `email`  | VARCHAR   | Volunteer’s email address(unique).  |
| `PIN`            | CHAR(4)   | 4-digit PIN for volunteer access.    |
| `last_signed_in` | DATETIME  | Timestamp of the last sign-in.       |
 |`active`	 |BOOL |	Indicates if the volunteer is active (true/false). |

## 11. Conclusion
The architecture outlined provides a secure and user-friendly approach for volunteer sign-ins using Azure OAuth and a simple PIN mechanism. The design focuses on security, performance, and scalability, ensuring that the system meets the needs of the volunteering organization.
