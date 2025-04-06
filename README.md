# Advanced Blog Post Management

## **Description**
An advanced blogging system that allows users to:
1. Register with a username, email, and password using autorization.
2. Create, update, fetch, delete, like and comment on blog posts, along with their associated categories.
3. Manage categories for blog posts (create/delete).
4. Receive email notifications after creating a blog post.

---

## **Features**
- **User Management**: Create, update, and fetch users.
- **Blog Post Management**: Full CRUD operations on blog posts.
- **Category Management**: Add or remove categories associated with blog posts.
- **Comment Management**: Add or remove comments on blog posts.
- **Email Notifications**: Sends notifications to users upon blog post creation.

---

## **Setup Instructions**

### Prerequisites
- Ensure Docker is installed on your machine.

### Start Project
Run the following commands in your terminal:
```bash
$ docker-compose build --no-cache
$ docker-compose up -d 
```

## Postman Collection

A Postman collection JSON file is included in the project. Download and import it into Postman to test the APIs.


## .env File Content 

```bash
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=blogPostManagement
DB_HOST=postgres
DB_PORT=5432
DATABASE_URL=postgres://postgres:postgres@postgres:5432/blogPostManagement

# Mail Configuration
BREVO_API_KEY= # Your brevo API key
MAIL= # Your email address
MAIL_PASSWORD= # Your email password
SENDER_MAIL= # The verified sender email
HOST_MAIL= # SMTP host for your email provider


SENDGRID_API_KEY= # Your sendgrid API key
SENDER_EMAIL= # Your sendgrid email

JWT_SECRET_KEY= # Your JWT key
JWT_EXPIRES_IN= # JWT expiration time
```
