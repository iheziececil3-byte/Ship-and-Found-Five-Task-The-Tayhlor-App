# False Success: Database Connection Failure

## 1. What the User Saw

I deliberately broke the database connection by changing the database connection URL. I then restarted the development server and attempted to create a new account using the signup form.

After submitting the form, the application displayed the following error message:

> An unexpected error occurred while creating your account. Please try again later.

The application did not display a success message or indicate that the account had been created.

## 2. What Actually Happened

The database connection was unavailable when I submitted the signup form. As a result, the application could not complete the database operation required to create the new user account.

I checked the development server logs and found that the registration request returned an HTTP **500 Internal Server Error**.

This confirmed that the server encountered an error while processing the registration request.

The signup operation did not successfully create the account in the database. The user-facing error message was consistent with what actually happened.

## 3. How a Demo Reviewer Could Have Been Fooled

During a normal demonstration, a reviewer could submit the signup form, see a successful registration, and assume that the account creation feature works reliably.

However, a successful demonstration only proves that the feature works when the database connection is available. It does not prove that the application handles database failures correctly.

If I had only demonstrated the successful signup process without deliberately testing the database failure scenario, the reviewer would not have known how the application behaves when its database becomes unavailable.

This test exposed an important distinction: a feature working under normal conditions does not automatically mean it handles unexpected failures properly.

## 4. Conclusion

The deliberate database failure test showed that Tayhlor did not report a successful registration when the database operation failed. Instead, it displayed an error message to the user, while the server recorded an HTTP 500 response.

This is important because the application should never tell a user that an account has been created when the database has not successfully stored it.