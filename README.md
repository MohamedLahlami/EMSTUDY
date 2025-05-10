# EMStudy - Learning Management System

A full-stack Learning Management System built with Spring Boot and React, enabling quiz-based assessments and course management.

## Project Structure

```
emstudy/
├── backend/         # Spring Boot application
└── frontend/        # React application
```

## Features

### Core Functionality

- Course management and enrollment
- Quiz creation and assessment
- Student progress tracking
- Role-based access (Student/Teacher)
- Secure authentication

### Backend Features

- JWT-based authentication & authorization
- RESTful API with OpenAPI documentation
- Role-based endpoint security
- Quiz submission handling
- Course management system

### Frontend Features

- Material-UI responsive design
- Protected routes
- Role-specific dashboards
- Interactive quiz interface
- Real-time progress tracking

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.x
- Spring Security with JWT
- Spring Data JPA
- MySQL
- Maven
- OpenAPI/Swagger

### Frontend

- React 18
- Material-UI
- Axios
- React Router

## Getting Started

### Prerequisites

- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.8+

### Backend Setup

```
cd backend/EMSTUDY

# Configure database
mysql -u root -p
create database emstudy;

# Update application.properties with your credentials
# Run the application
mvn spring-boot:run
```

### Frontend Setup

```
cd frontend/Emstudy
npm install
npm start
```

## API Documentation

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Base URL: `http://localhost:8080/`

## Security

- JWT authentication
- Role-based access control
- Secure password hashing
- Protected API endpoints
- CORS configuration

## Authors

- [Mohamed Lahlami](https://github.com/MohamedLahlami)
- [Bougerfaoui Ghassane](https://github.com/ghassane04)
- Salma Jermoun
- Belguermah Mohamed Ali
- Asmaa El Meziane

## License

This project is licensed under the MIT License
