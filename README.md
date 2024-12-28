<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Event Management System

## Description

A NestJS-based API for managing events, attendees, and registrations.

## Features

- [x] Event Management (CRUD operations)
- [x] Attendee Management
- [x] Registration System
- [ ] Caching System
- [ ] Email Notifications
- [ ] Real-time Updates

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis
- yarn or npm

## Installation

```bash
$ yarn or npm install
```

## Running the app

- Copy `.env.example` to `.env` and update the values
- Start the PostgreSQL and Redis servers

```bash
# watch mode
$ yarn start:dev or npm run start:dev

# production mode
$ yarn start:prod or npm run start:prod
```

## Swagger api docs

Once the application is running, visit `http://localhost:5000/api-docs` to access the Swagger documentation.

## Example API Requests

### Create an Event

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2025",
    "description": "Annual technology conference",
    "date": "2025-01-01T09:00:00Z",
    "location": "Convention Center",
    "max_attendees": 100
  }'
```

### Create an Attendee

```bash
curl -X POST http://localhost:3000/attendees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### Register for an Event

```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "event-uuid",
    "attendee_id": "attendee-uuid"
  }'
```
