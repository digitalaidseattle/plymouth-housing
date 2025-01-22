# Architecture Design Document 

## 1. Introduction

### 1.1 Purpose
This document outlines the design of a sign-in page for PH admins and volunteers. Users will be authenticated through Azure OAuth and redirected based on their role (admin or volunteer). The document focuses on the design of the sign-in page, the volunteer PIN page, and the supporting database schema.

### 1.2 Scope
The scope of this design includes the development of:
- A sign-in page redirecting to Azure OAuth for authentication.
- Role-based redirection: admins are directed to the dashboard, while volunteers are directed to a name selection page before entering their 4-digit PIN.
- A volunteer name page where volunteers select their name and enter a 4-digit PIN for sign-in.
- A mechanism to retrieve forgotten PINs by calling an Admin.
- A **unified** database schema that supports storing both volunteer **and** admin user records in the same table.

> **Note**: The functionalities of the admin dashboard, volunteer dashboard, setting user activation status, and enrolling or deleting users are outside the scope of this document.

### 1.3 Definitions, Acronyms, and Abbreviations
- **OAuth**: Open Authorization, a protocol for secure user authentication.
- **PIN**: Personal Identification Number.

### 1.4 References
- Azure OAuth Documentation  
- User Interface Design Guidelines

---

## 2. System Overview
The system authenticates users via Azure OAuth, enforcing that the email domain is `@plymouthhousing.org`. After authentication:
- Volunteers are redirected to a PIN page.
- Administrators are redirected to the admin dashboard.

Volunteers will select their name from a dropdown and enter a 4-digit PIN to sign in.  
Admins (role = `'admin'`) do **not** require a PIN.

---

## 3. Architecture Goals and Constraints

### 3.1 Goals
- Secure sign-in via Azure OAuth.  
- Role-based redirection (volunteer vs. admin).  
- Simple PIN-based authentication for volunteers.  
- Data integrity and security for user information.  
- Mechanism for PIN recovery via phone call.

### 3.2 Constraints
- Must use Azure OAuth for initial authentication.  
- Admin and volunteer dashboards are outside the scope of this design.  
- The solution must comply with data protection and privacy regulations.  
- Process for resetting a volunteer's PIN has not been finalized; it might be managed by admins or self-service.

---

## 4. Architectural Representations

### 4.1 High-Level Architecture Diagram
Key components:
- **Sign-In Page**: Redirects to Azure OAuth.  
- **Azure OAuth Service**: Authenticates users (admin vs. volunteer).  
- **Volunteer Name Page**: Allows volunteers to select their name if `role='volunteer'`.  
- **Volunteer PIN Page**: Prompts volunteers for a 4-digit PIN.  
- **Forget PIN Flow**: A simple dialog instructing volunteers to call a PH administrator.  
- **Database**: Stores user records, including name, role, PIN (for volunteers), activation status, and last sign-in date.

### 4.2 Component Descriptions

- **Sign-In Page**  
  - Initial landing page for all users; redirects to Azure OAuth for authentication.

- **Azure OAuth Service**  
  - Handles secure authentication. Enforces domain restrictions (`@plymouthhousing.org`).  
  - Determines whether the user has the `'admin'` or `'volunteer'` role.

- **Volunteer Name Page**  
  - Displays a dropdown of **active** volunteers (pulled from the unified `Users` table where `role='volunteer' AND active=1`).  
  - If a volunteer cannot find their name, a dialog instructs them to contact an admin.

- **Volunteer PIN Page**  
  - Displays a PIN field and verifies the PIN against the `Users` table.  
  - Provides “Forgot my PIN” link → instructs to call admin.  
  - The entered PIN is briefly visible (1 second) for user feedback, then obscured.

- **Database**  
  - **Unified** for both admins and volunteers.  
  - Records:
    - `role` (`'admin'` or `'volunteer'`)  
    - `PIN` (required if `role='volunteer'`, can be `NULL` if `role='admin'`)  
    - `active` status  
    - `email` and `name` (both unique), `last_signed_in`, etc.

---

## 5. Detailed Design

### 5.1 Subsystems and Components

#### Sign-In Page
- **Purpose**: Redirect users to Azure OAuth.  
- **Input**: User clicks “Sign in with Azure” button.  
- **Output**: Redirect to Azure OAuth.  
- **Dependencies**: Azure OAuth.

#### Volunteer Name Page
- **Purpose**: Allows volunteers (`role='volunteer'`) to select their name.  
- **Input**: Selected volunteer name.  
- **Output**: Redirect to the Volunteer PIN Page.  
- **Dependencies**: Unified `Users` table for retrieving volunteer records.  
- **Additional Features**:
  - Filter only `active=1` volunteers.  
  - “I don’t see my name” → instructs user to contact admin.

#### Volunteer PIN Page
- **Purpose**: Prompt volunteers for a 4-digit PIN.  
- **Input**: PIN from user.  
- **Output**: Redirect to volunteer dashboard upon success.  
- **Dependencies**: Unified `Users` table (checks PIN).  
- **Additional Features**:
  - Temporary PIN visibility.  
  - “Forgot my PIN” link → calls admin.  
  - Return to Volunteer Name Page if needed.

### 5.2 Data Flow
1. User navigates to Sign-In Page → Azure OAuth.  
2. After OAuth success, `role` is determined: `'admin'` or `'volunteer'`.  
3. If `'volunteer'`, user proceeds to Volunteer Name + PIN.  
4. If `'admin'`, user is routed to Admin dashboard (PIN not required).  
5. Volunteers: the system verifies selected name + PIN in the `Users` table.  
6. On success, volunteer sees volunteer dashboard.

---

## 6. Security and Compliance

### 6.1 Security Considerations
- **Azure OAuth** for robust authentication.  
- **Domain Restriction**: Must match `@plymouthhousing.org`.  
- **Encrypted PIN Storage**: Volunteers' PINs are encrypted at rest.  
- **Frontend/Backend Validation**: PIN is strictly 4 digits.

### 6.2 Compliance Requirements
- **Data Minimization**: Only storing necessary info (`name`, `email`, `role`, `PIN`, etc.).  
- **Encryption**: Use secure cryptographic algorithms (AES, etc.) for PINs.

---

## 7. Performance Considerations

### 7.1 Performance Requirements
- OAuth sign-in should be quick and reliable.  
- Retrieving volunteer names from the `Users` table must be efficient.

### 7.2 Scalability
- Able to add more volunteers or handle additional admin users.  
- Handle potential spikes in sign-in requests.

---

## 8. Deployment Considerations

### 8.1 Deployment Strategy
- Hosted on Azure (Web Services).  
- Integrated with Azure OAuth configurations.  
- Database backups and failover as needed.

### 8.2 Maintenance
- Update OAuth credentials or library patches regularly.  
- Monitor database performance and integrity.

---

## 9. Risk Analysis
- **Risk**: PIN brute force or guess.  
  - **Mitigation**: Lock accounts after multiple failed attempts.  
- **Risk**: Data breach.  
  - **Mitigation**: Encrypt PIN, limit DB access with role-based policies.

---

## 10. Database Schema

> **Updated**: Volunteers and admins now share the **same** `Users` table, distinguished by `role`.

| Column Name       | Data Type    | Description                                                            |
|-------------------|-------------|------------------------------------------------------------------------|
| **id**            | INT          | Primary key, auto-increment.                                           |
| **name**          | VARCHAR(255) | User’s name (unique).                                                  |
| **email**         | VARCHAR(255) | User’s email address (unique).                                         |
| **PIN**           | CHAR(4)      | 4-digit PIN for volunteers only (NULL for admins if desired).          |
| **last_signed_in**| DATETIME     | Timestamp of last sign-in.                                             |
| **created_at**    | DATETIME     | Record creation date.                                                  |
| **active**        | BIT          | Indicates if user is active (true/false).                              |
| **role**          | VARCHAR(50)  | Must be `'volunteer'` or `'admin'` (with check constraints).           |

- **Check Constraint**:  
  - `role IN ('volunteer','admin')`  
  - If `role='volunteer'`, then `PIN IS NOT NULL AND active=1`.  
  - If `role='admin'`, no PIN required.

---

## 11. Conclusion
This architecture leverages a single `Users` table for both admins and volunteers, using a `role` field to differentiate user types. Azure OAuth is used for the initial sign-in, with volunteers additionally requiring a 4-digit PIN. The design prioritizes security (encryption, domain checks) and user-friendliness (briefly visible PIN, phone-based PIN recovery), aligning with the organization's needs for a straightforward, scalable volunteer sign-in process.
