# EmailJS Setup Guide

To make the contact form work, you need to set up a free account with **EmailJS** and link it to your email provider (like Gmail).

## 1. Create an EmailJS Account
Go to [https://www.emailjs.com/](https://www.emailjs.com/) and sign up for a free account.

## 2. Add an Email Service
1.  In the EmailJS dashboard, go to the **Email Services** tab.
2.  Click **Add New Service**.
3.  Select your email provider (e.g., **Gmail**).
4.  Click **Connect Account** and log in.
5.  Click **Create Service**.
6.  **Save the `Service ID`** (e.g., `service_xyz123`). You will need this later.

## 3. Create an Email Template
1.  Go to the **Email Templates** tab.
2.  Click **Create New Template**.
3.  Design your email. You **must** use the following variable names so the form works correctly:
    *   `{{name}}` - The sender's name/email.
    *   `{{subject}}` - The subject line entered in the form.
    *   `{{message}}` - The actual message content.

    **Example Template:**
    *   **Subject:** `New Message from Portfolio: {{subject}}`
    *   **Content:**
        ```text
        You have received a new message from {{name}}.

        Message:
        {{message}}
        ```
4.  Save the template.
5.  **Save the `Template ID`** (e.g., `template_abc456`).

## 4. Get Your Public Key (User ID)
1.  Go to the **Account** tab (or click your name in the top right).
2.  Look for **Public Key**.
3.  **Save this key**.

---

## 5. Configure Credentials

### A. Local Development
1.  Copy `.env.example` to a new file named `.env`.
    ```bash
    cp .env.example .env
    ```
2.  Fill in your keys:
    ```env
    NEXT_PUBLIC_SERVICE_ID=service_xyz123
    NEXT_PUBLIC_TEMPLATE_ID=template_abc456
    NEXT_PUBLIC_USER_ID=your_public_key_here
    ```
3.  Restart your server (`npm run dev`) to load the new variables.

### B. GitHub Pages (Production)
Since you are publishing to GitHub Pages, you need to set these as **Repository Secrets** so the build process can embed them.

1.  Go to your GitHub Repository.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions** (or **Pages** depending on your build workflow, but usually Actions if using a workflow file).
3.  Add the following **Repository secrets**:
    *   `NEXT_PUBLIC_SERVICE_ID`
    *   `NEXT_PUBLIC_TEMPLATE_ID`
    *   `NEXT_PUBLIC_USER_ID`
4.  Trigger a new deployment (push a change or re-run the workflow).
