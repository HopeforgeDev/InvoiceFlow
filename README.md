# 🚀 InvoiceFlow: Smart Invoice Management System

Effortlessly manage invoices with a robust SQL backend, a powerful .NET API, and a sleek AngularJS frontend. Automate invoice generation, track details, and ensure data integrity with transactional operations.

## 🌟 Features
- **Database Layer**
  - Invoice Header, Detail, and Sequence tables
  - Stored procedures for CRUD operations with automatic total calculation
  - Transaction-safe insert/update/delete operations

- **API Layer** (.NET Web API)
  - Full invoice header/detail models
  - Repository pattern with transactional support
  - RESTful endpoints for all operations

- **Client Layer** (AngularJS + DevExpress)
  - Interactive invoice listing grid
  - Modal-driven create/update flows
  - Detail management with inline editing
  - Responsive UI with DevExpress components

## 🛠 Tech Stack
**Frontend**  
![AngularJS](https://img.shields.io/badge/AngularJS-1.8.2-red)  
![DevExpress](https://img.shields.io/badge/DevExpress-23.1-blue)

**Backend**  
![.NET](https://img.shields.io/badge/.NET-7.0-purple)

**Database**  
![SQL Server](https://img.shields.io/badge/Microsoft%20SQL%20Server-2022-orange)

## 🚀 Installation

### Prerequisites
- SQL Server 2019+
- .NET 7 SDK
- Node.js 18+
- Angular CLI

```bash
# Clone repository
git clone git@github.com:HopeforgeDev/InvoiceFlow.git
cd InvoiceFlow

# Restore NuGet packages
dotnet restore

# Install client dependencies
cd ClientApp
npm install
```

Start API:
```bash
dotnet run --project InvoiceFlow.API
```

## 💻 Client Setup
```bash
cd ClientApp

# Configure API endpoint
echo 'export const environment = {
  production: false,
  apiUrl: "https://localhost:5001/api"
};' > src/environments/environment.ts

# Start Dev Server
ng serve
```

## 🔄 Transaction Flow
```mermaid
sequenceDiagram
    Client->>API: Create Invoice Header
    API->>SQL: EXEC spwv_tr_insertinvoiceheader
    SQL-->>API: Return ih_seq
    API->>Client: New Invoice ID
    
    Client->>API: Add Detail Line
    API->>SQL: EXEC spwv_tr_insertinvoicedetail
    SQL->>SQL: Update ih_total
    SQL-->>API: New detail ID
```

## 📜 License
MIT License - see [LICENSE](LICENSE) for details

---

**Happy Invoicing!** 💰📄
